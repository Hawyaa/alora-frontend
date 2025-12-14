export default function DebugPage() {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
        <div className="space-y-4">
          <div>
            <strong>NEXT_PUBLIC_API_URL:</strong> 
            <span className="ml-2 font-mono bg-gray-100 p-2 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}
            </span>
          </div>
          <div>
            <strong>Node Environment:</strong> 
            <span className="ml-2">{process.env.NODE_ENV}</span>
          </div>
          <div>
            <strong>All Environment Variables:</strong>
            <pre className="bg-gray-900 text-white p-4 rounded mt-2 overflow-auto">
              {JSON.stringify(process.env, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    )
  }