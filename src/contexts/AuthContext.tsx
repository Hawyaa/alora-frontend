'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  _id: string
  name: string
  email: string
  phone: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>
  register: (userData: any) => Promise<{ success: boolean; data?: any; error?: string }>
  logout: () => void
  requireAuth: (callback: () => void) => void
  isAuthenticated: boolean
  checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing auth on component mount
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('user')
        
        console.log('AuthProvider - Initializing auth:', {
          storedToken: storedToken ? `Present (${storedToken.substring(0, 20)}...)` : 'Missing',
          storedUser: storedUser ? 'Present' : 'Missing'
        })
        
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear corrupted storage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const checkAuth = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    return !!(storedToken && storedUser)
  }

  const login = async (email: string, password: string) => {
    try {
      // Ensure API URL is available
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      console.log('Logging in to:', `${apiUrl}/auth/login`)

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed')
      }

      // Verify we have the token
      if (!data.token) {
        throw new Error('No token received from server')
      }

      // Store auth data
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify({
        _id: data.user?._id || data._id,
        name: data.user?.name || data.name,
        email: data.user?.email || data.email,
        phone: data.user?.phone || data.phone,
      }))

      setToken(data.token)
      setUser({
        _id: data.user?._id || data._id,
        name: data.user?.name || data.name,
        email: data.user?.email || data.email,
        phone: data.user?.phone || data.phone,
      })

      console.log('Login successful, token stored:', data.token.substring(0, 20) + '...')

      return { success: true, data }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      console.log('Registering to:', `${apiUrl}/auth/register`)

      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      console.log('Register response:', data)

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed')
      }

      if (!data.token) {
        throw new Error('No token received from server')
      }

      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify({
        _id: data.user?._id || data._id,
        name: data.user?.name || data.name,
        email: data.user?.email || data.email,
        phone: data.user?.phone || data.phone,
      }))

      setToken(data.token)
      setUser({
        _id: data.user?._id || data._id,
        name: data.user?.name || data.name,
        email: data.user?.email || data.email,
        phone: data.user?.phone || data.phone,
      })

      console.log('Registration successful, token stored:', data.token.substring(0, 20) + '...')

      return { success: true, data }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    console.log('Logging out...')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  const requireAuth = (callback: () => void) => {
    if (!token) {
      router.push('/login')
      return
    }
    callback()
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    requireAuth,
    isAuthenticated: !!token,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}