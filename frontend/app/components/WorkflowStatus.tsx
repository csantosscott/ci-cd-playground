'use client';

interface WorkflowRun {
  id: number;
  status: string;
  conclusion: string | null;
  workflow_name: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  head_sha: string;
}

interface WorkflowJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
}

interface WorkflowStatusProps {
  run: WorkflowRun;
  jobs: WorkflowJob[];
  isLoading: boolean;
}

export default function WorkflowStatus({ run, jobs, isLoading }: WorkflowStatusProps) {
  const getStatusBadge = (status: string, conclusion: string | null) => {
    if (status === 'in_progress') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-1"></div>
          In Progress
        </span>
      );
    }
    if (status === 'completed') {
      if (conclusion === 'success') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Success
          </span>
        );
      } else if (conclusion === 'failure') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ✗ Failed
          </span>
        );
      } else if (conclusion === 'cancelled') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⊘ Cancelled
          </span>
        );
      }
    }
    if (status === 'queued') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          ⋯ Queued
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        ○ {status}
      </span>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const duration = Math.floor((end - start) / 1000);
    
    if (duration < 60) {
      return `${duration}s`;
    } else if (duration < 3600) {
      return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    } else {
      return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Workflow Run Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {run.workflow_name || 'Workflow Run'}
            </h3>
            {getStatusBadge(run.status, run.conclusion)}
          </div>
          <div className="text-sm text-gray-500">
            Run #{run.id}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Started:</span>
            <div className="text-gray-600">{formatTime(run.created_at)}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <div className="text-gray-600">
              {calculateDuration(run.created_at, run.status === 'completed' ? run.updated_at : undefined)}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Commit:</span>
            <div className="text-gray-600 font-mono">{run.head_sha.substring(0, 7)}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center space-x-2">
          <a 
            href={run.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>

      {/* Job Status Grid */}
      {jobs && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {job.name}
                </h4>
                {getStatusBadge(job.status, job.conclusion)}
              </div>
              
              <div className="space-y-1 text-xs text-gray-600">
                <div>
                  Started: {formatTime(job.started_at)}
                </div>
                {job.completed_at && (
                  <div>
                    Duration: {calculateDuration(job.started_at, job.completed_at)}
                  </div>
                )}
                {!job.completed_at && job.status === 'in_progress' && (
                  <div>
                    Running: {calculateDuration(job.started_at)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (!jobs || jobs.length === 0) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Starting workflow...</p>
        </div>
      )}
    </div>
  );
}