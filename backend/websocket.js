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
    console.log('🔌 Setting up WebSocket server...');
    
    this.wss.on('connection', (ws, req) => {
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      console.log(`🟢 Client connected to WebSocket from ${clientIP}`);
      console.log(`📊 Total clients: ${this.clients.size + 1}`);
      
      this.clients.add(ws);
      
      // Send welcome message
      const welcomeMessage = {
        type: 'connected',
        message: 'WebSocket connection established',
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 Sending welcome message:', welcomeMessage);
      ws.send(JSON.stringify(welcomeMessage));

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('📥 Received WebSocket message:', data);
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', (code, reason) => {
        console.log(`🔴 Client disconnected from WebSocket. Code: ${code}, Reason: ${reason}`);
        console.log(`📊 Remaining clients: ${this.clients.size - 1}`);
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  async handleMessage(ws, data) {
    console.log(`📬 Handling WebSocket message: ${data.type}`);
    
    switch (data.type) {
      case 'start_monitoring':
        if (data.runId) {
          console.log(`🔄 Starting monitoring for run ID: ${data.runId}`);
          this.currentRunId = data.runId;
          this.startPolling();
        }
        break;
        
      case 'stop_monitoring':
        console.log('🛑 Stopping monitoring');
        this.stopPolling();
        break;
        
      case 'get_latest_run':
        console.log('📡 Client requested latest run - fetching...');
        await this.sendLatestRun();
        break;
        
      default:
        console.log(`❓ Unknown message type: ${data.type}`);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }
  }

  broadcast(message) {
    const messageStr = JSON.stringify(message);
    console.log(`📢 Broadcasting message to ${this.clients.size} clients:`, message.type);
    let sentCount = 0;
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
        sentCount++;
      }
    });
    console.log(`📤 Message sent to ${sentCount} active clients`);
  }

  async sendLatestRun() {
    try {
      console.log('📡 sendLatestRun() - checking GitHub service availability');
      if (!this.github || !this.github.initialized) {
        console.log('❌ GitHub service not available');
        this.broadcast({
          type: 'error',
          message: 'GitHub service not available - check environment variables'
        });
        return;
      }
      
      console.log('📊 Fetching latest workflow runs from GitHub...');
      const result = await this.github.getWorkflowRuns(1);
      if (result.success && result.runs.length > 0) {
        const latestRun = result.runs[0];
        console.log(`📋 Latest run found: ${latestRun.id} (status: ${latestRun.status})`);
        
        this.broadcast({
          type: 'latest_run',
          run: latestRun
        });
        console.log('📤 Broadcasted latest_run to all clients');
        
        // If the run is in progress or queued, start monitoring it
        if (latestRun.status === 'in_progress' || latestRun.status === 'queued') {
          console.log(`🔄 Starting monitoring for ${latestRun.status} run: ${latestRun.id}`);
          this.currentRunId = latestRun.id;
          this.startPolling();
        } else {
          console.log(`⏸️ Run ${latestRun.id} is ${latestRun.status}, not starting polling`);
        }
      } else {
        console.log('📭 No workflow runs found or failed to fetch');
      }
    } catch (error) {
      console.error('❌ Error fetching latest run:', error);
      this.broadcast({
        type: 'error',
        message: 'Failed to fetch latest workflow run'
      });
    }
  }

  startPolling() {
    if (this.pollingInterval) {
      console.log('🛑 Stopping existing polling interval');
      clearInterval(this.pollingInterval);
    }
    
    if (!this.currentRunId) {
      console.log('❌ No current run ID, cannot start polling');
      return;
    }

    console.log(`🔄 Starting to monitor workflow run: ${this.currentRunId}`);
    
    this.pollingInterval = setInterval(async () => {
      try {
        console.log(`⏰ Polling workflow status for run: ${this.currentRunId}`);
        await this.pollWorkflowStatus();
      } catch (error) {
        console.error('❌ Error polling workflow status:', error);
      }
    }, 5000); // Poll every 5 seconds
    
    // Poll immediately
    console.log('🚀 Starting immediate poll');
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

    if (!this.github || !this.github.initialized) {
      this.stopPolling();
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
    console.log('🎯 monitorLatestRun() called - fetching latest workflow run');
    await this.sendLatestRun();
  }
}

module.exports = WebSocketManager;