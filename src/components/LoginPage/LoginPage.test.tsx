import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginPage } from './LoginPage';

// Mock the AuthContext
const mockUseAuth = {
  user: null as any,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  checkUserExists: jest.fn(),
  handleAuthCallback: jest.fn(),
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login page correctly', () => {
    render(<LoginPage />);
    
    // Check if the main container is rendered
    const loginContainer = screen.getByTestId('login-page');
    expect(loginContainer).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    mockUseAuth.loading = true;
    
    render(<LoginPage />);
    
    const loadingElement = screen.getByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });

  it('shows user info when user is logged in', () => {
    mockUseAuth.user = {
      id: '1',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      provider: 'google',
    };
    mockUseAuth.loading = false;
    
    render(<LoginPage />);
    
    const userInfo = screen.getByText(/john doe/i);
    expect(userInfo).toBeInTheDocument();
  });
});