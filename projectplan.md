# CI/CD Playground Project Plan

## Project Overview
Create an interactive "CI/CD Playground" where users can click a button to commit a change and watch GitHub Actions run in real-time through a web UI.

## Architecture
- **Frontend**: React/Next.js dashboard with "Run Pipeline" button
- **Backend**: Node.js + Express API for GitHub integration
- **Infrastructure**: Docker containers deployed on GCP Cloud Run
- **CI/CD**: GitHub Actions with live log streaming via WebSockets

## Security Group Reference
- Use sg-01c9d9f9004c3949a (Open_SecurityGroup)

## GitHub Repository
- **URL**: https://github.com/csantosscott/ci-cd-playground
- **Type**: Public repository for demo purposes

## Project Structure
```
ci-cd-playground/
├── frontend/           # React/Next.js UI
├── backend/           # Node.js Express API
├── .github/workflows/ # GitHub Actions workflows
├── docker-compose.yml # Local development
├── .env.example       # Environment variables template
└── .gitignore         # Git ignore rules
```

## Todo List

### Phase 1: Project Setup ✅ COMPLETED
- [x] Initialize project structure with frontend and backend directories
- [x] Create package.json files for both frontend and backend
- [x] Set up basic folder structure and configuration files
- [x] Initialize Git repository if needed
- [x] Create GitHub remote repository

### Phase 2: Backend API Development ✅ COMPLETED
- [x] Create Express server with basic routing
- [x] Implement GitHub API integration (using GitHub App or PAT)
- [x] Add endpoint to create commits via GitHub REST API
- [x] Add endpoint to fetch GitHub Actions workflow runs
- [x] Implement WebSocket server for live log streaming
- [x] Add GitHub Actions API polling functionality

### Phase 3: Frontend Dashboard Development ✅ COMPLETED
- [x] Create Next.js app with basic routing
- [x] Build main dashboard component with "Run Pipeline" button
- [x] Implement WebSocket client for live log updates
- [x] Create log display component with real-time updates
- [x] Add GitHub Actions status badges and indicators
- [x] Style the UI for professional appearance

### Phase 4: Docker Configuration ✅ COMPLETED
- [x] Create multi-stage Dockerfile for frontend (Node build → Nginx serve)
- [x] Create Dockerfile for backend (Node.js Alpine)
- [x] Create docker-compose.yml for local development
- [x] Test local container builds and networking
- [x] Test manually by spinning up the application locally

### Phase 5: GitHub Actions Workflow ✅ COMPLETED
- [x] Create sample Node.js project for CI/CD testing
- [x] Set up GitHub Actions workflow with linting and testing
- [x] Configure workflow to output detailed logs
- [x] Add workflow status reporting back to the application

### Phase 6: GCP Cloud Run Deployment
- [ ] Set up GCP project and enable Cloud Run API
- [ ] Create service account with necessary permissions
- [ ] Configure GitHub Actions for automatic deployment
- [ ] Set up environment variables and secrets
- [ ] Deploy both frontend and backend to Cloud Run

### Phase 7: Integration Testing
- [ ] Test end-to-end workflow: button click → commit → CI/CD → live logs
- [ ] Verify WebSocket connections work in production
- [ ] Test error handling and edge cases
- [ ] Validate GitHub API rate limiting and authentication

### Phase 8: Documentation and Polish
- [ ] Create comprehensive README with setup instructions
- [ ] Add environment variable documentation
- [ ] Create demo GIF showing the full workflow
- [ ] Test the public demo URL functionality

## Technical Requirements

### Frontend Dependencies
- Next.js
- React
- WebSocket client library
- Tailwind CSS (for styling)

### Backend Dependencies
- Express.js
- @octokit/rest (GitHub API client)
- ws (WebSocket server)
- cors
- dotenv

### Environment Variables Needed
- `GITHUB_TOKEN` or `GITHUB_APP_*` credentials
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GCP_PROJECT_ID`
- `GCP_REGION`

## Deployment Strategy
1. Build Docker images locally for testing
2. Set up GCP Cloud Run services
3. Configure GitHub Actions for CI/CD
4. Deploy with automatic scaling and HTTPS

## Success Criteria
- [ ] Users can click one button to trigger a commit
- [ ] GitHub Actions automatically start after commit
- [ ] Live logs stream in real-time to the web UI
- [ ] Deployment works on GCP Cloud Run
- [ ] Public demo URL accessible to clients
- [ ] Complete documentation for self-hosting

## Review Section
*[To be completed after implementation]*

### Changes Made
*[Summary of actual changes implemented]*

### Key Learnings
*[Any important discoveries or decisions made during development]*

### Future Enhancements
*[Potential improvements or features for future iterations]*