export default function ArticleHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
