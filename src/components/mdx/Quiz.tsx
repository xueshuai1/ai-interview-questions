"use client";

import { useState, ReactNode } from "react";

interface AnswerProps {
  correct?: boolean;
  children: ReactNode;
}

interface QuizProps {
  question: string;
  type?: "single" | "multiple";
  explanation?: string;
  children: ReactNode;
}

export function Answer({ correct = false, children }: AnswerProps) {
  return (
    <div className="answer-option" data-correct={correct}>
      {children}
    </div>
  );
}

export default function Quiz({ 
  question, 
  type = "single", 
  explanation,
  children 
}: QuizProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const answers = Array.isArray(children) ? children : [children];
  const correctAnswers = answers.filter(
    (child: any) => child?.props?.correct
  );

  const handleSelect = (answerText: string) => {
    if (submitted) return;

    if (type === "single") {
      setSelected([answerText]);
    } else {
      setSelected(prev =>
        prev.includes(answerText)
          ? prev.filter(a => a !== answerText)
          : [...prev, answerText]
      );
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;

    setSubmitted(true);
    const correctAnswerTexts = correctAnswers.map((a: any) =>
      String(a.props.children)
    );

    const allCorrect =
      selected.length === correctAnswerTexts.length &&
      selected.every(s => correctAnswerTexts.includes(s));

    setIsCorrect(allCorrect);
  };

  const handleRetry = () => {
    setSelected([]);
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📝</span>
          <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
            测验
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">{question}</h3>
        {type === "multiple" && (
          <p className="text-sm text-gray-500 mt-1">（多选题）</p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {answers.map((answer: any, index: number) => {
          const answerText = String(answer.props.children);
          const isSelected = selected.includes(answerText);
          const isCorrectAnswer = answer.props.correct;

          let buttonStyle = "bg-white hover:bg-gray-50 border-gray-200";
          if (submitted) {
            if (isCorrectAnswer) {
              buttonStyle = "bg-green-100 border-green-500 text-green-800";
            } else if (isSelected && !isCorrectAnswer) {
              buttonStyle = "bg-red-100 border-red-500 text-red-800";
            }
          } else if (isSelected) {
            buttonStyle = "bg-indigo-100 border-indigo-500 text-indigo-800";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(answerText)}
              disabled={submitted}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${buttonStyle}`}
            >
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-current text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{answerText}</span>
                {submitted && isCorrectAnswer && (
                  <span className="text-green-600">✅</span>
                )}
                {submitted && isSelected && !isCorrectAnswer && (
                  <span className="text-red-600">❌</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
        >
          提交答案
        </button>
      ) : (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              isCorrect
                ? "bg-green-100 border-2 border-green-500"
                : "bg-red-100 border-2 border-red-500"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">
                {isCorrect ? "🎉" : "💪"}
              </span>
              <span
                className={`font-bold ${
                  isCorrect ? "text-green-800" : "text-red-800"
                }`}
              >
                {isCorrect ? "回答正确！" : "回答错误"}
              </span>
            </div>
            {explanation && (
              <div className="text-sm text-gray-700 mt-2">
                <strong>解析：</strong>
                {explanation}
              </div>
            )}
          </div>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
}
