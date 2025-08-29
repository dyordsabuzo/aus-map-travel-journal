import { useState, useEffect, useCallback } from "react";
import { BlogMapPin } from "../../../types/BlogType";
import {
  getAllPins as getAllFirestorePins,
  addPin as addFirestorePin,
  updatePin as updateFirestorePin,
} from "../../../firebase/firestore";
import { getBlogMapPins } from "@utils/blogProcessor";

/**
 * Custom hook for managing blog pins on the map using Firestore and blog data.
 * Handles loading, adding, updating, and resetting pins.
 * Merges pins from blogs and Firestore for rendering.
 */
export function useBlogPins() {
  const [pins, setPins] = useState<BlogMapPin[]>([]);
  const [loading, setLoading] = useState(true);

  // Load pins from Firestore and blogs, then merge
  useEffect(() => {
    let mounted = true;
    const fetchPins = async () => {
      setLoading(true);
      try {
        const [firestorePins, blogPins] = await Promise.all([
          getAllFirestorePins(),
          getBlogMapPins(),
        ]);
        // Merge pins: blog pins first, then firestore pins (avoid duplicate IDs)
        const blogPinIds = new Set(blogPins.map((p) => p.id));
        const mergedPins = [
          ...blogPins,
          ...firestorePins.filter((p) => !blogPinIds.has(p.id)),
        ];
        if (mounted) {
          setPins(mergedPins);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPins();
    return () => {
      mounted = false;
    };
  }, []);

  // Add a new pin to Firestore and update state
  const addPin = useCallback(async (pin: BlogMapPin) => {
    setLoading(true);
    try {
      const id = await addFirestorePin(pin);
      setPins((prev) => [...prev, { ...pin, id }]);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a pin in Firestore and update state
  const updatePin = useCallback(
    async (id: string, pin: Partial<BlogMapPin>) => {
      setLoading(true);
      try {
        await updateFirestorePin(id, pin);
        setPins((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...pin } : p)),
        );
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Reset pins to initial state (reload from Firestore and blogs)
  const resetPins = useCallback(async () => {
    setLoading(true);
    try {
      const [firestorePins, blogPins] = await Promise.all([
        getAllFirestorePins(),
        getBlogMapPins(),
      ]);
      const blogPinIds = new Set(blogPins.map((p) => p.id));
      const mergedPins = [
        ...blogPins,
        ...firestorePins.filter((p) => !blogPinIds.has(p.id)),
      ];
      setPins(mergedPins);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pins,
    setPins,
    addPin,
    updatePin,
    resetPins,
    loading,
  };
}

export default useBlogPins;
