// import { createContext, useContext, useState, useEffect } from "react"
// import axios from "axios"

// const AuthContext = createContext()

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

// // ✅ Base URL for backend
// const API_BASE = "http://localhost:5000/api/auth"

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const token = localStorage.getItem("token")
//     if (token) {
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
//       fetchProfile()
//     } else {
//       setLoading(false)
//     }
//   }, [])

//   const fetchProfile = async () => {
//     try {
//       const response = await axios.get(`${API_BASE}/profile`)
//       setUser(response.data.user)
//     } catch (error) {
//       console.error("Profile fetch error:", error)
//       logout()
//     } finally {
//       setLoading(false)
//     }
//   }

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post(`${API_BASE}/login`, { email, password })
//       const { token, user } = response.data

//       localStorage.setItem("token", token)
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
//       setUser(user)

//       return { success: true }
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || "Login failed",
//       }
//     }
//   }

//   const register = async (userData) => {
//     try {
//       const response = await axios.post(`${API_BASE}/register`, userData)
//       const { token, user } = response.data

//       localStorage.setItem("token", token)
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
//       setUser(user)

//       return { success: true, message: response.data.message }
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || "Registration failed",
//       }
//     }
//   }

//   const forgotPassword = async (email) => {
//     try {
//       const response = await axios.post(`${API_BASE}/forgot-password`, { email })
//       return { success: true, message: response.data.message }
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || "Password reset failed",
//       }
//     }
//   }

//   const updateProfile = async (profileData) => {
//     try {
//       await axios.put(`${API_BASE}/profile`, profileData)
//       await fetchProfile()
//       return { success: true, message: "Profile updated successfully" }
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || "Profile update failed",
//       }
//     }
//   }

//   const changePassword = async (currentPassword, newPassword) => {
//     try {
//       await axios.put(`${API_BASE}/change-password`, {
//         currentPassword,
//         newPassword,
//       })
//       return { success: true, message: "Password changed successfully" }
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || "Password change failed",
//       }
//     }
//   }

//   const logout = () => {
//     localStorage.removeItem("token")
//     delete axios.defaults.headers.common["Authorization"]
//     setUser(null)
//   }

//   const value = {
//     user,
//     loading,
//     login,
//     register,
//     forgotPassword,
//     updateProfile,
//     changePassword,
//     logout,
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }





import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// ✅ Base URL for backend
const API_BASE = "http://localhost:5000/api/auth"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/profile`)
      setUser(response.data.user)
    } catch (error) {
      console.error("Profile fetch error:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  // ✅ Login
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, { email, password })
      const { token, user } = response.data

      console.log("Login successful! User data:", user);

      if (rememberMe) {
          localStorage.setItem("token", token)
      } else {
          sessionStorage.setItem("token", token)
      }
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      // Determine redirect path based on user role (case-insensitive)
      let redirectPath = "/login"
      const role = user.role ? user.role.toLowerCase() : ""
      console.log("Normalized role for redirect:", role);

      switch (role) {
        case "super admin":
          redirectPath = "/admin-dashboard"
          break
        case "supervisor":
          redirectPath = "/supervisor-dashboard"
          break
        case "employee":
          redirectPath = "/employee-dashboard"
          break
        case "vendor":
          redirectPath = "/vendor-dashboard"
          break
        case "maintenance":
          redirectPath = "/maintenance-dashboard"
          break
        case "software developer":
          redirectPath = "/sd-dashboard"
          break
        default:
          redirectPath = "/login"
          console.warn("Unknown role, defaulting to login:", role);
      }

      console.log("Redirecting to:", redirectPath);

      return { success: true, user, redirectPath }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  // ✅ Register (role comes automatically from frontend)
  const register = async (userData) => {
    try {
      // remove department if empty (e.g. vendor / maintenance staff)
      if (!userData.department) {
        delete userData.department
      }

      const response = await axios.post(`${API_BASE}/register`, userData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true, message: response.data.message || "Registration successful" }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  // ✅ Forgot Password
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_BASE}/forgot-password`, { email })
      return { success: true, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password reset failed",
      }
    }
  }

  // ✅ Update Profile
  const updateProfile = async (profileData) => {
    try {
      await axios.put(`${API_BASE}/profile`, profileData)
      await fetchProfile()
      return { success: true, message: "Profile updated successfully" }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed",
      }
    }
  }

  // ✅ Change Password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(`${API_BASE}/change-password`, {
        currentPassword,
        newPassword,
      })
      return { success: true, message: "Password changed successfully" }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password change failed",
      }
    }
  }

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    forgotPassword,
    updateProfile,
    changePassword,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
