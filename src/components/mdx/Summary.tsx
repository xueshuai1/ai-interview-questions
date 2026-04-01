interface SummaryProps {
  children: React.ReactNode;
}

export default function Summary({ children }: SummaryProps) {
  return (
    <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl">
      <p className="text-lg text-gray-700 leading-relaxed m-0">
        {children}
      </p>
    </div>
  );
}
