interface AccordionSkeletonProps {
  count?: number;
}

export const AccordionSkeleton = ({ count = 10 }: AccordionSkeletonProps) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl bg-gray-200/50 dark:bg-gray-700/30" />
      ))}
    </div>
  );
};
