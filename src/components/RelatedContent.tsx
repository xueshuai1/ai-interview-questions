"use client";

import Link from "next/link";

interface RelatedItem {
  id: string;
  title: string;
  type: "article" | "question";
  url: string;
  tags?: string[];
  relevanceScore?: number;
}

interface RelatedContentProps {
  items: RelatedItem[];
  title?: string;
  currentId?: string;
}

export default function RelatedContent({
  items,
  title = "相关内容推荐",
  currentId,
}: RelatedContentProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const filteredItems = items.filter((item) => item.id !== currentId);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div className="my-12 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔗</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">
            基于当前内容的智能推荐
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.slice(0, 6).map((item, index) => (
          <Link
            key={item.id}
            href={item.url}
            className="group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0">
                {item.type === "article" ? "📄" : "❓"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {item.relevanceScore && (
                  <div className="mt-2 text-xs text-gray-500">
                    相关度：{Math.round(item.relevanceScore * 100)}%
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredItems.length > 6 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            还有 {filteredItems.length - 6} 个相关内容...
          </p>
        </div>
      )}
    </div>
  );
}
