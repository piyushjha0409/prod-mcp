'use client';

import { useState } from 'react';
import { ApiResponse } from '@/components/ApiResponse';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ type: 'user' | 'bot'; content: any }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    const userPrompt = prompt;
    setHistory(prev => [...prev, { type: 'user', content: userPrompt }]);
    setPrompt('');

    try {
      // Parse the user input to determine which tool to call
      const toolCall = parseUserInput(userPrompt);
      
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolCall),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setHistory(prev => [...prev, { type: 'bot', content: data.result }]);
    } catch (err: any) {
      setError(err.message);
      setHistory(prev => [...prev, { type: 'bot', content: { error: true, message: err.message } }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAction = (text: string) => {
    setPrompt(text);
  };

  // Simple parser to determine which tool to call based on user input
  const parseUserInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('next meeting') || lowerInput.includes('next event')) {
      return { tool: 'get_next_event', args: {} };
    }
    
    if (lowerInput.includes('upcoming') || lowerInput.includes('events') || lowerInput.includes('schedule')) {
      return { tool: 'get_upcoming_events', args: { maxResults: 10 } };
    }
    
    if (lowerInput.includes('find') && (lowerInput.includes('slot') || lowerInput.includes('time') || lowerInput.includes('available'))) {
      // Extract duration from input
      const durationMatch = input.match(/(\d+)\s*(min|minute|hour|hr)/i);
      const duration = durationMatch ? 
        (durationMatch[2].toLowerCase().includes('hour') ? parseInt(durationMatch[1]) * 60 : parseInt(durationMatch[1])) 
        : 30;
      
      return { tool: 'find_available_time', args: { duration, daysAhead: 7 } };
    }
    
    if (lowerInput.includes('schedule') || lowerInput.includes('create') || lowerInput.includes('book')) {
      return { tool: 'create_calendar_event', args: { input } };
    }
    
    // Default to getting upcoming events
    return { tool: 'get_upcoming_events', args: { maxResults: 5 } };
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 font-sans">
      <main className="flex flex-col w-full max-w-3xl mx-auto p-4 md:p-8 flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Productivity Assistant</h1>
          <p className="text-gray-500 mt-2">
            Your AI-powered assistant for calendar and productivity management.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex-grow flex flex-col">
          <div className="flex-grow overflow-y-auto space-y-6 pr-2">
            {history.map((item, index) => (
              <div key={index} className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {item.type === 'user' ? (
                  <div className="bg-blue-500 text-white rounded-lg p-3 max-w-lg">
                    {item.content}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-3 max-w-lg w-full">
                    <ApiResponse response={item.content} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-lg w-full flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
                        <span>Thinking...</span>
                    </div>
                </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap gap-2 mb-2">
                <button onClick={() => quickAction('What is my next meeting?')} className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-300 transition-colors">Next meeting?</button>
                <button onClick={() => quickAction('Find a 30 min slot for a meeting tomorrow')} className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-300 transition-colors">Find a 30 min slot</button>
                <button onClick={() => quickAction('Get my upcoming events for this week')} className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-300 transition-colors">Upcoming events</button>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Schedule a team sync tomorrow at 10am for 30 minutes"
                className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-3 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}