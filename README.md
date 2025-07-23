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
Visit the deployed application: *(URLs will be updated after deployment)*

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

## 🤝 Contributing

This is a demonstration project showcasing CI/CD best practices. Feel free to explore the code and adapt it for your own projects!

## 📝 License

MIT License - Feel free to use this as a learning resource or starting point for your own CI/CD implementations.

---

**🎯 Ready to see DevOps in action?** 

👉 [**Click here to trigger a pipeline!**](https://github.com/csantosscott/ci-cd-playground/actions)
