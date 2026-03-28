"use client";

interface ProgressBarProps {
  percentage: number;
  total?: number;
  completed?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  percentage,
  total,
  completed,
  size = "md",
  showLabel = true,
  animated = true,
}: ProgressBarProps) {
  const heights = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const getColor = (pct: number) => {
    if (pct >= 100) return "from-green-500 to-emerald-600";
    if (pct >= 75) return "from-blue-500 to-indigo-600";
    if (pct >= 50) return "from-yellow-500 to-orange-600";
    return "from-gray-400 to-gray-500";
  };

  const getEmoji = (pct: number) => {
    if (pct >= 100) return "🎉";
    if (pct >= 75) return "🚀";
    if (pct >= 50) return "💪";
    if (pct >= 25) return "📈";
    return "🌱";
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getEmoji(percentage)}</span>
            <span className="text-sm font-medium text-gray-700">
              学习进度
            </span>
          </div>
          <div className="text-sm font-bold text-gray-900">
            {percentage}%
            {total !== undefined && completed !== undefined && (
              <span className="text-gray-500 font-normal ml-1">
                ({completed}/{total})
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className={`w-full ${heights[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${getColor(percentage)} transition-all duration-700 ease-out ${
            animated ? "animate-pulse" : ""
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {percentage >= 100 && (
        <p className="mt-2 text-sm text-green-700 font-medium text-center">
          🎊 恭喜！已完成所有学习内容！
        </p>
      )}
    </div>
  );
}
