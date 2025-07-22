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

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'CI/CD Playground Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Trigger CI/CD pipeline by creating a commit
app.post('/api/trigger-pipeline', async (req, res) => {
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

// WebSocket server for live log streaming
const wss = new WebSocketServer({ server });

// Initialize WebSocket manager
const wsManager = new WebSocketManager(wss, github);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});