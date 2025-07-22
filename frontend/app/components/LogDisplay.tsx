'use client';

import { useEffect, useRef } from 'react';

interface WorkflowJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
  steps?: Array<{
    name: string;
    status: string;
    conclusion: string | null;
    number: number;
    started_at: string;
    completed_at: string | null;
  }>;
}

interface LogDisplayProps {
  jobs: WorkflowJob[];
  isActive: boolean;
}

export default function LogDisplay({ jobs, isActive }: LogDisplayProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [jobs]);

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'in_progress') {
      return <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>;
    }
    if (status === 'completed') {
      if (conclusion === 'success') {
        return <div className="text-green-500">✓</div>;
      } else if (conclusion === 'failure') {
        return <div className="text-red-500">✗</div>;
      } else if (conclusion === 'cancelled') {
        return <div className="text-yellow-500">⊘</div>;
      }
    }
    if (status === 'queued') {
      return <div className="text-gray-400">⋯</div>;
    }
    return <div className="text-gray-400">○</div>;
  };

  const getStatusColor = (status: string, conclusion: string | null) => {
    if (status === 'in_progress') return 'text-blue-600';
    if (status === 'completed') {
      if (conclusion === 'success') return 'text-green-600';
      if (conclusion === 'failure') return 'text-red-600';
      if (conclusion === 'cancelled') return 'text-yellow-600';
    }
    return 'text-gray-600';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
        <div className="flex items-center">
          <span className="text-gray-500">$</span>
          <span className="ml-2">Waiting for pipeline to start...</span>
          {isActive && <span className="ml-2 loading-dots"></span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Jobs:</span>
          <span className="text-sm text-gray-600">{jobs.length} total</span>
        </div>
        <div className="flex space-x-4 text-sm">
          <span className="text-green-600">
            ✓ {jobs.filter(j => j.conclusion === 'success').length}
          </span>
          <span className="text-red-600">
            ✗ {jobs.filter(j => j.conclusion === 'failure').length}
          </span>
          <span className="text-blue-600">
            ↻ {jobs.filter(j => j.status === 'in_progress').length}
          </span>
          <span className="text-gray-600">
            ⋯ {jobs.filter(j => j.status === 'queued').length}
          </span>
        </div>
      </div>

      {/* Terminal-style log display */}
      <div 
        ref={logContainerRef}
        className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto"
      >
        {jobs.map((job) => (
          <div key={job.id} className="mb-4">
            {/* Job header */}
            <div className="flex items-center mb-2">
              {getStatusIcon(job.status, job.conclusion)}
              <span className="ml-2 text-blue-400">
                [{formatTimestamp(job.started_at)}]
              </span>
              <span className="ml-2 font-bold text-white">
                Job: {job.name}
              </span>
              <span className={`ml-2 ${getStatusColor(job.status, job.conclusion)}`}>
                ({job.status}{job.conclusion ? `:${job.conclusion}` : ''})
              </span>
            </div>

            {/* Job steps */}
            {job.steps && job.steps.length > 0 && (
              <div className="ml-6 space-y-1">
                {job.steps.map((step) => (
                  <div key={step.number} className="flex items-center">
                    {getStatusIcon(step.status, step.conclusion)}
                    <span className="ml-2 text-blue-300 text-xs">
                      [{step.started_at ? formatTimestamp(step.started_at) : 'pending'}]
                    </span>
                    <span className="ml-2">
                      Step {step.number}: {step.name}
                    </span>
                    <span className={`ml-2 text-xs ${getStatusColor(step.status, step.conclusion)}`}>
                      ({step.status}{step.conclusion ? `:${step.conclusion}` : ''})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Completion time */}
            {job.completed_at && (
              <div className="ml-6 text-xs text-gray-500">
                Completed at {formatTimestamp(job.completed_at)}
              </div>
            )}
          </div>
        ))}

        {/* Active indicator */}
        {isActive && (
          <div className="flex items-center text-yellow-400">
            <div className="animate-pulse">●</div>
            <span className="ml-2">Pipeline running...</span>
          </div>
        )}
      </div>
    </div>
  );
}