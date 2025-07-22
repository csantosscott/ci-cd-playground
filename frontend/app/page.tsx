'use client';

import { useState } from 'react';
import Dashboard from './components/Dashboard';
import { WebSocketProvider } from './contexts/WebSocketContext';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <WebSocketProvider>
        <Dashboard />
      </WebSocketProvider>
    </main>
  );
}