import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BlogMapPin } from "../../../types/BlogType";
import {
  getAllPins as getAllFirestorePins,
  addPin as addFirestorePin,
  updatePin as updateFirestorePin,
  deletePin as deleteFirestorePin,
} from "../../../firebase/firestore";
import { getBlogMapPins } from "@utils/blogProcessor";
import { Logger } from "@/utils/logger";

/**
 * Custom hook for managing blog pins on the map using Firestore and blog data.
 * Handles loading, adding, updating, and resetting pins.
 * Merges pins from blogs and Firestore for rendering.
 * Uses React Query for caching and mutations.
 */
export function useBlogPins() {
  const queryClient = useQueryClient();

  // Fetch pins from Firestore and blogs, merge and cache
  const { data: pins = [], isLoading: loading } = useQuery<BlogMapPin[]>({
    queryKey: ["pins", "all"],
    queryFn: async () => {
      try {
        const [firestorePins, blogPins] = await Promise.all([
          getAllFirestorePins(),
          getBlogMapPins(),
        ]);
        const blogPinIds = new Set(blogPins.map((p) => p.id));
        return [
          ...blogPins,
          ...firestorePins.filter((p) => !blogPinIds.has(p.id)),
        ];
      } catch (error) {
        Logger.error("Failed to fetch pins:", error);
        return [];
      }
    },
    cacheTime: 1000 * 60 * 10, // 10 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutations for add/update/delete
  const addPinMutation = useMutation({
    mutationFn: addFirestorePin,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pins", "all"] }),
  });

  const updatePinMutation = useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: Partial<BlogMapPin> }) =>
      updateFirestorePin(id, pin),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pins", "all"] }),
  });

  const deletePinMutation = useMutation({
    mutationFn: deleteFirestorePin,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pins", "all"] }),
  });

  return {
    pins,
    loading,
    addPin: addPinMutation.mutateAsync,
    updatePin: updatePinMutation.mutateAsync,
    deletePin: deletePinMutation.mutateAsync,
    resetPins: () =>
      queryClient.invalidateQueries({ queryKey: ["pins", "all"] }),
  };
}

export default useBlogPins;
