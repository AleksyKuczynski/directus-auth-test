import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import LoginPage from './LoginPage'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Mock next/navigation
jest.mock('next/navigation')

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: jest.fn(),
}))

describe('LoginPage', () => {
  const mockPush = jest.fn()
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })
  
  describe('when user is not logged in', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      })
    })
    
    it('should render new user state by default', () => {
      render(<LoginPage />)
      
      expect(screen.getByTestId('new-user-state')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('register-button')).toBeInTheDocument()
    })
    
    it('should disable register button when email is empty', () => {
      render(<LoginPage />)
      
      const registerButton = screen.getByTestId('register-button')
      expect(registerButton).toBeDisabled()
    })
    
    it('should enable register button when email is entered', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      const emailInput = screen.getByTestId('email-input')
      const registerButton = screen.getByTestId('register-button')
      
      await user.type(emailInput, 'test@example.com')
      
      await waitFor(() => {
        expect(registerButton).not.toBeDisabled()
      })
    })
  })
  
  describe('when user is logged in', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { email: 'user@example.com', id: '123' },
        loading: false,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
      })
    })
    
    it('should render logged in state', () => {
      render(<LoginPage />)
      
      expect(screen.getByTestId('logged-in-state')).toBeInTheDocument()
      expect(screen.getByText(/Hello, user@example.com!/)).toBeInTheDocument()
      expect(screen.getByTestId('profile-button')).toBeInTheDocument()
    })
    
    it('should navigate to profile page when profile button is clicked', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      const profileButton = screen.getByTestId('profile-button')
      await user.click(profileButton)
      
      expect(mockPush).toHaveBeenCalledWith('/profile')
    })
  })
  
  describe('when existing user is detected', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      })
      
      // Mock fetch for user check
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          data: [{ email: 'existing@example.com' }],
        }),
      })
    })
    
    it('should show login button for existing users', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      const emailInput = screen.getByTestId('email-input')
      await user.type(emailInput, 'existing@example.com')
      
      await waitFor(() => {
        expect(screen.getByTestId('existing-user-state')).toBeInTheDocument()
        expect(screen.getByTestId('login-button')).toBeInTheDocument()
      })
    })
  })
})