import React from "react";

/**
 * A responsive skeleton grid used during search/loading states.
 * @returns JSX.Element
 */
export const SkeletonGrid: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="w-full animate-pulse bg-base-200 rounded-lg h-16" />
    ))}
  </div>
);
