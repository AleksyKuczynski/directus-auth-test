import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginPage.module.scss';

export const LoginPage: React.FC = () => {
  const { user, loading, login, checkUserExists } = useAuth();
  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const handleEmailCheck = async () => {
    if (!email.trim()) return;
    
    setIsCheckingUser(true);
    try {
      const exists = await checkUserExists(email);
      setUserExists(exists);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleAuth = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  if (loading) {
    return (
      <div className={styles.container} data-testid="login-page">
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // User is logged in
  if (user) {
    return (
      <div className={styles.container} data-testid="login-page">
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Welcome Back!</h1>
            <div className={styles.userInfo}>
              {user.avatar && (
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  width={64}
                  height={64}
                  className={styles.avatar}
                />
              )}
              <div className={styles.userDetails}>
                <h2>{user.first_name} {user.last_name}</h2>
                <p className={styles.email}>{user.email}</p>
              </div>
            </div>
          </div>
          
          <div className={styles.actions}>
            <button 
              onClick={handleGoToProfile}
              className={styles.primaryButton}
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is not logged in
  return (
    <div className={styles.container} data-testid="login-page">
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Image
              src="/logo.svg"
              alt="Logo"
              width={64}
              height={64}
              className={styles.logo}
            />
          </div>
          <h1>Welcome</h1>
          <p className={styles.subtitle}>Sign in to access your account</p>
        </div>

        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailCheck}
              placeholder="Enter your email"
              className={styles.input}
            />
          </div>

          {isCheckingUser && (
            <div className={styles.checking}>
              <p>Checking user...</p>
            </div>
          )}

          {userExists !== null && !isCheckingUser && (
            <div className={styles.userStatus}>
              {userExists ? (
                <div className={styles.existingUser}>
                  <p>Welcome back! We found your account.</p>
                  <button 
                    onClick={handleAuth}
                    className={styles.primaryButton}
                    disabled={loading}
                  >
                    <Image
                      src="/google-icon.svg"
                      alt="Google"
                      width={20}
                      height={20}
                      className={styles.googleIcon}
                    />
                    Sign in with Google
                  </button>
                </div>
              ) : (
                <div className={styles.newUser}>
                  <p>We&apos;ll create a new account for you.</p>
                  <button 
                    onClick={handleAuth}
                    className={styles.primaryButton}
                    disabled={loading}
                  >
                    <Image
                      src="/google-icon.svg"
                      alt="Google"
                      width={20}
                      height={20}
                      className={styles.googleIcon}
                    />
                    Register with Google
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};