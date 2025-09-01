import React from "react";
import { BlogMapPin } from "../../types/BlogType";
import { useAuth } from "@components/auth/AuthContext";

const BlogPinPopup: React.FC<{
  pin: BlogMapPin;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ pin, onEdit, onDelete }) => {
  const { user } = useAuth();

  const isUserPin = user && pin.userId === user.uid;

  return (
    <div className="flex items-center gap-2 w-full">
      <a
        href={pin.blogUrl}
        className="block"
        style={{ lineHeight: 0 }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {pin.featuredPhoto ? (
          <img
            src={pin.featuredPhoto}
            alt={pin.title}
            className="shadow rounded-xl"
            style={{
              width: "auto",
              height: 54,
              objectFit: "cover",
              boxSizing: "border-box",
              marginRight: 0,
              display: "inline-block",
              background: "#f3f3f3",
            }}
            onError={(e) => {
              // fallback to default icon if image fails to load
              (e.target as HTMLImageElement).style.display = "none";
              const fallback = document.createElement("div");
              fallback.className =
                "rounded-full border-4 border-gray-400 bg-gray-300 flex items-center justify-center";
              fallback.style.width = "54px";
              fallback.style.height = "54px";
              fallback.style.marginRight = "0px";
              fallback.style.display = "inline-block";
              fallback.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="15" y2="9"/></svg>`;
              (e.target as HTMLImageElement).parentNode?.appendChild(fallback);
            }}
          />
        ) : (
          <div
            className="rounded-full border-4 border-gray-400 bg-gray-300 flex items-center justify-center"
            style={{
              width: 54,
              height: 54,
              marginRight: 0,
              display: "inline-block",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="gray"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="15" x2="16" y2="15" />
              <line x1="9" y1="9" x2="15" y2="9" />
            </svg>
          </div>
        )}
      </a>
      <div className="flex-1 min-w-52">
        <h4 className="font-bold text-lg mb-1">{pin.title}</h4>
        {pin.date && (
          <div className="text-xs text-gray-500 mb-1">
            Date: {new Date(pin.date).toLocaleDateString()}
          </div>
        )}
        {pin.description && (
          <p className="text-gray-700 mb-2">{pin.description}</p>
        )}
        {pin.type && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 mr-1">
              Type:{" "}
              {pin.type === "destination"
                ? "Destination"
                : pin.type === "home"
                  ? "Home"
                  : pin.type === "fuel"
                    ? "Fuel"
                    : "Stopover"}
            </span>
          </div>
        )}
        <div className="mb-2">
          <span className="inline-block px-2 py-1 rounded text-xs bg-green-100 text-green-700 mr-1">
            Distance traveled:{" "}
            {typeof pin.distance === "number" ? pin.distance : 0} km
          </span>
        </div>
        <div className="mb-2">
          <span className="inline-block px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 mr-1">
            Accommodation cost: $
            {typeof pin.accommodationCost === "number"
              ? pin.accommodationCost
              : 0}
          </span>
        </div>
        {/*{pin.tags && pin.tags.length > 0 && (
          <div className="mb-2">
            {pin.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 mr-1"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}*/}
        {/*{pin.category && (
          <div className="text-xs text-gray-500 mb-1">
            Category: {pin.category}
          </div>
        )}*/}
        {/*<a
          href={pin.blogUrl}
          className="text-blue-600 hover:underline text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read Blog Post
        </a>*/}
        {pin.featured && (
          <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
            ⭐ Featured
          </span>
        )}
        {isUserPin && (
          <div className="mt-2 flex gap-2">
            <button
              className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPinPopup;
