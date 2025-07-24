# 🚀 CI/CD Playground

An interactive CI/CD demonstration platform that showcases modern DevOps practices with real-time pipeline visualization.

## 🎯 What This Does

This project demonstrates a complete CI/CD workflow where users can: 
- **Click a button** to trigger a real GitHub Actions pipeline
- **Watch live logs** stream in real-time via WebSocket
- **See the entire process** from commit creation to deployment
- **Experience modern DevOps** practices in action

## 🏗️ Architecture

- **Frontend**: React/Next.js dashboard with live pipeline monitoring
- **Backend**: Node.js API with GitHub App integration
- **CI/CD**: GitHub Actions with comprehensive workflow stages
- **Deployment**: Google Cloud Run with auto-scaling
- **Real-time**: WebSocket integration for live log streaming

## 🚀 Quick Start

### Option 1: Use the Live Demo
Visit the deployed application: **https://ci-cd-frontend-160544606445.us-central1.run.app**

### Option 2: Trigger GitHub Actions Manually

1. **Go to the Actions tab**: [GitHub Actions](https://github.com/csantosscott/ci-cd-playground/actions)

2. **Run the CI/CD Demo Pipeline**:
   - Click on "🚀 CI/CD Demo Pipeline"
   - Click "Run workflow"
   - Watch the beautiful emoji-enhanced logs!

3. **Deploy to Google Cloud Run**:
   - Click on "🚀 Deploy to GCP Cloud Run"
   - Click "Run workflow"
   - Choose environment (staging/production)
   - Monitor the deployment process

### Option 3: Local Development

```bash
# Clone the repository
git clone https://github.com/csantosscott/ci-cd-playground.git
cd ci-cd-playground

# Start with Docker Compose
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

## 🎮 How to Use

1. **Visit the Dashboard**: Open the frontend URL
2. **Click "Run Pipeline"**: This creates a commit and triggers GitHub Actions
3. **Watch Live Updates**: See real-time logs streaming to your browser
4. **Check GitHub**: View the actual workflow running on GitHub Actions
5. **See Results**: Monitor the complete CI/CD process

## 🔧 Workflow Stages

The GitHub Actions pipeline includes:

### 🔍 Code Linting
- ESLint checks
- Code quality validation
- Style consistency verification

### 🧪 Testing
- Unit test execution
- Integration test validation
- Multi-environment testing

### 🏗️ Build Process
- Application compilation
- Asset optimization
- Build artifact creation

### 🔒 Security Scanning
- Vulnerability assessment
- Dependency audit
- Security compliance checks

### 🚀 Deployment
- Automated deployment to Google Cloud Run
- Environment configuration
- Health checks and monitoring

## 🌟 Features

- **Real-time Monitoring**: Live WebSocket updates
- **Interactive Dashboard**: Beautiful UI with status indicators
- **GitHub Integration**: Seamless GitHub App authentication
- **Auto-scaling Deployment**: Google Cloud Run with intelligent scaling
- **Comprehensive Logging**: Emoji-enhanced logs for better visibility
- **Multi-environment Support**: Staging and production deployments

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket
- **CI/CD**: GitHub Actions, Docker
- **Cloud**: Google Cloud Run, Container Registry
- **Authentication**: GitHub App integration
- **Real-time**: WebSocket for live updates

## 📊 Pipeline Visualization

The dashboard provides real-time visualization of:
- Workflow execution status
- Individual job progress
- Live log streaming
- Build artifacts and results
- Deployment status and URLs

## 🔑 Environment Setup

For local development, you'll need:
- Node.js 18+
- Docker and Docker Compose
- GitHub App credentials
- Google Cloud Platform account

## 🚀 Deployment

The application automatically deploys to Google Cloud Run when changes are pushed to the master branch. Manual deployments can be triggered via GitHub Actions.

## 📈 Monitoring

- **GitHub Actions**: View workflow executions and logs
- **Google Cloud Console**: Monitor Cloud Run services and metrics
- **Live Dashboard**: Real-time status and performance indicators

## 🔧 Troubleshooting

Common issues and solutions are documented in our comprehensive troubleshooting guide. During development, we encountered and resolved 9 major deployment issues including:

- Docker build context errors  
- Frontend localhost URL issues in production
- GitHub App authentication failures
- Secret Manager permission problems
- URL encoding issues with trailing newlines
- WebSocket connection and polling issues

For detailed solutions to these and other issues, see our deployment documentation.

## 🏭 Production Features

### Security
- ✅ All sensitive credentials stored in GCP Secret Manager
- ✅ GitHub App authentication with JWT tokens
- ✅ Least-privilege IAM permissions
- ✅ No secrets in environment variables or container images

### Performance
- ✅ Auto-scaling Cloud Run deployment
- ✅ WebSocket connections for real-time updates
- ✅ Efficient GitHub API polling (5-second intervals)
- ✅ Request-based billing (scales to zero when unused)

### Monitoring
- ✅ Comprehensive logging with emoji prefixes for easy filtering
- ✅ Cloud Run built-in metrics and monitoring
- ✅ Error handling and graceful degradation
- ✅ Connection status indicators

## 🌐 Live Demo URLs

- **Frontend**: https://ci-cd-frontend-160544606445.us-central1.run.app
- **Backend**: https://ci-cd-demo-backend-160544606445.us-central1.run.app
- **Repository**: https://github.com/csantosscott/ci-cd-playground

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch  
3. Make your changes
4. Test locally and with the live demo
5. Submit a pull request

This is a demonstration project showcasing CI/CD best practices. Feel free to explore the code and adapt it for your own projects!

## 📝 License

MIT License - Feel free to use this as a learning resource or starting point for your own CI/CD implementations.

## 🆘 Support

For issues and questions:
- Open an issue in the GitHub repository
- Check the troubleshooting guide for common problems
- Review Cloud Run logs for deployment issues

## 🙏 Acknowledgments

Special thanks to the comprehensive development process that helped identify and resolve numerous real-world deployment challenges, making this a robust production-ready CI/CD demonstration platform.

---

**🎯 Ready to see DevOps in action?** 

👉 [**Try the Live Demo!**](https://ci-cd-frontend-160544606445.us-central1.run.app) | [**Trigger a Pipeline!**](https://github.com/csantosscott/ci-cd-playground/actions)
