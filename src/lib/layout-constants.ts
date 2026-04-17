// 全站布局常量 — 统一页面宽度，避免各处不一致
// 任何页面组件不得使用硬编码的 max-w-* 类名，必须引用此文件

export const LAYOUT = {
  /** 全站统一页面内容宽度 */
  content: 'max-w-6xl',
  /** 文章正文阅读区域（适合阅读行宽） */
  prose: 'max-w-4xl',
} as const;

// 使用示例：
// <div className={LAYOUT.content}>  ← 代替 className="max-w-6xl"
// <article className={LAYOUT.prose}> ← 代替 className="max-w-4xl"
