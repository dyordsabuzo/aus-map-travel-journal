import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useBlogPins } from "../map/hooks/useBlogPins";
import { logout } from "../../firebase/auth";
import { useAlert } from "@components/common/AlertContext";
import { getAuth, updateProfile } from "firebase/auth";
import TravelStatsBox from "../map/TravelStatsBox/TravelStatsBox";
import {
  calculateMileage,
  getUniqueTowns,
  getTownsPerState,
} from "../map/TravelStatsBox/utils";
import { BlogMapPin } from "@/types/BlogType";

const UserProfileBox: React.FC = () => {
  const { user } = useAuth();
  const { pins } = useBlogPins();
  const { showAlert } = useAlert();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [loading, setLoading] = useState(false);

  // Travel stats box state
  const [showStats, setShowStats] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Travel stats calculation
  const mileageKm = calculateMileage(pins);
  const townsVisited = getUniqueTowns(pins).length;
  const stateExtractor = (pin: BlogMapPin) =>
    pin.category || (pin.tags && pin.tags.length > 0 ? pin.tags[0] : undefined);
  const townsPerState = getTownsPerState(pins, stateExtractor);

  // Click outside handler for stats box
  useEffect(() => {
    if (!showStats) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        statsRef.current &&
        !statsRef.current.contains(event.target as Node) &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowStats(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStats]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    showAlert({
      message: "You have been logged out.",
      type: "info",
      duration: 4000,
    });
  };

  const handleEditProfile = () => {
    setEditing(true);
    setDisplayName(user.displayName || "");
    setPhotoURL(user.photoURL || "");
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      await updateProfile(auth.currentUser!, {
        displayName,
        photoURL,
      });
      showAlert({
        message: "Profile updated!",
        type: "success",
        duration: 3000,
      });
      setEditing(false);
    } catch (err: any) {
      showAlert({
        message: "Failed to update profile.",
        type: "error",
        duration: 4000,
      });
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 left-8 z-[1000] min-w-[260px]">
      {/* Overlay for click outside to close stats */}
      {showStats && (
        <div
          className="fixed inset-0 z-[899] bg-transparent"
          onClick={() => setShowStats(false)}
          aria-hidden="true"
        />
      )}
      {/* Sliding Travel Stats Box */}
      <div
        ref={statsRef}
        className={`absolute left-0 bottom-0 w-full max-w-xs sm:max-w-sm md:max-w-md transition-all duration-500 ${
          showStats
            ? "translate-y-[-470%] opacity-100 z-[1001]"
            : "translate-y-0 opacity-0 z-[1001] pointer-events-none"
        } bg-gradient-to-t from-blue-50 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700`}
        style={{ willChange: "transform" }}
      >
        {/* Arrow indicator */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-[1002]">
          <svg width="32" height="16" fill="none">
            <path
              d="M0 16 Q16 0 32 16"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <div className="relative px-4 pt-4 pb-2">
          {/* Title bar with icon */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-lg text-blue-700 dark:text-blue-300 flex items-center">
              <svg className="inline mr-1" width="20" height="20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="9"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <path d="M10 5v5l3 3" stroke="#3b82f6" strokeWidth="2" />
              </svg>
              Travel statistics
            </span>
          </div>
          <TravelStatsBox
            stats={{
              mileageKm,
              townsVisited,
              townsPerState,
            }}
            title=""
            className="rounded-lg shadow-none border-none"
          />
          {/* Fade-in close button */}
          <button
            className={`absolute top-2 right-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 z-[1010] transition-opacity duration-300 ${
              showStats ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setShowStats(false)}
            aria-label="Close travel statistics"
          >
            &times;
          </button>
        </div>
      </div>
      {/* Profile Box */}
      <div
        ref={profileRef}
        className="relative z-[1011] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 cursor-pointer"
        onClick={() => setShowStats((v) => !v)}
      >
        {editing ? (
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs font-semibold">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border px-2 py-1 rounded"
              disabled={loading}
            />
            <label className="text-xs font-semibold">Photo URL</label>
            <input
              type="text"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="border px-2 py-1 rounded"
              disabled={loading}
            />
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded text-xs"
                onClick={() => setEditing(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full border"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-800 dark:text-gray-100 truncate">
                {user.displayName || user.email}
              </div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                Pins created:{" "}
                <span className="font-semibold">{pins.length}</span>
              </div>
            </div>
            <button
              className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
              onClick={handleEditProfile}
              title="Edit Profile"
            >
              Edit
            </button>
            <button
              className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfileBox;
