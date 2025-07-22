'use client';

import { useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

interface RunPipelineButtonProps {
  onStart: () => void;
  onComplete: () => void;
  disabled?: boolean;
}

export default function RunPipelineButton({ onStart, onComplete, disabled }: RunPipelineButtonProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const { sendMessage } = useWebSocket();

  const triggerPipeline = async () => {
    setIsTriggering(true);
    onStart();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/trigger-pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Playground trigger: ${new Date().toLocaleString()}`
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('Pipeline triggered successfully:', result);
        
        // Request latest run info via WebSocket
        sendMessage({ type: 'get_latest_run' });
      } else {
        console.error('Failed to trigger pipeline:', result.error);
        alert(`Failed to trigger pipeline: ${result.error}`);
      }
    } catch (error) {
      console.error('Error triggering pipeline:', error);
      alert('Error connecting to backend. Please check if the server is running.');
    } finally {
      setIsTriggering(false);
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={triggerPipeline}
        disabled={disabled || isTriggering}
        className={`
          px-8 py-4 text-xl font-bold text-white rounded-lg shadow-lg transform transition-all duration-200
          ${disabled || isTriggering
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 active:scale-95'
          }
        `}
      >
        {isTriggering ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Triggering Pipeline...
          </div>
        ) : (
          '🚀 Run CI/CD Pipeline'
        )}
      </button>
      
      <p className="text-sm text-gray-600 text-center max-w-md">
        This will create a commit to the repository and automatically trigger the GitHub Actions workflow.
        You'll see live updates below as the pipeline runs.
      </p>
    </div>
  );
}