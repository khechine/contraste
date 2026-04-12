export default function PressSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-100 rounded"></div>
          </div>
          <div className="h-8 w-full bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
          <div className="h-4 w-2/3 bg-gray-100 rounded mb-6"></div>
          <div className="mt-auto flex gap-4">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
