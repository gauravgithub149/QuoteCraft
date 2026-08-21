export const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-yellow-500" />

        <p className="text-sm font-medium text-gray-700">
          Please wait...
        </p>
      </div>
    </div>
  );
};