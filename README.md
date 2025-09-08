# BudgetBox Frontend

## Overview

BudgetBox Frontend is a React-based web application for personal finance management. It provides a user interface for tracking expenses, managing budgets, and visualizing financial data through integration with the BudgetBox REST API.

## Features

### Current Implementation

- Token-based authentication with protected routes
- Material-UI component library integration
- Responsive layout system
- Environment-based configuration
- API service layer with Axios
- React Router for client-side routing

### Core Functionality

- User authentication (login/register/logout)
- Dashboard with financial overview
- Bank account management (multiple account types)
- Transaction recording and categorization
- Budget creation and monitoring
- Data visualization with charts

## Technology Stack

| Technology   | Purpose             | Version |
| ------------ | ------------------- | ------- |
| React        | UI Framework        | 18.2.0  |
| Material-UI  | Component Library   | 5.14.x  |
| React Router | Client-side Routing | 6.x     |
| Axios        | HTTP Client         | 1.6.x   |
| Recharts     | Data Visualization  | 2.10.x  |
| date-fns     | Date Manipulation   | 2.30.x  |

## Prerequisites

- Node.js v16.0.0 or higher
- npm v8.0.0 or higher
- Git
- BudgetBox API running locally ([backend repository](https://github.com/Vincent-Ngobeh/budgetbox-api))

## Installation

### Clone Repository

```bash
git clone https://github.com/Vincent-Ngobeh/budgetbox-frontend.git
cd budgetbox-frontend
```

### Install Dependencies

```bash
npm install
```

### Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

| Variable             | Description          | Default                     |
| -------------------- | -------------------- | --------------------------- |
| `REACT_APP_API_URL`  | Backend API endpoint | `http://localhost:8000/api` |
| `REACT_APP_APP_NAME` | Application name     | `BudgetBox`                 |

### Start Development Server

```bash
npm start
```

Application will be available at [http://localhost:3000](http://localhost:3000)

### Verify Backend Connection

Ensure the Django backend is running:

```bash
# In your budgetbox-api directory
python manage.py runserver
```

## Project Structure

```
budgetbox-frontend/
├── public/                 # Static files
│   ├── index.html         # HTML template
│   └── manifest.json      # PWA manifest
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   │   ├── Layout/       # Application layout
│   │   ├── common/       # Shared components
│   │   └── charts/       # Chart components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── context/          # React Context
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   ├── App.jsx          # Root component
│   └── index.js         # Entry point
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── .prettierrc         # Code formatter config
├── .eslintrc.json      # Linter config
├── package.json        # Dependencies
├── LICENSE             # MIT License
└── README.md          # Documentation
```

## Available Scripts

| Script       | Description                 | Command                |
| ------------ | --------------------------- | ---------------------- |
| start        | Run development server      | `npm start`            |
| build        | Create production build     | `npm run build`        |
| test         | Run test suite              | `npm test`             |
| eject        | Eject from Create React App | `npm run eject`        |
| lint         | Check code quality          | `npm run lint`         |
| lint:fix     | Auto-fix linting issues     | `npm run lint:fix`     |
| format       | Format code with Prettier   | `npm run format`       |
| format:check | Check formatting            | `npm run format:check` |

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watchAll
```

## Building for Production

```bash
# Create optimized build
npm run build
```

Build output will be in the `build` directory.

### Serve Production Build Locally

```bash
# Install serve globally
npm install -g serve

# Serve the build
serve -s build -l 3000
```

## Deployment

### Static Hosting Services

The build output can be deployed to any static hosting service:

#### Netlify

1. Run `npm run build`
2. Upload `build` folder to Netlify Drop
3. Configure environment variables in Netlify dashboard

#### Vercel

```bash
npm i -g vercel
vercel --prod
```

#### GitHub Pages

```bash
npm install --save-dev gh-pages
# Add deploy script to package.json
npm run deploy
```

## Configuration

### Code Formatting

Prettier configuration in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Linting

ESLint extends Create React App configuration with additional rules defined in `.eslintrc.json`.

## API Integration

Required backend endpoints:

| Endpoint              | Method    | Purpose                |
| --------------------- | --------- | ---------------------- |
| `/api/auth/login/`    | POST      | User authentication    |
| `/api/auth/register/` | POST      | User registration      |
| `/api/auth/logout/`   | POST      | Session termination    |
| `/api/auth/profile/`  | GET       | User profile data      |
| `/api/accounts/`      | GET, POST | Account management     |
| `/api/transactions/`  | GET, POST | Transaction operations |
| `/api/categories/`    | GET, POST | Category management    |
| `/api/budgets/`       | GET, POST | Budget operations      |

## Troubleshooting

### Port Already in Use

```bash
# Windows PowerShell
netstat -ano | findstr :3000

# Use different port
$env:PORT=3001; npm start
```

### CORS Errors

- Verify backend is running
- Check Django `CORS_ALLOWED_ORIGINS` setting
- Confirm API URL in `.env` file

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend Connection Issues

- Confirm Django server is running on port 8000
- Verify `.env` API URL configuration
- Check backend CORS settings

## Performance Considerations

- Code splitting implemented for route-based chunks
- Lazy loading for heavy components
- API response caching strategy
- Optimized bundle size through tree shaking

## Security

- Token storage in localStorage with expiration handling
- Environment variables for sensitive configuration
- Input validation on all forms
- XSS protection through React default escaping
- HTTPS enforcement in production

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**[Vincent Sam Ngobeh]**

- GitHub: [Vincent-Ngobeh](https://github.com/Vincent-Ngobeh)
- LinkedIn: [Vincent](https://www.linkedin.com/in/vincent-ngobeh/)
- Email: vincentngobeh@gmail.com

## Acknowledgments

- Material-UI for component library
- Create React App for project bootstrapping
- Django REST Framework for backend API
