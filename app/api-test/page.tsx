// This Component is just for testing the APIs  

'use client';

import { useState } from 'react';

export default function APITestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tool, setTool] = useState('get_upcoming_events');
  const [args, setArgs] = useState('{"maxResults": 5}');

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool,
          args: JSON.parse(args)
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to call API' });
    } finally {
      setLoading(false);
    }
  };

  const getTools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mcp');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to get tools' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Productivity MCP API Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Tools</h2>
          <button
            onClick={getTools}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Available Tools'}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Test Tool Call</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tool:</label>
              <select
                value={tool}
                onChange={(e) => setTool(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="get_upcoming_events">Get Upcoming Events</option>
                <option value="get_next_event">Get Next Event</option>
                <option value="find_available_time">Find Available Time</option>
                <option value="create_calendar_event">Create Calendar Event</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Arguments (JSON):</label>
              <textarea
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded h-20"
                placeholder='{"maxResults": 5}'
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
          <div>
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
