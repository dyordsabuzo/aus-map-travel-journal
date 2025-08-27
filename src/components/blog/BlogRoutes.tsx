import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  Routes,
  Route,
} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { BlogList } from "./BlogList";
import { BlogViewer } from "./BlogViewer";

// Main BlogRoutes component to be used in App.tsx
export const BlogRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<BlogList />} />
    <Route path="/:slug" element={<BlogViewer />} />
  </Routes>
);
