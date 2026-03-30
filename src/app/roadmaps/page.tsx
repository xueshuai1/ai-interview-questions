import Link from "next/link";

export default function RoadmapsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">🗺️ 学习路径</h1>
          <p className="text-gray-600 mt-2">系统化学习 AI 技术，从入门到精通</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* 图标 */}
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-6xl">
            🗺️
          </div>

          {/* 标题 */}
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            学习路径正在规划中
          </h2>

          {/* 描述 */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            我们正在为每个技术领域精心设计系统化学习路径，<br />
            帮助你从零基础到精通，循序渐进地掌握 AI 技术。
          </p>

          {/* 预计上线时间 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <p className="text-blue-800 font-medium">
              📅 预计上线时间：2026 年 4 月中旬
            </p>
          </div>

          {/* 推荐操作 */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              href="/knowledge"
              className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-200 hover:border-blue-300"
            >
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                浏览知识库
              </h3>
              <p className="text-sm text-gray-600">
                先系统学习基础知识，再来查看学习路径
              </p>
            </Link>

            <Link
              href="/interview"
              className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-200 hover:border-green-300"
            >
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600">
                面试题库
              </h3>
              <p className="text-sm text-gray-600">
                查看精选面试题，检验学习成果
              </p>
            </Link>
          </div>

          {/* 进度预告 */}
          <div className="mt-16 text-left bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              📋 规划中的学习路径
            </h3>

            <div className="space-y-6">
              {/* 路径 1 */}
              <div className="border-l-4 border-blue-500 pl-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  机器学习入门路径
                </h4>
                <p className="text-gray-600 mb-3">
                  从 Python 基础到机器学习算法，适合零基础学习者
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    8 周
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    初级
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    20 个知识点
                  </span>
                </div>
              </div>

              {/* 路径 2 */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  深度学习进阶路径
                </h4>
                <p className="text-gray-600 mb-3">
                  掌握神经网络、CNN、RNN、Transformer 等核心技术
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    12 周
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    中级
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    35 个知识点
                  </span>
                </div>
              </div>

              {/* 路径 3 */}
              <div className="border-l-4 border-green-500 pl-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  大模型工程师路径
                </h4>
                <p className="text-gray-600 mb-3">
                  从 Transformer 到 LLM 应用开发，成为大模型工程师
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    16 周
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                    高级
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    50+ 个知识点
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 通知订阅 */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <p className="text-gray-700 mb-4">
              📬 想第一时间获取学习路径上线通知？
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/knowledge"
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                先学习基础知识
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-gray-200 mt-auto">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}
