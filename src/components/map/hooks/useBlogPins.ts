import { useState, useEffect, useCallback } from "react";
import { BlogMapPin } from "../../../types/BlogType";
import { getBlogMapPins } from "@utils/blogProcessor";

/**
 * Custom hook for managing blog pins on the map.
 * Handles loading, adding, and resetting pins.
 */
export function useBlogPins() {
  const [pins, setPins] = useState<BlogMapPin[]>([]);
  const [loading, setLoading] = useState(true);

  // Load pins from blogProcessor
  useEffect(() => {
    let mounted = true;
    const fetchPins = async () => {
      setLoading(true);
      const blogPins = await getBlogMapPins();
      if (mounted) {
        setPins(blogPins);
        setLoading(false);
      }
    };
    fetchPins();
    return () => {
      mounted = false;
    };
  }, []);

  // Add a new pin to the map
  const addPin = useCallback((pin: BlogMapPin) => {
    setPins((prev) => [...prev, pin]);
  }, []);

  // Reset pins to initial state (reload from blogProcessor)
  const resetPins = useCallback(async () => {
    setLoading(true);
    const blogPins = await getBlogMapPins();
    setPins(blogPins);
    setLoading(false);
  }, []);

  return {
    pins,
    setPins,
    addPin,
    resetPins,
    loading,
  };
}

export default useBlogPins;
