const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5" />
);

const Skeleton = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-gray-200 dark:bg-[#1f2923] ${className}`}
  >
    <Shimmer />
  </div>
);

export const ListingCardSkeleton = () => (
  <div className="flex flex-col h-full bg-white dark:bg-[#10221C]/50 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-[#10B77F]/10 shadow-sm">
    {/* Image area skeleton */}
    <Skeleton className="w-full aspect-[3/2]" />

    {/* Content area skeleton */}
    <div className="p-4 sm:p-5 flex flex-col flex-grow gap-3">
      {/* Title skeleton */}
      <Skeleton className="h-6 w-3/4 rounded-xl" />

      {/* Price and location skeleton */}
      <div className="flex items-center justify-between mb-1">
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-4 w-24 rounded-lg" />
      </div>

      {/* Footer stats skeleton */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="flex gap-3">
          <Skeleton className="h-3 w-8 rounded" />
          <Skeleton className="h-3 w-8 rounded" />
        </div>
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  </div>
);

export const ListingDetailSkeleton = () => (
  <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] pt-6 px-4 md:px-6">
    <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-[38%_1fr] lg:grid-cols-[40%_1fr] xl:grid-cols-[1fr_580px] gap-8 md:gap-14">
      <div className="flex flex-col gap-6">
        <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
        <div className="hidden md:flex gap-4 p-4 border border-gray-100 dark:border-white/5 rounded-2xl">
          <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-5 w-1/2 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
          </div>
        </div>
        <Skeleton className="hidden md:block w-full h-64 rounded-2xl" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </div>
    </div>
  </div>
);
