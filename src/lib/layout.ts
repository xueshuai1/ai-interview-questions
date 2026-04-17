// 全站布局常量 — 所有页面必须引用，禁止硬编码 max-w-*
// 新增/修改页面时，必须使用此文件的常量

export const PAGE = {
  /** 全站页面最大宽度 */
  max: 'max-w-6xl',
  /** 文章正文阅读区宽度（含 TOC 侧栏） */
  article: 'max-w-6xl',
} as const;

// 使用方式：import { PAGE } from '@/lib/layout';
// <div className={PAGE.article}>
