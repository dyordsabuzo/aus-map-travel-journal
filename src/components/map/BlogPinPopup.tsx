import React from "react";
import { BlogMapPin } from "../../types/BlogType";

const BlogPinPopup: React.FC<{ pin: BlogMapPin }> = ({ pin }) => (
  <div className="flex items-center gap-3">
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
            width: 54,
            height: 54,
            objectFit: "cover",
            boxSizing: "border-box",
            marginRight: 0,
            display: "inline-block",
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
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-lg mb-1">{pin.title}</h4>
      {pin.date && (
        <div className="text-xs text-gray-500 mb-1">
          Date: {new Date(pin.date).toLocaleDateString()}
        </div>
      )}
      {pin.description && (
        <p className="text-gray-700 mb-2">{pin.description}</p>
      )}
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
    </div>
  </div>
);

export default BlogPinPopup;
