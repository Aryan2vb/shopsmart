# ShopSmart DevOps Architecture & Decisions
**Rubric 11: Comprehensive Documentation**

## 1. System Architecture
ShopSmart is built as a microservices-inspired architecture:
- **Frontend**: React-based client served via Vite.
- **Backend**: Express.js server as an API gateway.
- **Database**: Mock JSON-based persistence (extensible to MongoDB/Postgres).
- **Containerization**: Both services and an Nginx reverse proxy are orchestrated via **Docker Compose**.

## 2. CI/CD Pipeline (GitHub Actions)
Our workflow is divided into two main stages:
- **Continuous Integration (CI)**:
  - **Linting**: Automated ESLint checks for both client and server (Rubric 7).
  - **Unit Testing**: Vitest for frontend, Jest for backend (Rubric 4).
  - **E2E Testing**: Playwright simulation of user flows (Login → Search → Cart) (Rubric 6).
- **Continuous Deployment (CD)**:
  - **AWS EC2 Integration**: SSH-based deployment triggered after a successful merge to `main` (Rubric 9).
  - **Security**: All AWS credentials and SSH keys are stored securely in **GitHub Secrets**.

## 3. Automation & Efficiency
- **Dependabot**: Daily checks for outdated or vulnerable dependencies (Rubric 8).
- **Idempotency**: All deployment scripts use idempotent commands (e.g., `mkdir -p`, `docker-compose down || true`) to ensure consistent results across multiple runs (Rubric 10).

## 4. Challenges & Design Decisions
- **E2E Testing with Docker**: We opted for Playwright within the CI environment, using Docker Compose to spin up fresh services for every test run to ensure isolation and reproducibility.
- **Fail-Fast Policy**: Our CI pipeline is configured to fail early if linting or unit tests fail, preventing bad code from ever reaching the E2E or deployment stages.

---
*Created for DevOps Evaluation 2026*
