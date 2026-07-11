import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotFound from '../pages/NotFound';

export const AdminProtectedRoute = ({ children }) => {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <NotFound />;
  }

  return children;
};

export const EmailVerificationRoute = ({ children }) => {
  const { user, isLoading, isAuthenticated, isVerified } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isVerified) {
    return <VerifyEmailScreen />;
  }

  return children;
};

export const VerifyEmailScreen = () => {
  const { user, refreshUser } = useAuth();
  const [isResending, setIsResending] = React.useState(false);
  const [message, setMessage] = React.useState('Please verify your email to continue.');

  const resendVerification = async () => {
    setIsResending(true);
    setMessage('Sending a new verification email...');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.devstorm.dev'}/api/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)auth_token=([^;]*).*$)|^.*$/, '$1')}`,
        },
        body: JSON.stringify({ email: user?.email, type: 'signup_verification' }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Unable to resend verification email');
      }

      setMessage(payload.message || 'Verification email sent.');
      await refreshUser();
    } catch (error) {
      setMessage(error.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold">Verify your email</h1>
        <p className="mt-3 text-sm text-slate-300">{message}</p>
        <p className="mt-4 text-sm text-slate-400">You can’t access the main app until your email is verified.</p>
        <button
          type="button"
          onClick={resendVerification}
          disabled={isResending}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {isResending ? 'Sending…' : 'Resend verification email'}
        </button>
      </div>
    </div>
  );
};
