'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
  steps?: Array<{
    name: string;
    status: string;
    conclusion: string | null;
    number: number;
    started_at: string;
    completed_at: string | null;
  }>;
}

interface WebSocketContextType {
  isConnected: boolean;
  latestRun: WorkflowRun | null;
  currentJobs: WorkflowJob[];
  sendMessage: (message: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestRun, setLatestRun] = useState<WorkflowRun | null>(null);
  const [currentJobs, setCurrentJobs] = useState<WorkflowJob[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      setConnectionStatus('connecting');
      
      try {
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setSocket(ws);
          setIsConnected(true);
          setConnectionStatus('connected');
          
          // Request latest run status immediately after connection
          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              console.log('Requesting latest run status...');
              ws.send(JSON.stringify({ type: 'get_latest_run' }));
            }
          }, 500); // Small delay to ensure connection is fully established
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setSocket(null);
          setIsConnected(false);
          setConnectionStatus('disconnected');
          
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setConnectionStatus('error');
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data: any) => {
    console.log('📥 Received WebSocket message:', data.type, data);
    
    switch (data.type) {
      case 'connected':
        console.log('WebSocket connection established');
        break;
        
      case 'latest_run':
        console.log('📋 Setting latest run:', data.run);
        setLatestRun(data.run);
        break;
        
      case 'workflow_update':
        console.log('🔄 Workflow update received:', data.run.status, data.jobs.length, 'jobs');
        setLatestRun(data.run);
        setCurrentJobs(data.jobs);
        break;
        
      case 'workflow_completed':
        console.log('✅ Workflow completed:', data.run);
        setLatestRun(data.run);
        setCurrentJobs(data.jobs);
        break;
        
      case 'error':
        console.error('❌ WebSocket error:', data.message);
        break;
        
      default:
        console.log('❓ Unknown WebSocket message type:', data.type);
    }
  };

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  };

  const value: WebSocketContextType = {
    isConnected,
    latestRun,
    currentJobs,
    sendMessage,
    connectionStatus
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};