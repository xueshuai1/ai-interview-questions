"use client";

import { ReactNode } from "react";

interface ComparisonItem {
  title: string;
  items: string[];
  pros?: string[];
  cons?: string[];
}

interface ComparisonProps {
  items: ComparisonItem[];
  title?: string;
}

export default function Comparison({ items, title }: ComparisonProps) {
  return (
    <div className="my-8">
      {title && (
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h3>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
              {items.map((item, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-white font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.title.split(" ")[0]}</span>
                    <span>{item.title}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              {items.map((item, index) => (
                <td key={index} className="px-6 py-4 align-top">
                  <div className="space-y-2">
                    {item.items.map((text, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-200 bg-green-50">
              {items.map((item, index) => (
                <td key={index} className="px-6 py-4 align-top">
                  {item.pros && item.pros.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-green-800 font-semibold text-sm">
                          优势
                        </span>
                      </div>
                      <div className="space-y-1">
                        {item.pros.map((pro, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-green-700">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </td>
              ))}
            </tr>
            <tr className="bg-red-50">
              {items.map((item, index) => (
                <td key={index} className="px-6 py-4 align-top">
                  {item.cons && item.cons.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span className="text-red-800 font-semibold text-sm">
                          劣势
                        </span>
                      </div>
                      <div className="space-y-1">
                        {item.cons.map((con, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
