'use client';

import { useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import RunPipelineButton from './RunPipelineButton';
import WorkflowStatus from './WorkflowStatus';
import LogDisplay from './LogDisplay';
import ConnectionStatus from './ConnectionStatus';

export default function Dashboard() {
  const { latestRun, currentJobs, connectionStatus } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);

  const handlePipelineStart = () => {
    setIsLoading(true);
  };

  const handlePipelineComplete = () => {
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          CI/CD Playground
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Click the button below to trigger a GitHub Actions pipeline and watch it run in real-time
        </p>
        <div className="mt-4">
          <ConnectionStatus status={connectionStatus} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pipeline Control
            </h2>
            <RunPipelineButton 
              onStart={handlePipelineStart}
              onComplete={handlePipelineComplete}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Workflow Status */}
        {latestRun && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Latest Workflow Run
            </h2>
            <WorkflowStatus 
              run={latestRun} 
              jobs={currentJobs}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Live Logs */}
        {(latestRun || currentJobs.length > 0) && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Live Workflow Logs
            </h2>
            <LogDisplay 
              jobs={currentJobs}
              isActive={latestRun?.status === 'in_progress'}
            />
          </div>
        )}

        {/* GitHub Repository Link */}
        <div className="text-center">
          <a 
            href="https://github.com/csantosscott/ci-cd-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>

      </div>
    </div>
  );
}