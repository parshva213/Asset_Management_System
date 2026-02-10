# Asset Management System (AMS)

A comprehensive web-based Asset Management System built with React.js, Node.js, Express.js, and MySQL. The system provides role-based access control for managing organizational assets, locations, rooms, teams, and tracking with hierarchical navigation.

## 🚀 Features

### Role-Based Access Control
- **Super Admin**: Full system access including organizations, locations, rooms, assets, categories, and user management
- **IT Supervisor**: Location-specific asset management, room supervision, and team coordination
- **Employee**: View assigned assets, submit requests, and manage personal profile
- **Maintenance Team**: Maintenance task management and asset servicing
- **Vendor**: Supply management and vendor-specific operations
- **Software Developer**: Platform maintenance, organization management, and system-wide monitoring

### Core Functionality

#### 📦 Asset Management
- Complete CRUD operations for hardware and software assets
- Bulk asset creation with smart serial number generation
- Asset assignment to users with tracking
- Serial number format: `{CompanyName}-{AssetName}-{Type}-{Category}-{Location}-{SequentialNumber}`
- Filter assets by location, room, category, type, and status
- Warranty tracking and expiry management

#### 🏢 Organization & Location Management
- Multi-level hierarchy: Organizations → Locations → Rooms
- Location-based asset and user organization
- Room capacity and occupancy tracking
- Asset count per location and room
- Navigation drill-down from locations to rooms to assets/teams

#### 👥 User & Team Management
- **Multi-step Registration**: Intelligent registration flow for IT Supervisors (Location -> Room filtering)
- User assignment to locations and rooms
- Asset assignment/unassignment to users
- Team view by location or room
- Maintenance team management per location
- Employee management with department tracking

#### 📋 Request System
- Submit, track, and manage asset requests
- Request status workflow (Pending, Approved, Rejected, Completed)
- Role-based request visibility and management

#### 🏷️ Category Management
- **Stepped Form**: Interactive multi-step process for organizing assets by custom categories
- Category-based filtering and reporting

### Navigation Features
- **Hierarchical Navigation**: 
  - Locations → Rooms → (Team/Assets)
  - Back navigation with context preservation
  - Query parameter-based filtering
- **Dropdown Actions**: View team members or assets for specific locations/rooms
- **Breadcrumb Navigation**: Clear path indication with back buttons

### Authentication Features
- Role-based registration with validation
- JWT-based authentication
- Password management and reset functionality
- Forgot password with email simulation
- Profile management for all users
- Auto-approval system for valid credentials

## 🛠️ Technology Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **Express.js** - Web framework
- **MySQL** (v8+) - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **Helmet** - Security headers
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** (v18.2) - UI framework
- **React Router DOM** (v6.8) - Client-side routing
- **Axios** (v1.3) - API communication
- **Context API** - State management (Auth, Theme, Toast)
- **CSS3** - Modern styling with custom design system
- **clsx** - Conditional class names

## 📁 Project Structure

