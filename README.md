# ForwardsFlow - AWS Amplify Web Application

**Frontier Economy Returns, Advanced Economy Security**

ForwardsFlow is a comprehensive multi-tenant platform connecting impact investors with frontier economy banks, facilitating high-yield deposit instruments and mobile lending operations.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ Super Admin  │ │ Bank Portal  │ │ Investor     │                │
│  │ Dashboard    │ │ (Admin/User) │ │ Portal       │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     AWS AMPLIFY BACKEND                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ Cognito Auth │ │ AppSync API  │ │ S3 Storage   │                │
│  │ (Multi-role) │ │ (GraphQL)    │ │ (Documents)  │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ DynamoDB     │ │ Lambda       │ │ EventBridge  │                │
│  │ (Data Store) │ │ (Functions)  │ │ (Events)     │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### Multi-Tenant Architecture
- **Super Admin**: Platform-wide management and analytics
- **Tenant Admin**: Organization-level administration (Investors, Banks)
- **Tenant User**: Role-specific functionality within organizations

### User Roles & Dashboards

| Role | Access | Dashboard Features |
|------|--------|-------------------|
| Super Admin | Full platform | Tenant management, Platform P&L, Compliance |
| Investor Admin | Organization | User management, Portfolio overview, Analytics |
| Investor User | Limited | Investment opportunities, Portfolio, Reports |
| Bank Admin | Organization | Instruments, Mobile lending, User management |
| Bank User | Limited | Lending operations, Settlements, Reports |

### Core Functionality
- 🏦 **Deposit Instruments**: Create and manage FX-hedged deposit products
- 📱 **Mobile Lending**: WhatsApp-based loan origination and management
- 📊 **Analytics**: Real-time dashboards and reporting
- 🔐 **Security**: Multi-factor authentication, role-based access control
- 🌍 **Multi-currency**: Support for JPY, CHF, USD, EUR, GBP

## 📁 Project Structure

```
forwardsflow-amplify/
├── amplify/                     # Amplify backend configuration
│   └── backend/
│       └── api/
│           └── forwardsflow/
│               └── schema.graphql
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── components/
│   │   ├── auth/               # Login, Registration pages
│   │   ├── bank/               # Bank dashboard components
│   │   ├── common/             # Shared UI components
│   │   ├── investor/           # Investor dashboard components
│   │   ├── layouts/            # Dashboard layouts
│   │   ├── pages/              # Public pages
│   │   └── super-admin/        # Super admin components
│   ├── context/
│   │   └── AuthContext.js      # Authentication state
│   ├── data/
│   │   └── mockData.js         # Demo data
│   ├── App.js                  # Main application with routing
│   ├── index.css               # Tailwind + custom styles
│   └── index.js                # Entry point
├── amplify.yml                 # Amplify build config
├── package.json
├── tailwind.config.js
└── README.md
```

## 🛠️ Prerequisites

- Node.js 18+ and npm
- AWS Account
- AWS CLI configured
- AWS Amplify CLI (`npm install -g @aws-amplify/cli`)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/amorosogombe/forwardsflow-amplify.git
cd forwardsflow-amplify
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Amplify

```bash
amplify init
```

Follow the prompts:
- Project name: `forwardsflow`
- Environment: `dev`
- Default editor: Your choice
- App type: `javascript`
- Framework: `react`
- Source directory: `src`
- Distribution directory: `build`
- Build command: `npm run build`
- Start command: `npm start`

### 4. Add Authentication

```bash
amplify add auth
```

Configure:
- Default configuration with email sign-in
- Enable MFA (recommended for production)
- Create user groups: `SuperAdmins`, `TenantAdmins`, `Investors`, `Banks`

### 5. Add API

```bash
amplify add api
```

Choose:
- GraphQL
- Use the provided schema in `amplify/backend/api/forwardsflow/schema.graphql`
- Authorization: Amazon Cognito User Pool

### 6. Add Storage

```bash
amplify add storage
```

Configure for document uploads (KYC, contracts, etc.)

### 7. Deploy Backend

```bash
amplify push
```

### 8. Start Development Server

```bash
npm start
```

## 🔐 Demo Credentials

For testing purposes, use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@forwardsflow.com | admin123 |
| Bank Admin | admin@equityafrica.com | demo123 |
| Investor Admin | admin@impactcapital.com | demo123 |
| Bank User | lending@equityafrica.com | demo123 |
| Investor User | analyst@impactcapital.com | demo123 |

## 🚀 Deployment

### Deploy to AWS Amplify Console

1. Push to GitHub:
```bash
git add .
git commit -m "Initial ForwardsFlow deployment"
git push origin main
```

2. In AWS Amplify Console:
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select the `main` branch
   - Amplify will auto-detect the build settings
   - Click "Save and deploy"

### Environment Variables

For production, set these in Amplify Console:

```
REACT_APP_AWS_REGION=your-region
REACT_APP_USER_POOL_ID=your-user-pool-id
REACT_APP_USER_POOL_WEB_CLIENT_ID=your-client-id
REACT_APP_GRAPHQL_ENDPOINT=your-appsync-endpoint
```

## 📊 Key Pages

### Super Admin
- `/admin` - Platform dashboard
- `/admin/investors` - Investor tenant management
- `/admin/banks` - Bank tenant management
- `/admin/users` - All users management
- `/admin/analytics` - Platform analytics

### Bank Portal
- `/bank/admin` - Bank admin dashboard
- `/bank/admin/instruments` - Deposit instrument management
- `/bank/admin/lending` - Mobile lending operations
- `/bank/admin/users` - Bank staff management

### Investor Portal
- `/investor` - Investor dashboard
- `/investor/calls` - Investment opportunities
- `/investor/portfolio` - Portfolio management
- `/investor/analytics` - Investment analytics

## 🔧 Customization

### Styling
Edit `tailwind.config.js` to customize:
- Color palette
- Typography
- Spacing
- Shadows

### Mock Data
Modify `src/data/mockData.js` to:
- Add more demo users
- Customize institution types
- Adjust analytics data

### Components
All UI components are in `src/components/common/`:
- `Logo`, `Header`, `StatCard`, `Badge`
- `DataTable`, `Modal`, `Toast`
- Sidebar components for each role

## 📝 API Reference

See `amplify/backend/api/forwardsflow/schema.graphql` for the complete GraphQL schema including:
- User, Tenant models
- Instrument, Investment models
- Loan, Transaction models
- Platform analytics

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📄 License

Proprietary - ForwardsFlow Platform

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section in AWS Amplify docs
2. Review CloudWatch logs for backend errors
3. Check the browser console for frontend errors

---

**ForwardsFlow** - *Connecting Capital to Impact*

Version 2.0.0 | December 2024
