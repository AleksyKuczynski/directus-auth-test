import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfilePage } from './ProfilePage';

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

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.user = null;
    mockUseAuth.loading = false;
  });

  it('renders loading state when loading is true', () => {
    mockUseAuth.loading = true;
    
    render(<ProfilePage />);
    
    const loadingElement = screen.getByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });

  it('shows access denied when user is not logged in', () => {
    mockUseAuth.user = null;
    mockUseAuth.loading = false;
    
    render(<ProfilePage />);
    
    const accessDenied = screen.getByText(/access denied/i);
    expect(accessDenied).toBeInTheDocument();
    
    const loginButton = screen.getByText(/go to login/i);
    expect(loginButton).toBeInTheDocument();
  });

  it('renders user profile when user is logged in', () => {
    mockUseAuth.user = {
      id: '1',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      provider: 'google',
    };
    mockUseAuth.loading = false;
    
    render(<ProfilePage />);
    
    const userName = screen.getByText(/john doe/i);
    expect(userName).toBeInTheDocument();
    
    const userEmail = screen.getByText(/test@example.com/i);
    expect(userEmail).toBeInTheDocument();
    
    const logoutButton = screen.getByText(/logout/i);
    expect(logoutButton).toBeInTheDocument();
  });

  it('shows user information correctly', () => {
    mockUseAuth.user = {
      id: '123',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      provider: 'google',
    };
    
    render(<ProfilePage />);
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('ID: 123')).toBeInTheDocument();
    expect(screen.getByText('google')).toBeInTheDocument();
  });
});