```
Asset_Management_System/
├── backend/
│   ├── config/
│   │   └── database.js              # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   ├── errorHandler.js          # Global error handler
│   │   └── validate.js              # Request validation
│   ├── routes/
│   │   ├── assets.js                # Asset CRUD + filtering
│   │   ├── auth.js                  # Login, register, profile
│   │   ├── categories.js            # Category management
│   │   ├── locations.js             # Locations + rooms
│   │   ├── maintenance.js           # Maintenance tasks
│   │   ├── organizations.js         # Organization management
│   │   ├── purchaseOrders.js        # Purchase orders
│   │   ├── requests.js              # Asset requests
│   │   └── users.js                 # User + asset assignment
│   ├── scripts/
│   │   ├── checkAdminUser.js        # Admin verification
│   │   ├── setupDatabase.js         # DB initialization
│   │   └── testConnection.js        # DB connection test
│   ├── utils/
│   │   └── activityLogger.js        # Audit logging
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── server.js                    # Express app entry
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.js
│   │   │   ├── Layout.js            # Main layout with sidebar
│   │   │   ├── Loading.js
│   │   │   ├── ProtectedRoute.js    # Route guards
│   │   │   ├── ThemeToggle.js
│   │   │   ├── Toast.js
│   │   │   └── ToastContainer.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js       # User authentication state
│   │   │   ├── ThemeContext.js      # Light/dark theme
│   │   │   └── ToastContext.js      # Toast notifications
│   │   ├── hooks/
│   │   │   └── useCrud.js           # Reusable CRUD operations
│   │   ├── pages/
│   │   │   ├── AdminDashboard.js    # Super Admin dashboard
│   │   │   ├── Assets.js            # Asset management
│   │   │   ├── Categories.js        # Category management
│   │   │   ├── Dashboard.js         # Role-based dashboard router
│   │   │   ├── EmployeeDashboard.js # Employee dashboard
│   │   │   ├── Employees.js         # Employee list
│   │   │   ├── LocationAssets.js    # Filtered asset view
│   │   │   ├── LocationRoomAssets.js # Assets by location/room
│   │   │   ├── LocationRooms.js     # Rooms in location
│   │   │   ├── Locations.js         # Location management
│   │   │   ├── Login.js
│   │   │   ├── MainUsers.js         # Maintenance team
│   │   │   ├── MaintenanceDashboard.js
│   │   │   ├── MaintenanceTasks.js
│   │   │   ├── NewConfiguration.js  # Maintenance config
│   │   │   ├── Organizations.js     # Organization management
│   │   │   ├── Profile.js           # User profile
│   │   │   ├── purchase-orders.js   # Purchase orders
│   │   │   ├── Register.js          # User registration
│   │   │   ├── Requests.js          # Asset requests
│   │   │   ├── ResetPassword.js
│   │   │   ├── RoleSelection.js
│   │   │   ├── SDDashboard.js       # Software Developer Dashboard
│   │   │   ├── SupervisorDashboard.js # IT Supervisor dashboard
│   │   │   ├── SupplyAssets.js      # Vendor supply view
│   │   │   ├── TeamUser.js          # Team members view
│   │   │   ├── UpdateMaintenance.js
│   │   │   ├── UpdatePassword.js
│   │   │   ├── Users.js             # User management
│   │   │   ├── VendorAssets.js
│   │   │   ├── VendorDashboard.js
│   │   │   ├── VendorRequests.js
│   │   │   └── WarrantyDocs.js
│   │   ├── utils/
│   │   │   ├── dateUtils.js         # Date formatting
│   │   │   └── uniqueKeyGenerator.js # Key generation
│   │   ├── api.js                   # Axios instance
│   │   ├── App.js                   # Route definitions
│   │   ├── App.css                  # Component styles
│   │   ├── index.css                # Global styles + design system
│   │   └── index.js                 # React entry point
│   └── package.json
├── database/
│   ├── schema.sql                   # Complete DB schema
│   └── seed.sql                     # Sample data
├── .gitignore
├── package.json                     # Root package (concurrently)
└── README.md
```

