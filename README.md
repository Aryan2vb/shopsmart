# ShopSmart

A simple e-commerce application with React frontend and Express backend.

## Features

- Browse products
- Add items to cart
- Remove items from cart
- View cart total

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js
- **Testing**: Jest, Vitest, Playwright

## Project Structure

```
shopsmart/
├── client/          # React frontend
├── server/          # Express backend
├── e2e/             # E2E tests
└── .github/         # CI/CD workflows
```

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
# Install all dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd server && npm install
```

### Running the Application

```bash
# Start backend (Terminal 1)
cd server && npm start

# Start frontend (Terminal 2)
cd client && npm run dev
```

Open http://localhost:5173

## Testing

### Backend Unit Tests

```bash
cd server && npm test
```

### Frontend Unit & Integration Tests

```bash
cd client && npm test
```

### E2E Tests

```bash
# Make sure backend and frontend are running first
npx playwright test
```

### Run All Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# E2E tests
npx playwright test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products |
| GET | /api/cart | Get cart items |
| POST | /api/cart | Add item to cart |
| DELETE | /api/cart/:id | Remove item from cart |

## CI/CD

Tests run automatically on push/PR to main branch via GitHub Actions.

- Backend unit tests
- Frontend unit/integration tests  
- E2E tests
