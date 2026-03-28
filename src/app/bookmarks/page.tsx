"use client";

import { useState } from "react";
import Link from "next/link";
import { useBookmarks } from "@/hooks/useBookmarks";
import CompletionBadge from "@/components/CompletionBadge";
import NoteEditor from "@/components/NoteEditor";

export default function BookmarksPage() {
  const { bookmarks, loading, removeBookmark, search, getAllTags, filterByTag, stats } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const allTags = getAllTags();

  const filteredBookmarks = searchQuery
    ? search(searchQuery)
    : selectedTag
    ? filterByTag(selectedTag)
    : bookmarks;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">加载收藏夹...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">⭐ 我的收藏夹</h1>
            <p className="text-indigo-100 text-lg">
              收藏了 {stats.total} 个内容 · {stats.articles} 篇文章 · {stats.questions} 道题目
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 搜索和筛选 */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索收藏内容..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                网格
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  viewMode === "list"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                列表
              </button>
            </div>
          </div>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTag === null
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTag === tag
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 内容列表 */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4">📭</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {searchQuery ? "没有找到匹配的内容" : "收藏夹是空的"}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "尝试其他搜索词"
                : "浏览文章和题目时点击收藏按钮添加到这里"}
            </p>
            <Link
              href="/knowledge"
              className="inline-block mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              去探索内容
            </Link>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className={`bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {bookmark.type === "article" ? "📄" : "❓"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          bookmark.type === "article"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {bookmark.type === "article" ? "文章" : "题目"}
                      </span>
                    </div>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="取消收藏"
                    >
                      🗑️
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {bookmark.title}
                  </h3>

                  {bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bookmark.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Link
                      href={bookmark.url}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      查看内容 →
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(bookmark.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>

                  {bookmark.note && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() =>
                          setExpandedNote(
                            expandedNote === bookmark.id ? null : bookmark.id
                          )
                        }
                        className="text-sm text-gray-600 hover:text-indigo-600"
                      >
                        📝 {expandedNote === bookmark.id ? "收起笔记" : "查看笔记"}
                      </button>
                      {expandedNote === bookmark.id && (
                        <div className="mt-2 p-3 bg-yellow-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                          {bookmark.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
