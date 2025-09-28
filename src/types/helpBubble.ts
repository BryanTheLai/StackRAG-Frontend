export interface HelpBubbleData {
  id: string;
  title: string;
  content: string;
  category: 'rag' | 'ai' | 'financial' | 'technical';
}

export interface HelpBubbleConfig {
  size: 'sm' | 'md' | 'lg';
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: 'hover' | 'click';
}

// Pre-defined help content for common topics
export const HELP_TOPICS: Record<string, HelpBubbleData> = {
  rag: {
    id: 'rag',
    title: 'What is RAG?',
    content: 'Retrieval-Augmented Generation (RAG) combines the power of large language models with your specific documents. It retrieves relevant information from your uploaded files and uses it to provide accurate, contextual answers.',
    category: 'rag'
  },
  embeddings: {
    id: 'embeddings',
    title: 'How Embeddings Work',
    content: 'Embeddings convert text into numerical vectors that capture semantic meaning. This allows the AI to find relevant information even when different words are used to express the same concept.',
    category: 'technical'
  },
  vectorSearch: {
    id: 'vectorSearch',
    title: 'Vector Search',
    content: 'Vector search finds documents by semantic similarity rather than exact keyword matching. This means the AI can understand context and find relevant information even if the exact words don\'t match.',
    category: 'technical'
  },
  financialAnalysis: {
    id: 'financialAnalysis',
    title: 'AI Financial Analysis',
    content: 'Our AI can extract key metrics, identify trends, compare periods, and generate insights from your financial documents like income statements, balance sheets, and cash flow reports.',
    category: 'financial'
  },
  chatHistory: {
    id: 'chatHistory',
    title: 'Chat Sessions',
    content: 'Each chat session maintains context throughout the conversation. You can return to previous chats to continue where you left off or review past analyses.',
    category: 'ai'
  }
};
