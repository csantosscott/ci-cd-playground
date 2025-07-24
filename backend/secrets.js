const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SecretsService {
  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
    
    if (!this.projectId) {
      console.warn('⚠️ No project ID found. Secrets will not be loaded from Secret Manager.');
    }
  }

  async getSecret(secretName) {
    if (!this.projectId) {
      throw new Error('Project ID not configured for Secret Manager');
    }

    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      console.log(`🔐 Fetching secret: ${secretName}`);
      
      const [version] = await this.client.accessSecretVersion({ name });
      const secret = version.payload.data.toString('utf8');
      
      console.log(`✅ Successfully retrieved secret: ${secretName}`);
      return secret;
    } catch (error) {
      console.error(`❌ Failed to retrieve secret ${secretName}:`, error.message);
      throw error;
    }
  }

  async loadGitHubCredentials() {
    try {
      console.log('🔐 Loading GitHub credentials from Secret Manager...');
      
      const credentials = await Promise.all([
        this.getSecret('github-repo-owner'),
        this.getSecret('github-repo-name'),
        this.getSecret('github-app-id'),
        this.getSecret('github-app-installation-id'),
        this.getSecret('github-app-private-key')
      ]);

      const [repoOwner, repoName, appId, installationId, privateKey] = credentials;

      console.log('✅ All GitHub credentials loaded from Secret Manager');
      
      return {
        GITHUB_REPO_OWNER: repoOwner,
        GITHUB_REPO_NAME: repoName,
        GITHUB_APP_ID: appId,
        GITHUB_APP_INSTALLATION_ID: installationId,
        GITHUB_APP_PRIVATE_KEY: privateKey
      };
    } catch (error) {
      console.error('❌ Failed to load GitHub credentials from Secret Manager:', error.message);
      throw error;
    }
  }
}

module.exports = SecretsService;