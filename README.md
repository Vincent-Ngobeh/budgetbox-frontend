# BudgetBox Frontend

A modern, responsive React-based web application for personal finance management. This frontend application provides an intuitive user interface for tracking expenses, managing budgets, monitoring accounts, and visualizing financial data through seamless integration with the BudgetBox REST API.

**Live Demo**: [https://budgetbox-frontend.vercel.app](https://budgetbox-frontend.vercel.app)

**Backend API**: [https://budgetbox-api-ckwq.onrender.com](https://budgetbox-api-ckwq.onrender.com)

**Backend Repository**: [github.com/Vincent-Ngobeh/budgetbox-api](https://github.com/Vincent-Ngobeh/budgetbox-api)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Routing](#routing)
- [Styling & Theming](#styling--theming)
- [Responsive Design](#responsive-design)
- [Security](#security)
- [Performance](#performance)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

---

## Features

### Authentication & User Management

- **Secure Login/Registration**: Token-based authentication with form validation
- **Profile Management**: View and update personal information
- **Password Change**: Secure password update with automatic token rotation
- **Session Persistence**: Automatic session restoration on page refresh
- **Protected Routes**: Route guards preventing unauthorized access

### Dashboard

- **Financial Overview**: At-a-glance view of total balance, income, expenses, and net savings
- **Account Summary**: Quick view of all accounts with current balances
- **Recent Activity**: Latest transactions displayed in real-time
- **Top Spending Categories**: Visual breakdown of spending by category
- **30-Day Statistics**: Comprehensive financial metrics for the past month

### Bank Account Management

- **Multi-Account Support**: Manage Current, Savings, Credit Card, and ISA accounts
- **Multi-Currency Support**: GBP, USD, and EUR currencies
- **Account CRUD Operations**: Create, view, edit, and delete accounts
- **Account Deactivation**: Safely deactivate accounts without deletion
- **Balance Tracking**: Real-time balance updates after transactions
- **Masked Account Numbers**: Secure display of account numbers (\*\*\*\*1234)
- **Filtering & Sorting**: Filter by account type, status, and currency

### Transaction Management

- **Complete Transaction Tracking**: Record income, expenses, and transfers
- **Advanced Filtering**: Filter by date range, account, category, type, and amount
- **Search Functionality**: Full-text search across transaction descriptions
- **Bulk Categorization**: Categorize multiple transactions at once
- **Transaction Duplication**: Quick duplicate for recurring transactions
- **CSV Export**: Export filtered transactions for external use
- **Pagination**: Server-side pagination for efficient data loading
- **Statistics View**: Income, expense, and net totals for filtered period

### Category Management

- **Custom Categories**: Create and manage income/expense categories
- **Default Categories**: System-generated default categories for new users
- **Transaction Reassignment**: Move transactions between categories
- **Category Usage Stats**: View transaction count per category
- **Active/Inactive Toggle**: Deactivate categories without losing history

### Budget Tracking

- **Budget Creation**: Set spending limits by category and time period
- **Progress Monitoring**: Visual progress bars showing budget utilization
- **Period Support**: Weekly, monthly, quarterly, and yearly budgets
- **Budget Overview**: Consolidated view of all active budgets
- **Smart Recommendations**: AI-powered suggestions for budget adjustments
- **Budget Cloning**: Clone budgets for the next period
- **Bulk Budget Creation**: Create multiple budgets from templates (Essential/Comprehensive)
- **Status Indicators**: On Track, Monitor, Warning, and Exceeded states

### User Experience

- **Responsive Design**: Fully responsive layout for mobile, tablet, and desktop
- **Mobile-First Cards**: Card-based layouts on mobile for better touch interaction
- **Desktop Data Grids**: Full-featured data grids with sorting and selection on desktop
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and recovery options
- **Success Feedback**: Toast notifications for completed actions
- **Collapsible Filters**: Space-efficient filter panels on mobile

---

## Tech Stack

| Category            | Technology         | Version            |
| ------------------- | ------------------ | ------------------ |
| **Framework**       | React              | 18.2.0             |
| **Build Tool**      | Vite               | 7.2.4              |
| **UI Library**      | Material-UI (MUI)  | 5.14.19            |
| **Data Grid**       | MUI X Data Grid    | 6.18.0             |
| **Date Picker**     | MUI X Date Pickers | 6.18.0             |
| **Routing**         | React Router DOM   | 6.22.0             |
| **HTTP Client**     | Axios              | 1.11.0             |
| **Charts**          | Recharts           | 2.10.4             |
| **Date Utilities**  | date-fns           | 2.30.0             |
| **Code Formatting** | Prettier           | 3.6.2              |
| **Linting**         | ESLint             | (react-app config) |
| **Deployment**      | Vercel             | -                  |

### Dependencies Overview

```json
{
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.19",
    "@mui/system": "^5.14.19",
    "@mui/x-data-grid": "^6.18.0",
    "@mui/x-date-pickers": "^6.18.0",
    "axios": "^1.11.0",
    "date-fns": "^2.30.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "recharts": "^2.10.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.1",
    "eslint-config-prettier": "^10.1.8",
    "prettier": "^3.6.2",
    "vite": "^7.2.4"
  }
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BudgetBox Frontend                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │  Components │  │   Context   │             │
│  │             │  │             │  │             │             │
│  │ - Dashboard │  │ - Layout    │  │ - AuthCtx   │             │
│  │ - Accounts  │  │ - Forms     │  │             │             │
│  │ - Transact. │  │ - Dialogs   │  └──────┬──────┘             │
│  │ - Categories│  │ - Common    │         │                    │
│  │ - Budgets   │  │             │         │                    │
│  │ - Profile   │  └──────┬──────┘         │                    │
│  │ - Login     │         │                │                    │
│  │ - Register  │         │                │                    │
│  └──────┬──────┘         │                │                    │
│         │                │                │                    │
│  ┌──────┴────────────────┴────────────────┴──────┐             │
│  │                 Services Layer                 │             │
│  │                                                │             │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────┐  │             │
│  │  │ authSvc  │ │accountSvc │ │transactionSvc│  │             │
│  │  └────┬─────┘ └─────┬─────┘ └──────┬───────┘  │             │
│  │       │             │              │          │             │
│  │  ┌────┴─────┐ ┌─────┴─────┐ ┌──────┴──────┐   │             │
│  │  │categorySvc│ │budgetSvc │ │   api.js    │   │             │
│  │  └──────────┘ └───────────┘ └──────┬──────┘   │             │
│  └────────────────────────────────────┼──────────┘             │
│                                       │                        │
│  ┌────────────────────────────────────┴──────────┐             │
│  │              Utilities & Helpers              │             │
│  │                                               │             │
│  │  formatters.js (currency, dates, etc.)        │             │
│  └───────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (Axios)
                              ▼
                ┌─────────────────────────┐
                │   BudgetBox REST API    │
                │   (Django Backend)      │
                └─────────────────────────┘
```

---

## Screenshots

### Dashboard

The main dashboard provides a comprehensive financial overview with:

- Total balance across all accounts
- 30-day income and expense summaries
- Recent transaction activity
- Top spending categories breakdown

### Accounts Management

Manage multiple bank accounts with:

- Summary cards by account type
- Full-featured data grid (desktop)
- Mobile-optimized card layout
- Filtering by type and status

### Transaction Tracking

Complete transaction management featuring:

- Advanced multi-criteria filtering
- Bulk selection and categorization
- CSV export functionality
- Server-side pagination

### Budget Monitoring

Track spending against budgets with:

- Visual progress indicators
- Status-based color coding
- Smart budget recommendations
- One-click budget cloning

---

## Getting Started

### Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **BudgetBox API**: Running locally or accessible remotely

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Vincent-Ngobeh/budgetbox-frontend.git
cd budgetbox-frontend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration (see [Environment Variables](#environment-variables)).

#### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

#### 5. Verify Backend Connection

For local development, ensure the Django backend is running:

```bash
# In your budgetbox-api directory
python manage.py runserver
```

### Demo Credentials

For testing purposes, you can use the following demo credentials:

| Field    | Value         |
| -------- | ------------- |
| Username | `testuser`    |
| Password | `testpass123` |

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable        | Description                   | Default                     | Required |
| --------------- | ----------------------------- | --------------------------- | -------- |
| `VITE_API_URL`  | Backend API base URL          | `http://localhost:8000/api` | Yes      |
| `VITE_APP_NAME` | Application name for branding | `BudgetBox`                 | No       |

### Example `.env` Configuration

```env
# Development (local backend)
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=BudgetBox

# Production (deployed backend)
VITE_API_URL=https://budgetbox-api-ckwq.onrender.com/api
VITE_APP_NAME=BudgetBox
```

---

## Available Scripts

| Script         | Command                | Description                            |
| -------------- | ---------------------- | -------------------------------------- |
| `dev`          | `npm run dev`          | Start Vite development server with HMR |
| `start`        | `npm start`            | Alias for `npm run dev`                |
| `build`        | `npm run build`        | Create optimized production build      |
| `preview`      | `npm run preview`      | Preview production build locally       |
| `lint`         | `npm run lint`         | Run ESLint on source files             |
| `lint:fix`     | `npm run lint:fix`     | Auto-fix ESLint issues                 |
| `format`       | `npm run format`       | Format code with Prettier              |
| `format:check` | `npm run format:check` | Check code formatting                  |

### Development Workflow

```bash
# Start development server
npm run dev

# Check code quality before committing
npm run lint
npm run format:check

# Fix any issues
npm run lint:fix
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
budgetbox-frontend/
├── public/                     # Static assets
│   ├── index.html             # HTML template (legacy)
│   ├── favicon.ico            # App favicon
│   ├── logo192.png            # PWA icon (192x192)
│   ├── logo512.png            # PWA icon (512x512)
│   ├── manifest.json          # PWA manifest
│   └── robots.txt             # Search engine directives
│
├── src/                        # Source code
│   ├── components/            # Reusable UI components
│   │   ├── Layout/           # App layout components
│   │   │   ├── Header.jsx    # Navigation header
│   │   │   └── PrivateRoute.jsx  # Route guard
│   │   ├── accounts/         # Account-related components
│   │   │   └── AccountFormDialog.jsx
│   │   ├── budgets/          # Budget-related components
│   │   │   ├── BudgetFormDialog.jsx
│   │   │   └── BudgetProgressDialog.jsx
│   │   ├── categories/       # Category-related components
│   │   │   ├── CategoryFormDialog.jsx
│   │   │   └── ReassignDialog.jsx
│   │   ├── transactions/     # Transaction-related components
│   │   │   ├── TransactionFormDialog.jsx
│   │   │   └── BulkCategorizeDialog.jsx
│   │   └── common/           # Shared components
│   │       └── ConfirmDialog.jsx
│   │
│   ├── pages/                 # Page components
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── Accounts.jsx      # Account management
│   │   ├── Transactions.jsx  # Transaction management
│   │   ├── Categories.jsx    # Category management
│   │   ├── Budgets.jsx       # Budget tracking
│   │   ├── Profile.jsx       # User profile
│   │   ├── Login.jsx         # Login page
│   │   └── Register.jsx      # Registration page
│   │
│   ├── services/              # API service layer
│   │   ├── api.js            # Axios instance & interceptors
│   │   ├── authService.js    # Authentication API calls
│   │   ├── accountService.js # Account API calls
│   │   ├── transactionService.js  # Transaction API calls
│   │   ├── categoryService.js     # Category API calls
│   │   └── budgetService.js       # Budget API calls
│   │
│   ├── context/               # React Context providers
│   │   └── AuthContext.jsx   # Authentication state
│   │
│   ├── utils/                 # Utility functions
│   │   └── formatters.js     # Currency, date, number formatters
│   │
│   ├── App.js                 # Root component with routing
│   ├── App.css               # Global styles
│   ├── index.js              # Application entry point
│   └── index.css             # Base styles
│
├── .env.example               # Environment variables template
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
├── .prettierignore           # Prettier ignore rules
├── .gitignore                # Git ignore rules
├── index.html                # Vite HTML entry point
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── vercel.json               # Vercel deployment config
├── LICENSE                   # MIT License
└── README.md                 # Project documentation
```

---

## Key Components

### Layout Components

#### Header (`src/components/Layout/Header.jsx`)

- Responsive navigation bar
- Dynamic menu based on authentication state
- Mobile hamburger menu
- User profile dropdown

#### PrivateRoute (`src/components/Layout/PrivateRoute.jsx`)

- Route guard for protected pages
- Redirects unauthenticated users to login
- Preserves intended destination for post-login redirect

### Form Dialogs

All form dialogs follow a consistent pattern:

- Material-UI Dialog components
- Form validation with error display
- Loading states during submission
- Success/error callback handling

| Component               | Purpose                        |
| ----------------------- | ------------------------------ |
| `AccountFormDialog`     | Create/edit bank accounts      |
| `TransactionFormDialog` | Create/edit transactions       |
| `CategoryFormDialog`    | Create/edit categories         |
| `BudgetFormDialog`      | Create/edit budgets            |
| `BudgetProgressDialog`  | View budget progress details   |
| `BulkCategorizeDialog`  | Bulk categorize transactions   |
| `ReassignDialog`        | Reassign category transactions |
| `ConfirmDialog`         | Generic confirmation dialog    |

---

## API Integration

### Service Layer

The application uses a dedicated service layer for all API communications:

```javascript
// src/services/api.js - Base Axios configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor adds auth token
// Response interceptor handles 401 errors
```

### API Endpoints Used

| Service          | Endpoint                                  | Methods                 | Description               |
| ---------------- | ----------------------------------------- | ----------------------- | ------------------------- |
| **Auth**         | `/auth/login/`                            | POST                    | User login                |
|                  | `/auth/register/`                         | POST                    | User registration         |
|                  | `/auth/logout/`                           | POST                    | User logout               |
|                  | `/auth/profile/`                          | GET                     | Get user profile          |
|                  | `/auth/profile/update/`                   | PATCH                   | Update profile            |
|                  | `/auth/change-password/`                  | POST                    | Change password           |
| **Accounts**     | `/accounts/`                              | GET, POST               | List/create accounts      |
|                  | `/accounts/{id}/`                         | GET, PUT, PATCH, DELETE | Account operations        |
|                  | `/accounts/summary/`                      | GET                     | Get accounts summary      |
|                  | `/accounts/{id}/deactivate/`              | POST                    | Deactivate account        |
| **Transactions** | `/transactions/`                          | GET, POST               | List/create transactions  |
|                  | `/transactions/{id}/`                     | GET, PUT, PATCH, DELETE | Transaction operations    |
|                  | `/transactions/statistics/`               | GET                     | Get spending statistics   |
|                  | `/transactions/bulk_categorize/`          | POST                    | Bulk categorization       |
|                  | `/transactions/{id}/duplicate/`           | POST                    | Duplicate transaction     |
| **Categories**   | `/categories/`                            | GET, POST               | List/create categories    |
|                  | `/categories/{id}/`                       | GET, PUT, PATCH, DELETE | Category operations       |
|                  | `/categories/set_defaults/`               | POST                    | Create default categories |
|                  | `/categories/{id}/reassign_transactions/` | POST                    | Reassign & delete         |
| **Budgets**      | `/budgets/`                               | GET, POST               | List/create budgets       |
|                  | `/budgets/{id}/`                          | GET, PUT, PATCH, DELETE | Budget operations         |
|                  | `/budgets/{id}/progress/`                 | GET                     | Get budget progress       |
|                  | `/budgets/overview/`                      | GET                     | Get budgets overview      |
|                  | `/budgets/recommendations/`               | GET                     | Get recommendations       |
|                  | `/budgets/{id}/clone/`                    | POST                    | Clone budget              |
|                  | `/budgets/bulk_create/`                   | POST                    | Bulk create from template |

---

## State Management

### Authentication Context

The application uses React Context for global authentication state:

```javascript
// src/context/AuthContext.jsx
const AuthContext = createContext(null);

// Provided values:
{
  (user, // Current user object
    loading, // Auth state loading
    error, // Auth error message
    login, // Login function
    register, // Register function
    logout, // Logout function
    updateProfile, // Update profile function
    changePassword, // Change password function
    isAuthenticated); // Boolean auth status
}
```

### Local Component State

Individual pages manage their own state for:

- Data fetching and caching
- Form inputs and validation
- UI state (dialogs, filters, pagination)
- Loading and error states

---

## Routing

### Route Configuration

```javascript
// Public Routes
/login          → Login page
/register       → Registration page

// Protected Routes (require authentication)
/dashboard      → Main dashboard
/accounts       → Bank account management
/transactions   → Transaction management
/categories     → Category management
/budgets        → Budget tracking
/profile        → User profile

// Redirects
/               → Redirects to /dashboard (if authenticated) or /login
/*              → Redirects to / (catch-all)
```

### Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Entry                         │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Check Auth State │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │  Authenticated  │          │ Not Authenticated│
    └────────┬────────┘          └────────┬────────┘
             │                            │
             ▼                            ▼
    ┌─────────────────┐          ┌─────────────────┐
    │   /dashboard    │          │    /login       │
    └─────────────────┘          └─────────────────┘
```

---

## Styling & Theming

### Material-UI Theme

Custom theme configuration in `src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      lighter: '#E3F2FD',
    },
    secondary: {
      main: '#dc004e',
      lighter: '#FCE4EC',
    },
    success: {
      main: '#2e7d32',
      lighter: '#E8F5E9',
    },
    error: {
      main: '#d32f2f',
      lighter: '#FFEBEE',
    },
    info: {
      main: '#0288d1',
      lighter: '#E1F5FE',
    },
    warning: {
      main: '#ed6c02',
      lighter: '#FFF4E5',
    },
  },
});
```

### Styling Approach

- **MUI sx prop**: Component-level inline styles
- **Emotion**: CSS-in-JS for complex styling
- **Global CSS**: Base styles in `index.css` and `App.css`

---

## Responsive Design

### Breakpoints

Following Material-UI breakpoint system:

| Breakpoint | Width       | Target Devices                     |
| ---------- | ----------- | ---------------------------------- |
| `xs`       | 0-599px     | Mobile phones                      |
| `sm`       | 600-899px   | Tablets (portrait)                 |
| `md`       | 900-1199px  | Tablets (landscape), small laptops |
| `lg`       | 1200-1535px | Desktops                           |
| `xl`       | 1536px+     | Large desktops                     |

### Responsive Patterns

1. **Mobile (xs-sm)**
   - Card-based layouts for data display
   - Collapsible filter panels
   - Stacked action buttons
   - Hamburger navigation menu

2. **Desktop (md+)**
   - Data grids with sorting and selection
   - Side-by-side layouts
   - Expanded filter panels
   - Full navigation bar

### Implementation Example

```javascript
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

{
  isMobile ? (
    <MobileCardView data={data} />
  ) : (
    <DataGrid rows={data} columns={columns} />
  );
}
```

---

## Security

### Authentication

- **Token-based Auth**: Django REST Framework token authentication
- **Secure Storage**: Auth tokens stored in localStorage
- **Auto-logout**: 401 responses trigger automatic logout
- **Token Rotation**: New token issued on password change

### Data Protection

- **XSS Prevention**: React's built-in escaping
- **Input Validation**: Client-side form validation
- **HTTPS**: Enforced in production
- **CORS**: Backend configured for frontend origin

### Best Practices

- Environment variables for sensitive configuration
- No sensitive data in client-side code
- Secure password handling (never logged or displayed)
- Protected routes for authenticated content

---

## Performance

### Optimization Techniques

1. **Code Splitting**: Route-based lazy loading potential
2. **Memoization**: React hooks for expensive computations
3. **Server-side Pagination**: Efficient data loading
4. **Parallel API Calls**: Promise.all for independent requests
5. **Optimized Builds**: Vite production builds with tree-shaking

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### Performance Tips

- Initial data fetched in parallel on page load
- Statistics cached and refreshed on data changes
- Pagination limits data transfer per request
- Filters debounced to reduce API calls

---

## Deployment

### Vercel Deployment (Recommended)

The project is configured for seamless Vercel deployment:

#### 1. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### 2. Vercel Configuration

The `vercel.json` file handles SPA routing:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 3. Environment Variables

Set in Vercel Dashboard:

- `VITE_API_URL`: Your backend API URL

### Alternative Deployment Options

#### Netlify

```bash
# Build the project
npm run build

# Deploy via Netlify CLI
npx netlify deploy --prod --dir=build
```

Add `_redirects` file to `public/`:

```
/*    /index.html   200
```

#### Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Static Hosting

```bash
# Build the project
npm run build

# The 'build' directory contains static files
# Upload to any static hosting service
```

---

## Troubleshooting

### Common Issues

#### CORS Errors

**Symptom**: API requests blocked by CORS policy

**Solutions**:

1. Verify backend `CORS_ALLOWED_ORIGINS` includes frontend URL
2. Check `VITE_API_URL` in `.env` file
3. Ensure backend is running and accessible

#### Authentication Issues

**Symptom**: Logged out unexpectedly

**Solutions**:

1. Check browser localStorage for `authToken`
2. Verify token hasn't expired on backend
3. Clear localStorage and login again

#### Build Failures

**Symptom**: `npm run build` fails

**Solutions**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for ESLint errors
npm run lint
```

#### Port Already in Use

**Symptom**: Port 3000 already in use

**Solutions**:

```bash
# Linux/macOS
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
VITE_PORT=3001 npm run dev
```

#### Blank Page After Build

**Symptom**: Production build shows blank page

**Solutions**:

1. Check browser console for errors
2. Verify `base` in `vite.config.js` if not served from root
3. Ensure SPA rewrites configured on hosting platform

### Debug Mode

Enable verbose logging:

```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

---

## Browser Support

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 90+             |
| Firefox | 88+             |
| Safari  | 14+             |
| Edge    | 90+             |
| Opera   | 76+             |

### Not Supported

- Internet Explorer (all versions)
- Older mobile browsers

---

## Contributing

This is a portfolio project, but feedback and suggestions are welcome!

### Development Guidelines

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Follow code style**
   ```bash
   npm run lint
   npm run format
   ```
4. **Commit with clear messages**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Open a Pull Request**

### Code Style

- ESLint configuration extends `react-app` and `prettier`
- Prettier for consistent formatting
- Functional components with hooks
- Clear component and function naming

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Vincent Sam Ngobeh**

- GitHub: [@Vincent-Ngobeh](https://github.com/Vincent-Ngobeh)
- LinkedIn: [Vincent Ngobeh](https://www.linkedin.com/in/vincent-ngobeh/)
- Email: vincentngobeh@gmail.com

---

## Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Material-UI](https://mui.com/) - Component library
- [Vite](https://vitejs.dev/) - Build tool
- [Axios](https://axios-http.com/) - HTTP client
- [React Router](https://reactrouter.com/) - Routing library
- [Recharts](https://recharts.org/) - Charting library
- [Vercel](https://vercel.com/) - Hosting platform
- [Django REST Framework](https://www.django-rest-framework.org/) - Backend API framework

---

**Note**: This is a portfolio project demonstrating proficiency in React, Material-UI, modern JavaScript, responsive design, and full-stack application development.
