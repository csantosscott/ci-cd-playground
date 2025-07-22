class WebSocketManager {
  constructor(wss, githubService) {
    this.wss = wss;
    this.github = githubService;
    this.clients = new Set();
    this.pollingInterval = null;
    this.currentRunId = null;
    
    this.setupWebSocketServer();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws) => {
      console.log('Client connected to WebSocket');
      this.clients.add(ws);
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established'
      }));

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  async handleMessage(ws, data) {
    switch (data.type) {
      case 'start_monitoring':
        if (data.runId) {
          this.currentRunId = data.runId;
          this.startPolling();
        }
        break;
        
      case 'stop_monitoring':
        this.stopPolling();
        break;
        
      case 'get_latest_run':
        await this.sendLatestRun();
        break;
        
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }
  }

  broadcast(message) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  async sendLatestRun() {
    try {
      const result = await this.github.getWorkflowRuns(1);
      if (result.success && result.runs.length > 0) {
        const latestRun = result.runs[0];
        this.broadcast({
          type: 'latest_run',
          run: latestRun
        });
        
        // If the run is in progress, start monitoring it
        if (latestRun.status === 'in_progress') {
          this.currentRunId = latestRun.id;
          this.startPolling();
        }
      }
    } catch (error) {
      console.error('Error fetching latest run:', error);
      this.broadcast({
        type: 'error',
        message: 'Failed to fetch latest workflow run'
      });
    }
  }

  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    if (!this.currentRunId) {
      return;
    }

    console.log(`Starting to monitor workflow run: ${this.currentRunId}`);
    
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollWorkflowStatus();
      } catch (error) {
        console.error('Error polling workflow status:', error);
      }
    }, 5000); // Poll every 5 seconds
    
    // Poll immediately
    this.pollWorkflowStatus();
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped monitoring workflow');
    }
  }

  async pollWorkflowStatus() {
    if (!this.currentRunId) {
      return;
    }

    try {
      // Get workflow run details
      const runsResult = await this.github.getWorkflowRuns(10);
      if (!runsResult.success) {
        return;
      }

      const currentRun = runsResult.runs.find(run => run.id === this.currentRunId);
      if (!currentRun) {
        return;
      }

      // Get job details
      const jobsResult = await this.github.getWorkflowRunJobs(this.currentRunId);
      if (!jobsResult.success) {
        return;
      }

      // Broadcast the update
      this.broadcast({
        type: 'workflow_update',
        run: currentRun,
        jobs: jobsResult.jobs,
        timestamp: new Date().toISOString()
      });

      // Stop polling if the workflow is complete
      if (currentRun.status === 'completed') {
        this.broadcast({
          type: 'workflow_completed',
          run: currentRun,
          jobs: jobsResult.jobs
        });
        this.stopPolling();
      }

    } catch (error) {
      console.error('Error in pollWorkflowStatus:', error);
      this.broadcast({
        type: 'error',
        message: 'Error fetching workflow status'
      });
    }
  }

  // Method to trigger monitoring after a new commit
  async monitorLatestRun() {
    await this.sendLatestRun();
  }
}

module.exports = WebSocketManager;