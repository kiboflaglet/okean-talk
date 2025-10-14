export const Debug = ({ data, onAction }: { data: any; onAction?: () => void }) => (
  <div className="relative w-auto max-w-[500px]">

    {onAction && (

      <button
        onClick={onAction}
        className="absolute top-2 right-2 bg-default-200 text-gray-800 text-xs px-2 py-1 rounded hover:bg-gray-300"
      >
        Action
      </button>
    )}
    <pre className="bg-default-100 border text-default p-4 max-h-96 overflow-auto rounded-md text-sm">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);