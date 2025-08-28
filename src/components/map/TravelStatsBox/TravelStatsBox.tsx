import React, { useState } from "react";

export interface TravelStats {
  mileageKm: number;
  townsVisited: number;
  townsPerState: Record<string, number>;
}

export interface TravelStatsBoxProps {
  stats: TravelStats;
  className?: string;
  style?: React.CSSProperties;
}

const TravelStatsBox: React.FC<TravelStatsBoxProps> = ({
  stats,
  className = "",
  style,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={`absolute top-20 left-3 z-[1000] w-72 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all opacity-80 ${className}`}
      style={style}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg cursor-pointer focus:outline-none"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls="travel-stats-content"
      >
        <span className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
          Travel statistics
        </span>
        <span className="ml-2 text-gray-500 dark:text-gray-300">
          {expanded ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 15l6-6 6 6"
              />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9l6 6 6-6"
              />
            </svg>
          )}
        </span>
      </button>
      <div
        id="travel-stats-content"
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3">
          <div className="mb-2 flex items-center">
            <span className="font-medium text-gray-700 dark:text-gray-200 mr-2">
              Mileage:
            </span>
            <span className="text-blue-600 dark:text-blue-300 font-bold">
              {stats.mileageKm.toLocaleString()} km
            </span>
          </div>
          <div className="mb-2 flex items-center">
            <span className="font-medium text-gray-700 dark:text-gray-200 mr-2">
              Towns visited:
            </span>
            <span className="text-green-600 dark:text-green-300 font-bold">
              {stats.townsVisited}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Towns per state:
            </span>
            <ul className="mt-1 ml-2">
              {Object.entries(stats.townsPerState).map(([state, count]) => (
                <li
                  key={state}
                  className="text-sm text-gray-600 dark:text-gray-300 flex justify-between"
                >
                  <span>{state}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelStatsBox;
