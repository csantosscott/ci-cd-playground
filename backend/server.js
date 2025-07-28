const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const GitHubService = require('./github');
const WebSocketManager = require('./websocket');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize GitHub service
const github = new GitHubService();

// Wait for GitHub service to initialize before starting server
const waitForGitHubInit = async () => {
  let attempts = 0;
  const maxAttempts = 30; // Wait up to 30 seconds
  
  while (!github.initialized && attempts < maxAttempts) {
    console.log(`⏱️ Waiting for GitHub service initialization... (${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  if (github.initialized) {
    console.log('✅ GitHub service ready - full functionality enabled');
  } else {
    console.log('⚠️ GitHub service initialization timeout - limited functionality');
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced health check endpoint for Cloud Run monitoring
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      github: github.initialized ? 'healthy' : 'unhealthy',
      websocket: wsManager ? 'healthy' : 'unhealthy',
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      token: {
        expiry: github.tokenExpiry ? github.tokenExpiry.toISOString() : null,
        refreshScheduled: !!github.refreshInterval,
        minutesUntilExpiry: github.tokenExpiry ? Math.round((github.tokenExpiry.getTime() - Date.now()) / 60000) : null
      }
    }
  };

  // Determine overall health status
  const isHealthy = health.checks.github === 'healthy' && health.checks.websocket === 'healthy';
  
  if (!isHealthy) {
    health.status = 'DEGRADED';
    return res.status(503).json(health);
  }

  res.json(health);
});

// Readiness probe endpoint (for Cloud Run startup)
app.get('/ready', (req, res) => {
  if (github.initialized) {
    res.json({ 
      status: 'READY', 
      timestamp: new Date().toISOString(),
      github_initialized: true
    });
  } else {
    res.status(503).json({ 
      status: 'NOT_READY', 
      timestamp: new Date().toISOString(),
      github_initialized: false,
      message: 'GitHub service still initializing'
    });
  }
});

// Liveness probe endpoint (for Cloud Run health monitoring)
app.get('/live', (req, res) => {
  res.json({ 
    status: 'ALIVE', 
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'CI/CD Playground Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to simulate container failure (for testing recovery)
app.post('/api/test/crash', (req, res) => {
  res.json({ message: 'Simulating container crash in 5 seconds...' });
  setTimeout(() => {
    console.log('🧪 Test crash initiated - forcing process exit');
    process.exit(1);
  }, 5000);
});

// Trigger CI/CD pipeline by creating a commit
app.post('/api/trigger-pipeline', async (req, res) => {
  if (!github.initialized) {
    return res.status(503).json({
      success: false,
      error: 'GitHub service not available - check environment variables'
    });
  }
  
  const { message } = req.body;
  const commitMessage = message || 'Trigger CI/CD pipeline from playground';
  
  try {
    const result = await github.createCommit(commitMessage);
    
    if (result.success) {
      // Start monitoring the latest run via WebSocket
      setTimeout(() => {
        wsManager.monitorLatestRun();
      }, 2000); // Wait 2 seconds for GitHub Actions to start
      
      res.json({
        success: true,
        commit: result.commit,
        message: 'Pipeline triggered successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to trigger pipeline'
    });
  }
});

// Get workflow runs
app.get('/api/workflow-runs', async (req, res) => {
  if (!github.initialized) {
    return res.status(503).json({
      error: 'GitHub service not available - check environment variables'
    });
  }
  
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    const result = await github.getWorkflowRuns(limit);
    
    if (result.success) {
      res.json(result.runs);
    } else {
      res.status(500).json({
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch workflow runs'
    });
  }
});

// Get workflow run jobs with details
app.get('/api/workflow-runs/:runId/jobs', async (req, res) => {
  if (!github.initialized) {
    return res.status(503).json({
      error: 'GitHub service not available - check environment variables'
    });
  }
  
  const { runId } = req.params;
  
  try {
    const result = await github.getWorkflowRunJobs(runId);
    
    if (result.success) {
      res.json(result.jobs);
    } else {
      res.status(500).json({
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch workflow jobs'
    });
  }
});

// Create HTTP server
const server = http.createServer(app);
console.log('🖥️ HTTP server created');

// WebSocket server for live log streaming
console.log('🔌 Creating WebSocket server...');
const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: false,
  clientTracking: true
});
console.log('✅ WebSocket server created');

// Initialize WebSocket manager (always create, even if GitHub is not available)
console.log('🎛️ Initializing WebSocket manager...');
const wsManager = new WebSocketManager(wss, github);
console.log('✅ WebSocket manager initialized');

server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for connections on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🐙 GitHub service initialized: ${github.initialized ? '✅' : '❌'}`);
  
  // Wait for GitHub service to initialize
  await waitForGitHubInit();
});