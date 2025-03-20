/**
 * Authentication utility functions for Zirak HR
 */

// Login function that calls the API and handles the response
export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Logout function that calls the API and handles the response
export async function logoutUser() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Logout failed');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Function to check if user is authenticated
export async function checkAuth() {
  try {
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        authenticated: false,
        user: null,
      };
    }

    return {
      authenticated: true,
      user: data.user,
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      authenticated: false,
      user: null,
    };
  }
}

// Redirect based on authentication status
export function redirectToLogin() {
  window.location.href = '/login';
}

export function redirectToDashboard(role: string) {
  if (role === 'candidate') {
    window.location.href = '/dashboard/talent';
  } else {
    window.location.href = '/dashboard/hiring-manager';
  }
}
