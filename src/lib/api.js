// Use your existing API_URL from env or hardcode fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Log for debugging
console.log('📡 API Client initialized with URL:', API_URL)

export const api = {
  async get(url, options = {}) {
    const fullUrl = `${API_URL}${url}`
    console.log(`🌐 GET: ${fullUrl}`)
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ GET Error (${response.status}) for ${fullUrl}:`, errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` }
      }
      
      throw new Error(errorData.error || errorData.message || `API GET failed: ${response.status}`)
    }

    return response.json()
  },
  
  async post(url, data, options = {}) {
    const fullUrl = `${API_URL}${url}`
    console.log(`🌐 POST: ${fullUrl}`, data)
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ POST Error (${response.status}) for ${fullUrl}:`, errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` }
      }
      
      throw new Error(errorData.error || errorData.message || `API POST failed: ${response.status}`)
    }

    return response.json()
  }
}

// Export the API_URL as well
export { API_URL }