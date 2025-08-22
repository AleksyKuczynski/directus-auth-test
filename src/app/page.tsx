// src/app/page.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserState } from '@/types/auth';
import { useRouter } from 'next/navigation';

/**
 * Home page with context-dependent authentication button
 */
export default function HomePage() {
  const { 
    combinedAuthState, 
    userState, 
    triggerLogin, 
    registerUserInDirectus, 
    loginToDirectus 
  } = useAuth();
  
  const router = useRouter();

  // Handle button click based on current user state
  const handleButtonClick = async () => {
    try {
      switch (userState) {
        case UserState.BROWSER_NOT_LOGGED_IN:
          // Case 1: Login with Google
          await triggerLogin();
          break;

        case UserState.BROWSER_LOGGED_IN_DIRECTUS_LOGGED_IN:
          // Case 2: Navigate to profile
          router.push('/profile');
          break;

        case UserState.BROWSER_LOGGED_IN_DIRECTUS_EXISTS_NOT_LOGGED:
          // Case 3: Sign in to Directus and navigate to profile
          await loginToDirectus();
          router.push('/profile');
          break;

        case UserState.BROWSER_LOGGED_IN_DIRECTUS_NOT_EXISTS:
          // Case 4: Sign up to Directus and navigate to profile
          await registerUserInDirectus();
          router.push('/profile');
          break;

        default:
          console.log('Unknown user state:', userState);
          break;
      }
    } catch (error) {
      console.error('Button action failed:', error);
    }
  };

  // Determine button text and state based on user state
  const getButtonConfig = () => {
    switch (userState) {
      case UserState.LOADING:
        return {
          text: 'Loading...',
          disabled: true,
          variant: 'loading'
        };

      case UserState.ERROR:
        return {
          text: 'Error - Try Again',
          disabled: false,
          variant: 'error'
        };

      case UserState.BROWSER_NOT_LOGGED_IN:
        return {
          text: 'Login',
          disabled: false,
          variant: 'login'
        };

      case UserState.BROWSER_LOGGED_IN_DIRECTUS_LOGGED_IN:
        return {
          text: 'Profile',
          disabled: false,
          variant: 'profile'
        };

      case UserState.BROWSER_LOGGED_IN_DIRECTUS_EXISTS_NOT_LOGGED:
        return {
          text: 'Sign In',
          disabled: false,
          variant: 'signin'
        };

      case UserState.BROWSER_LOGGED_IN_DIRECTUS_NOT_EXISTS:
        return {
          text: 'Sign Up',
          disabled: false,
          variant: 'signup'
        };

      default:
        return {
          text: 'Loading...',
          disabled: true,
          variant: 'loading'
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome</h1>
        <p>Your authentication-enabled application</p>
        
        <button 
          onClick={handleButtonClick}
          disabled={buttonConfig.disabled}
          className={`auth-button auth-button--${buttonConfig.variant}`}
        >
          {buttonConfig.text}
        </button>

        {/* Show user info when logged in */}
        {combinedAuthState.browser?.userInfo && (
          <div className="user-preview">
            <img 
              src={combinedAuthState.browser.userInfo.imageUrl} 
              alt="User avatar"
              className="user-avatar-small"
            />
            <span>Welcome, {combinedAuthState.browser.userInfo.name}</span>
          </div>
        )}

        {/* Show error if any */}
        {(combinedAuthState.error || combinedAuthState.browser?.error || combinedAuthState.directus?.error) && (
          <div className="error-message">
            {combinedAuthState.error || combinedAuthState.browser?.error || combinedAuthState.directus?.error}
          </div>
        )}
      </div>
    </div>
  );
}