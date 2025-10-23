// This Component is just for testing the APIs  

'use client';

import { useState, useEffect } from 'react';

export default function APITestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const [tool, setTool] = useState('test_slack_connection');
  const [args, setArgs] = useState('{}');

  useEffect(() => {
    fetchAvailableTools();
  }, []);

  const fetchAvailableTools = async () => {
    try {
      const response = await fetch('/api/mcp');
      const data = await response.json();
      if (data.tools) {
        setAvailableTools(data.tools);
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  };

  const testAPI = async () => {
    setLoading(true);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = args.trim() ? JSON.parse(args) : {};
      } catch (e) {
        setResult({ error: 'Invalid JSON in arguments field' });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool,
          args: parsedArgs
        }),
      });

      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error: any) {
      setResult({ error: error.message || 'Failed to call API' });
    } finally {
      setLoading(false);
    }
  };

  const getTools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mcp');
      const data = await response.json();
      setResult({ status: response.status, data });
      if (data.tools) {
        setAvailableTools(data.tools);
      }
    } catch (error: any) {
      setResult({ error: error.message || 'Failed to get tools' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Productivity MCP API Test</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <button
            onClick={getTools}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Service Status'}
          </button>
          
          {availableTools.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                {availableTools.length} tools available
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableTools.map((t: any) => (
                  <div 
                    key={t.name} 
                    className={`p-2 rounded text-sm ${t.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="ml-2 text-xs">({t.category})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Tool Call</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tool:</label>
              <select
                value={tool}
                onChange={(e) => setTool(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-gray-900"
              >
                {availableTools.map((t: any) => (
                  <option key={t.name} value={t.name} disabled={!t.available}>
                    {t.name} {t.available ? '' : '(unavailable)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Arguments (JSON):</label>
              <textarea
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded h-24 font-mono text-sm text-gray-900"
                placeholder='{"key": "value"}'
              />
            </div>

            <button
              onClick={testAPI}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Tool'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            {result.status && (
              <div className={`mb-2 text-sm font-medium ${result.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                Status: {result.status}
              </div>
            )}
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-gray-900">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
