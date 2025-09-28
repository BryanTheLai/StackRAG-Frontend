import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpBubbleProps {
  title: string;
  content: string;
  className?: string;
  triggerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HelpBubble: React.FC<HelpBubbleProps> = ({
  title,
  content,
  className = "",
  triggerClassName = "",
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80', 
    lg: 'w-96'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`text-base-content/60 hover:text-primary transition-colors ${triggerClassName}`}
        title={`Learn about: ${title}`}
      >
        <HelpCircle size={iconSizes[size]} />
      </button>

      {/* Help Bubble */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Bubble Content */}
          <div className={`absolute z-50 ${sizeClasses[size]} bg-base-100 border border-base-300 rounded-lg shadow-lg p-4 -translate-x-1/2 left-1/2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base-content text-sm">
                {title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-base-content/40 hover:text-base-content/70 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Content */}
            <div className="text-sm text-base-content/80 leading-relaxed">
              {content}
            </div>
            
            {/* Arrow */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-4 bg-base-100 border-l border-t border-base-300 transform rotate-45"></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HelpBubble;
