import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the DirectusAuth service
jest.mock('../services/DirectusAuth', () => ({
  DirectusAuth: jest.fn().mockImplementation(() => ({
    getGoogleAuthUrl: jest.fn().mockResolvedValue('https://accounts.google.com/oauth/authorize'),
    handleAuthCallback: jest.fn().mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      provider: 'google',
    }),
    getCurrentUser: jest.fn().mockResolvedValue(null),
    checkUserExists: jest.fn().mockResolvedValue(false),
    logout: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock the SessionManager
jest.mock('../services/AuthService', () => ({
  SessionManager: jest.fn().mockImplementation(() => ({
    getToken: jest.fn().mockReturnValue(null),
    isTokenExpired: jest.fn().mockReturnValue(true),
    setToken: jest.fn(),
    clearToken: jest.fn(),
  })),
}));

// Test component to access the auth context
const TestComponent: React.FC = () => {
  const { user, loading, login, logout, handleAuthCallback, checkUserExists } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? `User: ${user.email}` : 'No User'}</div>
      <button onClick={login} data-testid="login-button">Login</button>
      <button onClick={logout} data-testid="logout-button">Logout</button>
      <button 
        onClick={() => handleAuthCallback('test-code')} 
        data-testid="callback-button"
      >
        Handle Callback
      </button>
      <button 
        onClick={() => checkUserExists('test@example.com')} 
        data-testid="check-user-button"
      >
        Check User
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  it('provides authentication context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(screen.getByTestId('callback-button')).toBeInTheDocument();
    expect(screen.getByTestId('check-user-button')).toBeInTheDocument();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('handles authentication callback correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const callbackButton = screen.getByTestId('callback-button');
    callbackButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('User: test@example.com');
    });
  });
});