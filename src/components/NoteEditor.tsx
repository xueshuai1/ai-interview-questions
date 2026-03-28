"use client";

import { useState, useEffect } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";

interface NoteEditorProps {
  bookmarkId: string;
  initialNote?: string;
  onSave?: () => void;
}

export default function NoteEditor({
  bookmarkId,
  initialNote = "",
  onSave,
}: NoteEditorProps) {
  const { updateNote, getBookmark } = useBookmarks();
  const [note, setNote] = useState(initialNote);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const bookmark = getBookmark(bookmarkId);

  useEffect(() => {
    if (bookmark?.note) {
      setNote(bookmark.note);
    }
  }, [bookmark]);

  const handleSave = async () => {
    setSaving(true);
    updateNote(bookmarkId, note);
    setSaving(false);
    setIsEditing(false);
    onSave?.();
  };

  const handleCancel = () => {
    setNote(bookmark?.note || "");
    setIsEditing(false);
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <span className="font-semibold text-gray-800">我的笔记</span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            编辑笔记
          </button>
        )}
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录你的学习心得、重点总结或疑问..."
              className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {saving ? "保存中..." : "💾 保存"}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        ) : note ? (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {note}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-3xl block mb-2">📭</span>
            <p>还没有笔记</p>
            <p className="text-sm mt-1">点击"编辑笔记"添加你的学习心得</p>
          </div>
        )}
      </div>
    </div>
  );
}
