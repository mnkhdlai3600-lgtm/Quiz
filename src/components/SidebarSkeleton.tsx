export default function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
