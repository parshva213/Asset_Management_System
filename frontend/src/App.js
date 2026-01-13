import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ToastProvider } from "./contexts/ToastContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import ToastContainer from "./components/ToastContainer"

import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"

// ---------- COMMON PAGES ----------
import Login from "./pages/Login"
import Register from "./pages/Register"
import RoleSelection from "./pages/RoleSelection"
import Profile from "./pages/Profile"
import Dashboard from "./pages/Dashboard"
import ResetPassword from "./pages/ResetPassword"

// ---------- SUPER ADMIN PAGES ----------
import Categories from "./pages/Categories"
import Locations from "./pages/Locations"
import LocationRooms from "./pages/LocationRooms"
import Assets from "./pages/Assets"
import Employees from "./pages/Employees"
import AdminDashboard from "./pages/AdminDashboard"

// ---------- SUPERVISOR PAGES ----------
import PurchaseOrders from "./pages/purchase-orders"
import Requests from "./pages/Requests"
import SupervisorDashboard from "./pages/SupervisorDashboard"

// ---------- EMPLOYEE PAGES ----------
import EmployeeDashboard from "./pages/EmployeeDashboard"

// ---------- VENDOR PAGES ----------
import SupplyAssets from "./pages/SupplyAssets"
import WarrantyDocs from "./pages/WarrantyDocs"
import VendorDashboard from "./pages/VendorDashboard"
import VendorAssets from "./pages/VendorAssets"
import VendorRequests from "./pages/VendorRequests"

// ---------- MAINTENANCE STAFF PAGES ----------
import NewConfiguration from "./pages/NewConfiguration"
import UpdateMaintenance from "./pages/UpdateMaintenance"
import MaintenanceDashboard from "./pages/MaintenanceDashboard"
import MaintenanceTasks from "./pages/MaintenanceTasks"
import SDDashboard from "./pages/SDDashboard"
import Organizations from "./pages/Organizations"

import "./App.css"

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/reset-password" element={<ResetPassword />} />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Common */}
              <Route path="dashboard" element={<ProtectedRoute roles={['Super Admin', 'Supervisor', 'Employee', 'Vendor', 'Maintenance', 'Software Developer']}><Dashboard /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute roles={['Super Admin', 'Supervisor', 'Employee', 'Vendor', 'Maintenance', 'Software Developer']}><Profile /></ProtectedRoute>} />
              <Route path="assets" element={<ProtectedRoute roles={['Super Admin', 'Supervisor', 'Employee', 'Maintenance', 'Software Developer']}><Assets /></ProtectedRoute>} />

              {/* Super Admin */}
              <Route path="admin-dashboard" element={<ProtectedRoute roles={['Super Admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="employees" element={<ProtectedRoute roles={['Super Admin']}><Employees /></ProtectedRoute>} />
              <Route path="categories" element={<ProtectedRoute roles={['Super Admin']}><Categories /></ProtectedRoute>} />
              <Route path="locations" element={<ProtectedRoute roles={['Super Admin', 'Supervisor']}><Locations /></ProtectedRoute>} />
              <Route path="rooms" element={<ProtectedRoute roles={['Super Admin', 'Supervisor']}><LocationRooms /></ProtectedRoute>} />

              {/* Supervisor */}
              <Route path="supervisor-dashboard" element={<ProtectedRoute roles={['Supervisor']}><SupervisorDashboard /></ProtectedRoute>} />

              {/* Employee */}
              <Route path="employee-dashboard" element={<ProtectedRoute roles={['Employee']}><EmployeeDashboard /></ProtectedRoute>} />

              {/* Software Developer */}
              <Route path="sd-dashboard" element={<ProtectedRoute roles={['Software Developer']}><SDDashboard /></ProtectedRoute>} />
              <Route path="organizations" element={<ProtectedRoute roles={['Software Developer']}><Organizations /></ProtectedRoute>} />

              {/* Supervisor */}
              <Route path="purchase-orders" element={<ProtectedRoute roles={['Super Admin', 'Supervisor']}><PurchaseOrders /></ProtectedRoute>} />
              <Route path="requests" element={<ProtectedRoute roles={['Super Admin', 'Supervisor', 'Employee', 'Software Developer']}><Requests /></ProtectedRoute>} />

              {/* Vendor */}
              <Route path="vendor-dashboard" element={<ProtectedRoute roles={['Vendor']}><VendorDashboard /></ProtectedRoute>} />
              <Route path="supply-assets" element={<ProtectedRoute roles={['Vendor']}><SupplyAssets /></ProtectedRoute>} />
              <Route path="warranty-docs" element={<ProtectedRoute roles={['Vendor']}><WarrantyDocs /></ProtectedRoute>} />
              <Route path="vendor-assets" element={<ProtectedRoute roles={['Vendor']}><VendorAssets /></ProtectedRoute>} />
              <Route path="vendor-requests" element={<ProtectedRoute roles={['Vendor']}><VendorRequests /></ProtectedRoute>} />

              {/* Maintenance Staff */}
              <Route path="maintenance-dashboard" element={<ProtectedRoute roles={['Super Admin', 'Maintenance']}><MaintenanceDashboard /></ProtectedRoute>} />
              <Route path="new-configuration" element={<ProtectedRoute roles={['Maintenance']}><NewConfiguration /></ProtectedRoute>} />
              <Route path="update-maintenance" element={<ProtectedRoute roles={['Maintenance']}><UpdateMaintenance /></ProtectedRoute>} />
              <Route path="maintenance-tasks" element={<ProtectedRoute roles={['Maintenance']}><MaintenanceTasks /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
  )
}

export default App
