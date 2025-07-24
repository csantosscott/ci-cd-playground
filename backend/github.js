const { Octokit } = require('@octokit/rest');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const SecretsService = require('./secrets');

class GitHubService {
  constructor() {
    this.owner = null;
    this.repo = null;
    this.appId = null;
    this.installationId = null;
    this.privateKey = null;
    
    this.octokit = null;
    this.initialized = false;
    this.secretsService = new SecretsService();
    
    // Initialize GitHub service
    this.initializeFromSecrets();
  }

  async initializeFromSecrets() {
    try {
      console.log('🔐 Attempting to load GitHub configuration from Secret Manager...');
      
      // Try to load from Secret Manager first
      const credentials = await this.secretsService.loadGitHubCredentials();
      
      this.owner = credentials.GITHUB_REPO_OWNER;
      this.repo = credentials.GITHUB_REPO_NAME;
      this.appId = credentials.GITHUB_APP_ID;
      this.installationId = credentials.GITHUB_APP_INSTALLATION_ID;
      this.privateKey = credentials.GITHUB_APP_PRIVATE_KEY;
      
      console.log('✅ GitHub configuration loaded from Secret Manager');
      await this.initializeOctokit();
      
    } catch (error) {
      console.log('⚠️ Failed to load from Secret Manager, falling back to environment variables');
      
      // Fallback to environment variables
      this.owner = process.env.GITHUB_REPO_OWNER;
      this.repo = process.env.GITHUB_REPO_NAME;
      this.appId = process.env.GITHUB_APP_ID;
      this.installationId = process.env.GITHUB_APP_INSTALLATION_ID;
      this.privateKeyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
      
      if (process.env.GITHUB_APP_PRIVATE_KEY || this.privateKeyPath) {
        await this.initializeOctokit();
      } else {
        console.warn('⚠️ GitHub App configuration incomplete - GitHub features will be disabled');
      }
    }
  }

  async initializeOctokit() {
    try {
      // Get private key from various sources
      let privateKey;
      
      if (this.privateKey) {
        // Use private key from Secret Manager
        privateKey = this.privateKey;
        console.log('🔐 Using private key from Secret Manager');
      } else if (process.env.GITHUB_APP_PRIVATE_KEY) {
        // Use private key from environment variable (fallback)
        privateKey = process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');
        console.log('🔐 Using private key from environment variable');
      } else if (this.privateKeyPath) {
        // Use private key from file (for local development)
        privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
        console.log('🔐 Using private key from file');
      } else {
        throw new Error('GitHub App private key not found. Check Secret Manager or environment variables.');
      }
      
      // Create JWT
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iat: now - 60,
        exp: now + (10 * 60),
        iss: parseInt(this.appId) // Ensure App ID is an integer
      };
      
      console.log(`🔧 Creating JWT with App ID: ${this.appId} (parsed: ${parseInt(this.appId)})`);
      console.log(`🔧 Private key length: ${privateKey.length} characters`);
      console.log(`🔧 Private key starts with: ${privateKey.substring(0, 50)}...`);
      console.log(`🔧 Private key ends with: ...${privateKey.substring(privateKey.length - 50)}`);
      
      // Ensure private key has proper newlines
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log('🔧 Converted \\n to actual newlines in private key');
      }
      
      const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
      console.log(`🔧 JWT token created successfully (length: ${token.length})`);
      
      // Create Octokit instance with JWT
      const appOctokit = new Octokit({
        auth: token,
      });
      console.log(`🔧 Octokit instance created with JWT`);
      
      // Get installation access token
      console.log(`🔧 Requesting installation access token for installation: ${this.installationId}`);
      console.log(`🔧 Using JWT token: ${token.substring(0, 50)}...`);
      
      const { data } = await appOctokit.rest.apps.createInstallationAccessToken({
        installation_id: parseInt(this.installationId),
      });
      console.log(`🔧 Installation access token received successfully`);
      
      // Create authenticated Octokit instance
      this.octokit = new Octokit({
        auth: data.token,
      });
      
      console.log('✅ GitHub App authentication successful');
      this.initialized = true;
    } catch (error) {
      console.error('❌ GitHub App authentication failed:', error.message);
      console.error('❌ Error details:', error.status, error.response?.data || error.code || 'No additional details');
      if (error.response?.data) {
        console.error('❌ GitHub API response:', JSON.stringify(error.response.data, null, 2));
      }
      this.initialized = false;
      // Don't throw error to prevent server crash
    }
  }

  async ensureAuthenticated() {
    if (!this.initialized || !this.octokit) {
      throw new Error('GitHub service not properly initialized - check environment variables');
    }
  }

  async createCommit(message = 'Trigger CI/CD pipeline') {
    try {
      await this.ensureAuthenticated();
      
      // Get the current master branch SHA
      const { data: ref } = await this.octokit.rest.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: 'heads/master'
      });

      const currentSha = ref.object.sha;

      // Get the current tree
      const { data: commit } = await this.octokit.rest.git.getCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: currentSha
      });

      // Create a simple file change (update ci-status.txt with timestamp)
      const content = `CI/CD Pipeline triggered at: ${new Date().toISOString()}\n`;
      const contentEncoded = Buffer.from(content).toString('base64');

      // Try to get existing file
      let existingFileSha = null;
      try {
        const { data: existingFile } = await this.octokit.rest.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: 'ci-status.txt'
        });
        existingFileSha = existingFile.sha;
      } catch (error) {
        // File doesn't exist, will create new one
      }

      // Create or update the file
      const { data: fileUpdate } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: 'ci-status.txt',
        message: message,
        content: contentEncoded,
        ...(existingFileSha && { sha: existingFileSha })
      });

      return {
        success: true,
        commit: fileUpdate.commit,
        sha: fileUpdate.commit.sha,
        message: message
      };
    } catch (error) {
      console.error('Error creating commit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getWorkflowRuns(limit = 10) {
    try {
      await this.ensureAuthenticated();
      
      const { data } = await this.octokit.rest.actions.listWorkflowRunsForRepo({
        owner: this.owner,
        repo: this.repo,
        per_page: limit
      });

      return {
        success: true,
        runs: data.workflow_runs.map(run => ({
          id: run.id,
          status: run.status,
          conclusion: run.conclusion,
          workflow_name: run.name,
          created_at: run.created_at,
          updated_at: run.updated_at,
          html_url: run.html_url,
          head_sha: run.head_sha
        }))
      };
    } catch (error) {
      console.error('Error fetching workflow runs:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getWorkflowRunLogs(runId) {
    try {
      await this.ensureAuthenticated();
      
      const { data } = await this.octokit.rest.actions.downloadWorkflowRunLogs({
        owner: this.owner,
        repo: this.repo,
        run_id: runId
      });

      return {
        success: true,
        logs: data
      };
    } catch (error) {
      console.error('Error fetching workflow logs:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getWorkflowRunJobs(runId) {
    try {
      await this.ensureAuthenticated();
      
      const { data } = await this.octokit.rest.actions.listJobsForWorkflowRun({
        owner: this.owner,
        repo: this.repo,
        run_id: runId
      });

      return {
        success: true,
        jobs: data.jobs.map(job => ({
          id: job.id,
          name: job.name,
          status: job.status,
          conclusion: job.conclusion,
          started_at: job.started_at,
          completed_at: job.completed_at,
          steps: job.steps?.map(step => ({
            name: step.name,
            status: step.status,
            conclusion: step.conclusion,
            number: step.number,
            started_at: step.started_at,
            completed_at: step.completed_at
          }))
        }))
      };
    } catch (error) {
      console.error('Error fetching workflow jobs:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GitHubService;