"use client";

import Link from "next/link";

interface LearningPathItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  completed?: boolean;
  order: number;
  estimatedTime?: string;
}

interface LearningPathProps {
  items: LearningPathItem[];
  title?: string;
  currentId?: string;
}

export default function LearningPath({
  items,
  title = "推荐学习路径",
  currentId,
}: LearningPathProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="my-12 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🗺️</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">
            按顺序学习，效果更佳
          </p>
        </div>
      </div>

      <div className="relative">
        {/* 连接线 */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-300 to-transparent" />

        <div className="space-y-4">
          {sortedItems.map((item, index) => {
            const isCurrent = item.id === currentId;
            const isCompleted = item.completed;
            const isNext = index === sortedItems.findIndex((i) => i.id === currentId) + 1;

            return (
              <Link
                key={item.id}
                href={item.url}
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? "bg-white border-emerald-500 shadow-lg"
                    : isCompleted
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-white border-gray-200 hover:border-emerald-300"
                }`}
              >
                {/* 步骤编号 */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-200"
                      : isNext
                      ? "bg-amber-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isCompleted ? "✅" : item.order}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`font-bold ${
                        isCurrent
                          ? "text-emerald-800"
                          : isCompleted
                          ? "text-emerald-700"
                          : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full">
                        当前学习
                      </span>
                    )}
                    {isNext && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                        下一步
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}

                  {item.estimatedTime && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>⏱️</span>
                      <span>预计 {item.estimatedTime}</span>
                    </div>
                  )}
                </div>

                <div className="text-gray-400 group-hover:text-emerald-600 transition-colors">
                  →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
