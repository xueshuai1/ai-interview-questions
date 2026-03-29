/**
 * 文章索引 API
 * 提供按分类和文章 ID 查询相邻文章的功能
 */

import { NextRequest, NextResponse } from 'next/server';

interface ArticleIndex {
  id: string;
  title: string;
  order: number;
  summary: string;
  keyPoints: string[];
  estimatedTime: string;
}

interface CategoryIndex {
  category: string;
  name: string;
  articles: ArticleIndex[];
}

// 预加载的分类索引（构建时读取）
const CATEGORY_INDEXES: Record<string, CategoryIndex> = {
  ML: {
    category: "ML",
    name: "机器学习基础",
    articles: [
      {
        id: "ml-001",
        title: "什么是机器学习？",
        order: 1,
        summary: "机器学习的基础概念和分类",
        keyPoints: ["监督学习", "无监督学习", "强化学习"],
        estimatedTime: "10 分钟"
      },
      {
        id: "ml-002",
        title: "什么是过拟合？如何防止？",
        order: 2,
        summary: "过拟合现象及其解决方案",
        keyPoints: ["正则化", "Dropout", "数据增强"],
        estimatedTime: "15 分钟"
      },
      {
        id: "ml-003",
        title: "监督学习算法详解",
        order: 3,
        summary: "常见监督学习算法原理与应用",
        keyPoints: ["线性回归", "逻辑回归", "决策树"],
        estimatedTime: "20 分钟"
      },
      {
        id: "ml-004",
        title: "无监督学习算法",
        order: 4,
        summary: "聚类、降维等无监督学习方法",
        keyPoints: ["K-Means", "PCA", "层次聚类"],
        estimatedTime: "18 分钟"
      },
      {
        id: "ml-005",
        title: "模型评估与选择",
        order: 5,
        summary: "如何评估和选择最优模型",
        keyPoints: ["交叉验证", "混淆矩阵", "ROC 曲线"],
        estimatedTime: "15 分钟"
      }
    ]
  },
  DL: {
    category: "DL",
    name: "深度学习进阶",
    articles: [
      {
        id: "dl-001",
        title: "神经网络基础",
        order: 1,
        summary: "神经网络的基本原理和结构",
        keyPoints: ["神经元", "激活函数", "反向传播"],
        estimatedTime: "15 分钟"
      },
      {
        id: "dl-002",
        title: "卷积神经网络 CNN",
        order: 2,
        summary: "CNN 架构及其在图像处理中的应用",
        keyPoints: ["卷积层", "池化层", "全连接层"],
        estimatedTime: "20 分钟"
      },
      {
        id: "dl-003",
        title: "RNN 与 LSTM",
        order: 3,
        summary: "循环神经网络及其变体",
        keyPoints: ["RNN", "LSTM", "GRU"],
        estimatedTime: "25 分钟"
      },
      {
        id: "dl-004",
        title: "Transformer 架构",
        order: 4,
        summary: "Transformer 模型详解",
        keyPoints: ["Self-Attention", "Encoder-Decoder", "Position Encoding"],
        estimatedTime: "30 分钟"
      }
    ]
  },
  NLP: {
    category: "NLP",
    name: "自然语言处理",
    articles: [
      {
        id: "nlp-001",
        title: "词向量基础",
        order: 1,
        summary: "词向量的概念和表示方法",
        keyPoints: ["Word2Vec", "GloVe", "词嵌入"],
        estimatedTime: "15 分钟"
      },
      {
        id: "nlp-002",
        title: "Word2Vec 详解",
        order: 2,
        summary: "Word2Vec 算法原理与实现",
        keyPoints: ["CBOW", "Skip-gram", "负采样"],
        estimatedTime: "20 分钟"
      },
      {
        id: "nlp-003",
        title: "文本分类",
        order: 3,
        summary: "文本分类方法与应用",
        keyPoints: ["朴素贝叶斯", "SVM", "深度学习"],
        estimatedTime: "18 分钟"
      },
      {
        id: "nlp-004",
        title: "命名实体识别 NER",
        order: 4,
        summary: "实体识别技术详解",
        keyPoints: ["BIO 标注", "CRF", "BERT-NER"],
        estimatedTime: "22 分钟"
      },
      {
        id: "nlp-005",
        title: "机器翻译",
        order: 5,
        summary: "神经机器翻译系统",
        keyPoints: ["Seq2Seq", "Attention", "Transformer"],
        estimatedTime: "25 分钟"
      }
    ]
  }
};

/**
 * 获取分类索引
 */
function getCategoryIndex(category: string): CategoryIndex | null {
  return CATEGORY_INDEXES[category] || null;
}

/**
 * 获取相邻文章
 */
export function getAdjacentArticles(category: string, currentId: string): { prev: ArticleIndex | null; next: ArticleIndex | null } {
  const index = getCategoryIndex(category);
  if (!index) {
    return { prev: null, next: null };
  }

  const currentIndex = index.articles.findIndex(a => a.id === currentId);
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? index.articles[currentIndex - 1] : null;
  const next = currentIndex < index.articles.length - 1 ? index.articles[currentIndex + 1] : null;

  return { prev, next };
}

/**
 * GET /api/knowledge/index?category=ML&articleId=ml-001
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const articleId = searchParams.get('articleId');

  if (!category || !articleId) {
    return NextResponse.json(
      { error: 'Missing category or articleId parameter' },
      { status: 400 }
    );
  }

  const { prev, next } = getAdjacentArticles(category, articleId);

  return NextResponse.json({
    category,
    articleId,
    prev,
    next
  });
}
