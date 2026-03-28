"use client";

interface CompletionBadgeProps {
  completed: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function CompletionBadge({
  completed,
  size = "md",
  showLabel = true,
}: CompletionBadgeProps) {
  const sizes = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
  };

  if (!completed) {
    return (
      <div className={`inline-flex items-center gap-2 ${showLabel ? "px-3 py-1.5 bg-gray-100" : ""} rounded-full`}>
        <div className={`${sizes[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
          <span>⭕</span>
        </div>
        {showLabel && (
          <span className="text-sm text-gray-600 font-medium">未完成</span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border-2 border-green-300 shadow-sm">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md animate-bounce`}>
        <span>✅</span>
      </div>
      {showLabel && (
        <span className="text-sm text-green-800 font-bold">已完成</span>
      )}
    </div>
  );
}
