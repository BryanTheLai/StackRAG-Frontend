import React, { useState, useEffect } from 'react';
import { HelpCircle, TrendingUp, FileText, Calculator, Target } from 'lucide-react';
import { HelpBubble } from './HelpBubble';

interface SmartPromptSuggestionsProps {
  onSuggestionSelect: (suggestion: string) => void;
  isVisible: boolean;
  className?: string;
}

interface PromptSuggestion {
  text: string;
  icon: React.ReactNode;
  tooltip?: string;
  helpContent?: {
    title: string;
    content: string;
  };
}

const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    text: "Show revenue trend over time.",
    icon: <TrendingUp size={16} />,
    tooltip: "Analyze quarterly revenue patterns using your financial documents"
  },
  {
    text: "What is RAG and how does it work?",
    icon: <HelpCircle size={16} />,
    tooltip: "Learn about Retrieval-Augmented Generation technology",
    helpContent: {
      title: "Retrieval-Augmented Generation (RAG)",
      content: "RAG combines large language models with your specific documents. It retrieves relevant information from your uploaded files and uses it to provide accurate, contextual answers based on your actual data."
    }
  },
  {
    text: "Summarize key financial metrics from my documents",
    icon: <Calculator size={16} />,
    tooltip: "Extract and analyze important financial KPIs"
  },
  {
    text: "Explain how embeddings help find relevant information",
    icon: <FileText size={16} />,
    tooltip: "Understand how AI finds context in your documents",
    helpContent: {
      title: "How Embeddings Work",
      content: "Embeddings convert text into numerical vectors that capture semantic meaning. This allows the AI to find relevant information even when different words are used to express the same concept."
    }
  },
  {
    text: "Compare profit margins across different periods",
    icon: <Target size={16} />,
    tooltip: "Analyze profitability trends over time"
  },
  {
    text: "What are the main cash flow drivers?",
    icon: <TrendingUp size={16} />,
    tooltip: "Identify key factors affecting cash flow"
  },
  {
    text: "Show expense breakdown by category",
    icon: <Calculator size={16} />,
    tooltip: "Categorize and visualize expense distribution"
  },
  {
    text: "How does vector search work in document retrieval?",
    icon: <HelpCircle size={16} />,
    tooltip: "Learn about semantic search technology",
    helpContent: {
      title: "Vector Search Technology",
      content: "Vector search finds documents by semantic similarity rather than exact keyword matching. This means the AI can understand context and find relevant information even if the exact words don't match your query."
    }
  },
  {
    text: "Identify potential cost reduction opportunities",
    icon: <Target size={16} />,
    tooltip: "Find areas where expenses can be optimized"
  },
  {
    text: "What insights can AI extract from financial statements?",
    icon: <FileText size={16} />,
    tooltip: "Discover AI-powered financial analysis capabilities",
    helpContent: {
      title: "AI Financial Analysis",
      content: "Our AI can extract key metrics, identify trends, compare periods, and generate insights from your financial documents like income statements, balance sheets, and cash flow reports."
    }
  }
];

export const SmartPromptSuggestions: React.FC<SmartPromptSuggestionsProps> = ({
  onSuggestionSelect,
  isVisible,
  className = ""
}) => {
  const [displayedSuggestions, setDisplayedSuggestions] = useState<PromptSuggestion[]>([]);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Randomly select 4 suggestions on component mount
  useEffect(() => {
    const shuffled = [...PROMPT_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setDisplayedSuggestions(shuffled.slice(0, 4));
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setIsAnimatingOut(true);
    // Delay the callback to allow animation to start
    setTimeout(() => {
      onSuggestionSelect(suggestion);
    }, 150);
  };

  if (!isVisible && !isAnimatingOut) {
    return null;
  }

  return (
    <div 
      className={`transition-all duration-500 ease-out ${
        isVisible && !isAnimatingOut
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform -translate-y-4'
      } ${className}`}
      onTransitionEnd={() => {
        if (isAnimatingOut) {
          setIsAnimatingOut(false);
        }
      }}
    >
      <div className="mb-4 space-y-2">
        <div className="text-sm text-base-content/70 font-medium mb-3 flex items-center gap-2">
          <HelpCircle size={16} />
          Try asking about:
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {displayedSuggestions.map((suggestion, index) => (
            <div key={index} className="group relative">
              <button
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="w-full text-left p-3 rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 hover:border-primary/30 transition-all duration-200 flex items-center gap-3 group-hover:shadow-sm"
              >
                <span className="text-primary flex-shrink-0">
                  {suggestion.icon}
                </span>
                <span className="text-sm text-base-content/80 group-hover:text-base-content flex-1">
                  {suggestion.text}
                </span>
                {/* Help bubble for technical concepts */}
                {suggestion.helpContent && (
                  <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <HelpBubble
                      title={suggestion.helpContent.title}
                      content={suggestion.helpContent.content}
                      size="sm"
                      triggerClassName="opacity-60 hover:opacity-100"
                    />
                  </div>
                )}
              </button>
              
              {/* Tooltip */}
              {suggestion.tooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-base-content text-base-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {suggestion.tooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-base-content"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-xs text-base-content/50 text-center mt-3">
          Click any suggestion to get started, or type your own question below
        </div>
      </div>
    </div>
  );
};

export default SmartPromptSuggestions;
