import { useState, useEffect } from 'react';
import { LoginPage } from './components/login-page';
import { SignupPage } from './components/signup-page';
import { Dashboard } from './components/dashboard';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './context/AuthContext';
import { toast } from 'sonner';

type View = 'login' | 'signup' | 'dashboard';

export default function App() {
  const { user, login, signup, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('login');

  useEffect(() => {
    if (user) {
      setCurrentView('dashboard');
    }
  }, [user]);

  const handleLogin = async (email: string, password: string) => {
    // ML risk assessment is now handled in AuthContext
    const result = await login(email, password);

    if (result.success) {
      const riskScore = result.riskScore || 0;
      toast.success('Login Successful', {
        description: `ML Risk Score: ${riskScore}% - Authentication approved`,
      });
      setCurrentView('dashboard');
    } else {
      // If blocked, result.success is false, but we might have a risk score
      if (result.message?.includes('blocked')) {
        toast.error('Login Blocked', {
          description: `${result.message} (Risk Score: ${result.riskScore}%)`,
        });
      } else {
        toast.error('Login Failed', {
          description: result.message,
        });
      }
    }
    return result;
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    const success = await signup(name, email, password);

    if (success) {
      toast.success('Account Created Successfully', {
        description: 'Welcome to our ML-powered security platform!',
      });
      setCurrentView('dashboard');
    } else {
      toast.error('Signup Failed', {
        description: 'Email already exists',
      });
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentView('login');
    toast.info('Logged Out', {
      description: 'You have been securely logged out',
    });
  };

  return (
    <>
      {currentView === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToSignup={() => setCurrentView('signup')}
        />
      )}

      {currentView === 'signup' && (
        <SignupPage
          onSignup={handleSignup}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          userEmail={user?.email || ''}
          onLogout={handleLogout}
        />
      )}

      <Toaster />
    </>
  );
}
