"use client";

import { useState } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";

interface BookmarkButtonProps {
  id: string;
  type: "article" | "question";
  title: string;
  url: string;
  defaultTags?: string[];
}

export default function BookmarkButton({
  id,
  type,
  title,
  url,
  defaultTags = [],
}: BookmarkButtonProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const [showTooltip, setShowTooltip] = useState(false);

  const bookmarked = isBookmarked(id);

  const handleClick = () => {
    if (bookmarked) {
      removeBookmark(id);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } else {
      const success = addBookmark({
        id,
        type,
        title,
        url,
        tags: defaultTags,
      });
      if (success) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          bookmarked
            ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-400"
            : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-yellow-300"
        }`}
      >
        <span className="text-lg">
          {bookmarked ? "⭐" : "☆"}
        </span>
        <span className="text-sm">
          {bookmarked ? "已收藏" : "收藏"}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 animate-fade-in">
          {bookmarked ? "已取消收藏" : "已添加到收藏夹"}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-transparent border-b-gray-900" />
        </div>
      )}
    </div>
  );
}
