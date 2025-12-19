# Asset Management System (AMS)

A comprehensive web-based Asset Management System built with React.js, Node.js, Express.js, and MySQL. The system provides role-based access control for managing organizational assets, tracking requests, and maintaining inventory.

## Features

### Role-Based Access Control
- **Super Admin**: Full system access and management capabilities
- **IT Supervisor**: Asset assignment, room management, and employee supervision
- **Employee**: View assigned assets and submit requests

### Core Functionality
- **Asset Management**: Complete CRUD operations for hardware and software assets
- **Category Management**: Organize assets by categories
- **Location & Room Management**: Hierarchical location and room structure
- **Request System**: Submit, track, and manage asset requests with workflow
- **User Management**: Employee management with asset assignment capabilities
- **Activity Logging**: Comprehensive audit trail for all system activities

### Authentication Features
- Role-based registration with auto-approval for valid credentials
- JWT-based authentication
- Password management (plain text storage as configured)
- Forgot password functionality with email simulation
- Profile management for all users

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication tokens
- **Axios** - HTTP client

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Axios** - API communication
- **CSS3** - Styling and responsive design

## Project Structure

\`\`\`
AMS/
├── backend/                    # Node.js + Express.js API
│   ├── config/
│   │   └── database.js        # MySQL connection configuration
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── assets.js         # Asset management endpoints
│   │   ├── categories.js     # Category management endpoints
│   │   ├── locations.js      # Location and room endpoints
│   │   ├── users.js          # User management endpoints
│   │   └── requests.js       # Request management endpoints
│   ├── package.json          # Backend dependencies
│   ├── server.js            # Express server configuration
│   └── .env                 # Environment variables
├── frontend/                  # React.js Application
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main application component
│   │   ├── App.css         # Application styles
│   │   └── index.js        # Application entry point
│   └── package.json        # Frontend dependencies
├── database/                 # MySQL Database
│   ├── schema.sql          # Database structure
│   └── seed.sql           # Initial data (empty)
└── README.md              # Project documentation
\`\`\`

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Database Setup
1. Create a MySQL database:
   \`\`\`sql
   CREATE DATABASE asset_management;
   \`\`\`

2. Import the database schema:
   \`\`\`bash
   mysql -u root -p asset_management < database/schema.sql
   \`\`\`

3. (Optional) Import seed data:
   \`\`\`bash
   mysql -u root -p asset_management < database/seed.sql
   \`\`\`

### Backend Setup
1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure environment variables in `.env`:
   \`\`\`env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=asset_management
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   \`\`\`

4. Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup
1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## User Registration

### Registration Process
1. Visit the application and click "Register here"
2. Select your role (Super Admin, IT Supervisor, or Employee)
3. Fill out the registration form with role-specific requirements:

### Role-Specific Requirements
- **Super Admin**: No special requirements - immediate access
- **IT Supervisor**: Requires valid authorization key
  - Valid keys: `SUP2024`, `ADMIN123`, `SUPERVISOR001`
- **Employee**: Requires valid employee ID format
  - Format: `EMP` followed by 4 digits (e.g., `EMP1234`)

### Auto-Approval System
Users with valid credentials are automatically approved and logged in. Invalid credentials are rejected with appropriate error messages.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Assets
- `GET /api/assets` - Get assets (filtered by role)
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Super Admin only)
- `PUT /api/categories/:id` - Update category (Super Admin only)
- `DELETE /api/categories/:id` - Delete category (Super Admin only)

### Locations & Rooms
- `GET /api/locations` - Get all locations
- `GET /api/locations/rooms` - Get all rooms
- `POST /api/locations` - Create location (Super Admin only)
- `POST /api/locations/rooms` - Create room
- `PUT /api/locations/:id` - Update location (Super Admin only)
- `PUT /api/locations/rooms/:id` - Update room
- `DELETE /api/locations/:id` - Delete location (Super Admin only)
- `DELETE /api/locations/rooms/:id` - Delete room

### Users
- `GET /api/users` - Get users (role-based access)
- `POST /api/users/assign-asset` - Assign asset to user
- `POST /api/users/unassign-asset` - Unassign asset from user

### Requests
- `GET /api/requests` - Get requests (filtered by role)
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id` - Update request
- `PUT /api/requests/:id/status` - Update request status
- `DELETE /api/requests/:id` - Delete request

## Database Schema

### Tables Overview
- **users**: User accounts with role-based access
- **categories**: Asset categories for organization
- **locations**: Physical locations
- **rooms**: Rooms within locations
- **assets**: Hardware and software assets
- **asset_requests**: Request workflow system
- **activity_logs**: Audit trail for all activities
- **registration_requests**: Pending user registrations (unused with auto-approval)

### Key Relationships
- Assets belong to categories and locations
- Assets can be assigned to users
- Requests are linked to assets and users
- Rooms belong to locations
- Activity logs track all user actions

## Security Features

- JWT-based authentication with configurable expiration
- Role-based access control throughout the application
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- CORS configuration for cross-origin requests
- Password storage without encryption (as configured)

## Deployment

### Production Deployment
1. **Database**: Set up MySQL database on your hosting provider
2. **Backend**: Deploy to platforms like Railway, Render, or Heroku
3. **Frontend**: Deploy to Vercel, Netlify, or similar static hosting
4. **Environment**: Configure production environment variables

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=asset_management
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=24h
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
1. Check the documentation
2. Review the API endpoints
3. Examine the database schema
4. Test with the provided demo credentials

## Version History

- **v1.0.0**: Initial release with complete asset management functionality
  - Role-based authentication system
  - Asset CRUD operations
  - Request workflow management
  - User and location management
  - Activity logging and audit trail
