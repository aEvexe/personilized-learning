import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  sendOTP,
  verifyOTP,
  checkUserExists,
  submitProfile,
  fetchCurrentUserId,
  trackFrontUser,
  loginWithGoogle,
} from '../../services/auth.service';

type Step = 'email' | 'otp' | 'profile';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, setAuthUserId, setIsNewUser } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUserLocal, setIsNewUserLocal] = useState(false);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    age: '',
  });

  const emailRef = useRef<HTMLInputElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleGoogleCallback = useCallback(async (response: any) => {
    setError('');
    setLoading(true);
    try {
      const { userId } = await loginWithGoogle(response.credential);
      if (userId) {
        setAuthUserId(userId);
        setSavedUserId(userId);
      }
      login();
      trackFrontUser({ action: 'google-login' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  }, [login, onClose, setAuthUserId]);

  useEffect(() => {
    emailRef.current?.focus();

    // Load Google Identity Services
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        // Render a hidden Google button for popup flow
        if (googleBtnRef.current) {
          (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'icon',
            size: 'large',
          });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [handleGoogleCallback]);

  const handleGoogleClick = () => {
    // Click the hidden rendered Google button to trigger popup
    const btn = googleBtnRef.current?.querySelector('[role="button"]') as HTMLElement;
    if (btn) {
      btn.click();
    } else {
      setError('Google Sign-In not loaded yet. Please try again.');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Email step: check if user exists FIRST, then send OTP
  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      // Step 1: Check if user exists in DB
      const exists = await checkUserExists(email.trim());
      setIsNewUserLocal(!exists);

      // Step 2: Send OTP
      await sendOTP(email.trim());
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // OTP submit
  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) return;
    setError('');
    setLoading(true);
    try {
      const { userId } = await verifyOTP(email.trim(), otpCode);
      let resolvedUserId = userId;

      if (!resolvedUserId) {
        const fetchedId = await fetchCurrentUserId();
        resolvedUserId = fetchedId;
      }

      if (resolvedUserId) {
        setAuthUserId(resolvedUserId);
        setSavedUserId(resolvedUserId);
      }

      if (isNewUserLocal) {
        // New user — show profile form
        setIsNewUser(true);
        setStep('profile');
        setLoading(false);
        return;
      }

      login();
      trackFrontUser({ email: email.trim(), action: 'login' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Profile submit
  const handleProfileSubmit = async () => {
    const { firstName, lastName, username, age } = profileData;
    if (!firstName || !lastName || !username || !age) {
      setError('All fields are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let userId = savedUserId;

      // Try fetching if we don't have it saved
      if (!userId) {
        userId = await fetchCurrentUserId();
        if (userId) {
          setAuthUserId(userId);
          setSavedUserId(userId);
        }
      }

      if (!userId) {
        setError('Session error. Please try again.');
        setLoading(false);
        return;
      }

      await submitProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        age: parseInt(age, 10),
      });

      login();
      setIsNewUser(true);
      trackFrontUser({ email: email.trim(), action: 'register', firstName, username });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay active" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>&times;</button>

        {error && (
          <div style={{ background: 'rgba(255,75,75,0.15)', color: '#ff6b6b', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: '0.9em', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <>
            <h2>Log in or Sign up</h2>
            <input
              ref={emailRef}
              type="email"
              className="auth-input"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
            />
            <button
              className="auth-submit-btn"
              onClick={handleSendOtp}
              disabled={loading || !email.trim()}
            >
              {loading ? 'Verifying...' : 'VERIFY'}
            </button>

            <div className="auth-divider"><span>OR</span></div>

            {/* Hidden Google button for popup flow */}
            <div ref={googleBtnRef} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, overflow: 'hidden' }} />

            <button className="auth-social-btn auth-google-btn" onClick={handleGoogleClick}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-footer">
              By signing in to Zehn AI, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </div>
          </>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <>
            <h2>Enter OTP</h2>
            <p className="auth-otp-hint">
              We sent a code to <strong>{email}</strong>
            </p>
            <input
              type="text"
              className="auth-input"
              placeholder="Enter OTP code"
              maxLength={6}
              value={otpCode}
              onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
              autoFocus
            />
            <button
              className="auth-submit-btn"
              onClick={handleVerifyOtp}
              disabled={loading || otpCode.length < 4}
            >
              {loading ? 'Verifying...' : 'LOG IN'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => { setStep('email'); setOtpCode(''); setError(''); }}
              style={{ width: '100%', marginTop: 8 }}
            >
              &larr; Back
            </button>
          </>
        )}

        {/* Step 3: Profile */}
        {step === 'profile' && (
          <>
            <h2>Complete Profile</h2>
            <p className="auth-otp-hint">Almost there! Tell us about yourself.</p>
            <input
              type="text"
              className="auth-input"
              placeholder="First name"
              value={profileData.firstName}
              onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))}
              style={{ marginBottom: 10 }}
            />
            <input
              type="text"
              className="auth-input"
              placeholder="Last name"
              value={profileData.lastName}
              onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))}
              style={{ marginBottom: 10 }}
            />
            <input
              type="text"
              className="auth-input"
              placeholder="Username"
              value={profileData.username}
              onChange={e => setProfileData(p => ({ ...p, username: e.target.value }))}
              style={{ marginBottom: 10 }}
            />
            <input
              type="number"
              className="auth-input"
              placeholder="Age"
              min={5}
              max={120}
              value={profileData.age}
              onChange={e => setProfileData(p => ({ ...p, age: e.target.value }))}
              style={{ marginBottom: 10 }}
            />
            <button
              className="auth-submit-btn"
              onClick={handleProfileSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Get Started'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
