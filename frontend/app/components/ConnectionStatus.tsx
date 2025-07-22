'use client';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '●',
          text: 'Connected to live updates'
        };
      case 'connecting':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '○',
          text: 'Connecting...'
        };
      case 'disconnected':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '○',
          text: 'Disconnected - trying to reconnect'
        };
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '●',
          text: 'Connection error - retrying'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '○',
          text: 'Unknown status'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.color}`}>
      <span className={`mr-2 ${status === 'connecting' ? 'animate-pulse' : ''}`}>
        {statusDisplay.icon}
      </span>
      {statusDisplay.text}
    </div>
  );
}