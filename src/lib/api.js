const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to handle API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async getProfile(token) {
    return this.request('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Product methods
  async getProducts() {
    return this.request('/products');
  }

  async createSampleProducts() {
    return this.request('/create-sample-products', {
      method: 'POST',
    });
  }

  // Cart methods
  async getCart(token) {
    return this.request('/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async addToCart(productId, quantity, shade, token) {
    return this.request('/cart/add', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        productId,
        quantity,
        shade,
      },
    });
  }

  async clearCart(token) {
    return this.request('/cart/clear', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Payment methods
  async initializePayment(returnUrl, token) {
    return this.request('/payments/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { return_url: returnUrl },
    });
  }
}

export const apiService = new ApiService();