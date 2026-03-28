"use client";

import { useState, useEffect, useCallback } from "react";

export interface Bookmark {
  id: string;
  type: "article" | "question";
  title: string;
  url: string;
  tags: string[];
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = "ai-learning-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载收藏数据
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: Bookmark[] = JSON.parse(stored);
        setBookmarks(data);
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存收藏数据
  const saveBookmarks = useCallback((newBookmarks: Bookmark[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error("Failed to save bookmarks:", error);
    }
  }, []);

  // 添加收藏
  const addBookmark = useCallback((bookmark: Omit<Bookmark, "createdAt" | "updatedAt">) => {
    const exists = bookmarks.some((b) => b.id === bookmark.id);
    if (exists) {
      return false;
    }

    const newBookmark: Bookmark = {
      ...bookmark,
      createdAt: new Date().toISOString(),
    };

    saveBookmarks([...bookmarks, newBookmark]);
    return true;
  }, [bookmarks, saveBookmarks]);

  // 移除收藏
  const removeBookmark = useCallback((id: string) => {
    saveBookmarks(bookmarks.filter((b) => b.id !== id));
  }, [bookmarks, saveBookmarks]);

  // 更新笔记
  const updateNote = useCallback((id: string, note: string) => {
    const updated = bookmarks.map((b) =>
      b.id === id
        ? { ...b, note, updatedAt: new Date().toISOString() }
        : b
    );
    saveBookmarks(updated);
  }, [bookmarks, saveBookmarks]);

  // 添加标签
  const addTag = useCallback((id: string, tag: string) => {
    const updated = bookmarks.map((b) =>
      b.id === id && !b.tags.includes(tag)
        ? { ...b, tags: [...b.tags, tag], updatedAt: new Date().toISOString() }
        : b
    );
    saveBookmarks(updated);
  }, [bookmarks, saveBookmarks]);

  // 移除标签
  const removeTag = useCallback((id: string, tag: string) => {
    const updated = bookmarks.map((b) =>
      b.id === id
        ? { ...b, tags: b.tags.filter((t) => t !== tag), updatedAt: new Date().toISOString() }
        : b
    );
    saveBookmarks(updated);
  }, [bookmarks, saveBookmarks]);

  // 检查是否已收藏
  const isBookmarked = useCallback((id: string) => {
    return bookmarks.some((b) => b.id === id);
  }, [bookmarks]);

  // 获取收藏
  const getBookmark = useCallback((id: string) => {
    return bookmarks.find((b) => b.id === id) || null;
  }, [bookmarks]);

  // 按标签筛选
  const filterByTag = useCallback((tag: string) => {
    return bookmarks.filter((b) => b.tags.includes(tag));
  }, [bookmarks]);

  // 搜索收藏
  const search = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.note?.toLowerCase().includes(lowerQuery) ||
        b.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }, [bookmarks]);

  // 获取所有标签
  const getAllTags = useCallback(() => {
    const tagSet = new Set<string>();
    bookmarks.forEach((b) => b.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [bookmarks]);

  // 统计
  const stats = {
    total: bookmarks.length,
    articles: bookmarks.filter((b) => b.type === "article").length,
    questions: bookmarks.filter((b) => b.type === "question").length,
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    updateNote,
    addTag,
    removeTag,
    isBookmarked,
    getBookmark,
    filterByTag,
    search,
    getAllTags,
    stats,
  };
}
