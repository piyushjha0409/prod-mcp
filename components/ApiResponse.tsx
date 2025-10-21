import React from 'react';

interface ApiResponseProps {
  response: any;
}

export const ApiResponse: React.FC<ApiResponseProps> = ({ response }) => {
  if (!response) {
    return <div className="text-gray-500">No response</div>;
  }

  // Handle error responses
  if (response.error) {
    return (
      <div className="text-red-600">
        <div className="font-semibold">Error:</div>
        <div>{response.message || 'An error occurred'}</div>
      </div>
    );
  }

  // Handle successful responses
  if (response.success) {
    return (
      <div className="space-y-3">
        {response.message && (
          <div className="text-green-600 font-medium">
            ✅ {response.message}
          </div>
        )}

        {/* Display events */}
        {response.events && response.events.length > 0 && (
          <div>
            <div className="font-semibold text-gray-800 mb-2">
              📅 Upcoming Events ({response.count})
            </div>
            <div className="space-y-2">
              {response.events.map((event: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded p-3">
                  <div className="font-medium text-gray-800">{event.summary}</div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(event.start?.dateTime)} - {formatDateTime(event.end?.dateTime)}
                  </div>
                  {event.location && (
                    <div className="text-sm text-gray-500">📍 {event.location}</div>
                  )}
                  {event.description && (
                    <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display single event */}
        {response.event && !response.events && (
          <div>
            <div className="font-semibold text-gray-800 mb-2">📅 Event Details</div>
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="font-medium text-gray-800">{response.event.summary}</div>
              <div className="text-sm text-gray-600">
                {formatDateTime(response.event.start?.dateTime)} - {formatDateTime(response.event.end?.dateTime)}
              </div>
              {response.event.location && (
                <div className="text-sm text-gray-500">📍 {response.event.location}</div>
              )}
              {response.event.description && (
                <div className="text-sm text-gray-500 mt-1">{response.event.description}</div>
              )}
            </div>
          </div>
        )}

        {/* Display available time slots */}
        {response.availableSlots && response.availableSlots.length > 0 && (
          <div>
            <div className="font-semibold text-gray-800 mb-2">
              ⏰ Available Time Slots ({response.totalFound} found)
            </div>
            <div className="space-y-1">
              {response.availableSlots.slice(0, 5).map((slot: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded p-2 text-sm">
                  <div className="text-gray-800">
                    {formatDateTime(slot.start)} - {formatDateTime(slot.end)}
                  </div>
                </div>
              ))}
              {response.availableSlots.length > 5 && (
                <div className="text-sm text-gray-500">
                  ... and {response.availableSlots.length - 5} more slots
                </div>
              )}
            </div>
          </div>
        )}

        {/* Display raw data for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer">Debug: Raw Response</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  }

  // Fallback for unknown response format
  return (
    <div className="text-gray-600">
      <div className="font-semibold">Response:</div>
      <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-auto">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
};

// Helper function to format date/time
function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return 'No time specified';
  
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return dateTimeString;
  }
}
