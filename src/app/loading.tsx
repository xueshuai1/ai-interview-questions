export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-brand-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-400 animate-spin" />
      </div>
      <p className="text-slate-400 text-lg">加载中...</p>
    </div>
  );
}
