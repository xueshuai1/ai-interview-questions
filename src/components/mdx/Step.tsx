"use client";

import { ReactNode } from "react";

interface StepProps {
  number: number;
  title: string;
  children: ReactNode;
  icon?: string;
}

export default function Step({ number, title, children, icon }: StepProps) {
  return (
    <div className="my-6 relative pl-12">
      {/* 连接线 */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-transparent" />
      
      {/* 步骤编号 */}
      <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-lg">
          {icon || number}
        </div>
      </div>

      {/* 内容 */}
      <div className="bg-white border-2 border-indigo-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          步骤 {number}: {title}
        </h3>
        <div className="text-gray-700 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