## 🚦 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/parshva213/Asset_Management_System.git
   cd Asset_Management_System
   ```

2. **Database Setup**
   ```bash
   # Login to MySQL
   mysql -u root -p
   
   # Create database
   CREATE DATABASE asset_management;
   USE asset_management;
   
   # Import schema
   SOURCE database/schema.sql;
   
   # (Optional) Import seed data
   SOURCE database/seed.sql;
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   ```

   **`.env` Configuration:**
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=asset_management
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   NODE_ENV=development
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the Application**
   
   **Option 1: Run both servers concurrently (from root)**
   ```bash
   cd ..
   npm install
   npm run dev
   ```
   
   **Option 2: Run separately**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👤 User Roles & Registration

### Registration Process
1. Navigate to http://localhost:3000
2. Click "Register here"
3. Select your role
4. Fill out the registration form with role-specific requirements

### Role Requirements

#### Super Admin
- **Requirements**: None - immediate access
- **Capabilities**: Full system access, manage all resources

#### IT Supervisor
- **Requirements**: Valid authorization key
- **Valid Keys**: `SUP2024`, `ADMIN123`, `SUPERVISOR001`
- **Capabilities**: Location/room management, asset assignment, team supervision

#### Employee
- **Requirements**: Valid employee ID format
- **Format**: `EMP` followed by 4 digits (e.g., `EMP1234`, `EMP5678`)
- **Capabilities**: View assigned assets, submit requests

### Auto-Approval System
Users with valid credentials are automatically approved and logged in. Invalid credentials are rejected with error messages.

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | No |
| POST | `/register` | User registration | No |
| POST | `/forgot-password` | Password reset request | No |
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |

### Assets (`/api/assets`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get assets (filtered by role) | Yes | All |
| GET | `/:id` | Get single asset | Yes | All |
| POST | `/` | Create new asset | Yes | Admin, Supervisor |
| PUT | `/:id` | Update asset | Yes | Admin, Supervisor |
| DELETE | `/:id` | Delete asset | Yes | Admin |

**Query Parameters for GET `/`:**
- `location_id` - Filter by location
- `room_id` - Filter by room
- `category_id` - Filter by category
- `asset_type` - Filter by type (Hardware/Software)
- `status` - Filter by status (Available/Assigned/Under Maintenance)

### Categories (`/api/categories`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all categories | Yes | All |
| POST | `/` | Create category | Yes | Admin |
| PUT | `/:id` | Update category | Yes | Admin |
| DELETE | `/:id` | Delete category | Yes | Admin |

### Locations & Rooms (`/api/locations`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all locations | Yes | All |
| GET | `/:id` | Get single location | Yes | All |
| GET | `/rooms` | Get all rooms | Yes | All |
| GET | `/rooms/:id` | Get single room | Yes | All |
| POST | `/` | Create location | Yes | Admin |
| POST | `/rooms` | Create room | Yes | Admin, Supervisor |
| PUT | `/:id` | Update location | Yes | Admin |
| PUT | `/rooms/:id` | Update room | Yes | Admin, Supervisor |
| DELETE | `/:id` | Delete location | Yes | Admin |
| DELETE | `/rooms/:id` | Delete room | Yes | Admin, Supervisor |

### Users (`/api/users`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get users (filtered by role) | Yes | Admin, Supervisor |
| GET | `/:id` | Get single user | Yes | All |
| POST | `/assign-asset` | Assign asset to user | Yes | Admin, Supervisor |
| POST | `/unassign-asset` | Unassign asset from user | Yes | Admin, Supervisor |
| GET | `/assigned-assets` | Get all assigned assets | Yes | Admin, Supervisor |
| GET | `/my-assets` | Get current user's assets | Yes | Employee |
| PUT | `/:id` | Update user | Yes | Admin, Supervisor |

**Query Parameters for GET `/`:**
- `location_id` or `locid` - Filter by location
- `room_id` or `roomid` - Filter by room
- `role` - Filter by user role

### Requests (`/api/requests`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get requests (filtered by role) | Yes | All |
| POST | `/` | Create new request | Yes | All |
| PUT | `/:id` | Update request | Yes | All |
| PUT | `/:id/status` | Update request status | Yes | Admin, Supervisor |
| DELETE | `/:id` | Delete request | Yes | Admin |

### Organizations (`/api/organizations`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all organizations | Yes | Software Developer |
| GET | `/:id` | Get single organization | Yes | Software Developer |
| POST | `/` | Create organization | Yes | Software Developer |
| PUT | `/:id` | Update organization | Yes | Software Developer |
| DELETE | `/:id` | Delete organization | Yes | Software Developer |

### Maintenance (`/api/maintenance`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all records | Yes | Admin, Supervisor |
| GET | `/dashboard` | Get metrics | Yes | All |
| GET | `/tasks` | Get pending tasks | Yes | Maintenance |
| POST | `/` | Create record | Yes | Admin, Supervisor |
| PUT | `/:id` | Update status | Yes | Maintenance, Admin |
| DELETE | `/:id` | Delete record | Yes | Admin |

### Purchase Orders (`/api/purchase-orders`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all orders | Yes | Admin, Supervisor |
| POST | `/` | Create order | Yes | Supervisor |
| PUT | `/:id/status`| Update status | Yes | Admin |

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Toggle between themes
- **Toast Notifications**: User-friendly feedback
- **Loading States**: Smooth loading indicators
- **Modal Dialogs**: Inline editing and forms
- **Dropdown Actions**: Context-specific actions
- **Breadcrumb Navigation**: Clear navigation paths
- **Sidebar Navigation**: Role-based menu items
- **Empty States**: Helpful messages when no data

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test-db    # Test database connection
npm run setup-db   # Initialize database schema
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Build output in frontend/build/
```

**Backend:**
```bash
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Authors

- **Parshva Shah** - [parshva213](https://github.com/parshva213)

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Express.js community
- MySQL team
- All contributors and testers

## 📞 Support

For support and questions:
- 📧 Email: [Create an issue](https://github.com/parshva213/Asset_Management_System/issues)
- 📖 Documentation: This README
- 🐛 Bug Reports: [GitHub Issues](https://github.com/parshva213/Asset_Management_System/issues)

## 🗺️ Roadmap

- [x] Hierarchical navigation (Locations -> Rooms -> Assets)
- [x] Multi-step registration for IT Supervisors
- [x] Stepped form for Category Management
- [x] Smart serial number generation
- [ ] Email notifications for requests
- [ ] Advanced reporting and analytics
- [ ] Barcode/QR code scanning
- [ ] Mobile application
- [ ] Export to PDF/Excel
- [ ] API documentation with Swagger

---

**Version:** 1.0.0  
**Last Updated:** February 2026
