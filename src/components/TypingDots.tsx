import React from "react";

/**
 * A simple animated typing dots (ellipsis) indicator for chat loading state.
 */
export const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 h-6">
    <span
      className="inline-block w-2 h-2 bg-base-300 rounded-full animate-bounce"
      style={{ animationDelay: "0ms" }}
    />
    <span
      className="inline-block w-2 h-2 bg-base-300 rounded-full animate-bounce"
      style={{ animationDelay: "150ms" }}
    />
    <span
      className="inline-block w-2 h-2 bg-base-300 rounded-full animate-bounce"
      style={{ animationDelay: "300ms" }}
    />
  </div>
);
