const { Octokit } = require('@octokit/rest');
const jwt = require('jsonwebtoken');
const fs = require('fs');

class GitHubService {
  constructor() {
    this.owner = process.env.GITHUB_REPO_OWNER;
    this.repo = process.env.GITHUB_REPO_NAME;
    
    // GitHub App configuration
    this.appId = process.env.GITHUB_APP_ID;
    this.installationId = process.env.GITHUB_APP_INSTALLATION_ID;
    this.privateKeyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
    
    this.octokit = null;
    this.initializeOctokit();
  }

  async initializeOctokit() {
    try {
      // Read private key
      const privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
      
      // Create JWT
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iat: now - 60,
        exp: now + (10 * 60),
        iss: this.appId
      };
      
      const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
      
      // Create Octokit instance with JWT
      const appOctokit = new Octokit({
        auth: token,
      });
      
      // Get installation access token
      const { data } = await appOctokit.rest.apps.createInstallationAccessToken({
        installation_id: this.installationId,
      });
      
      // Create authenticated Octokit instance
      this.octokit = new Octokit({
        auth: data.token,
      });
      
      console.log('✅ GitHub App authentication successful');
    } catch (error) {
      console.error('❌ GitHub App authentication failed:', error.message);
      throw error;
    }
  }

  async ensureAuthenticated() {
    if (!this.octokit) {
      await this.initializeOctokit();
    }
  }

  async createCommit(message = 'Trigger CI/CD pipeline') {
    try {
      await this.ensureAuthenticated();
      
      // Get the current main branch SHA
      const { data: ref } = await this.octokit.rest.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: 'heads/main'
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