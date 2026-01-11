import { useState } from 'react';
import { LoginPage } from './components/login-page';
import { SignupPage } from './components/signup-page';
import { Dashboard } from './components/dashboard';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

type View = 'login' | 'signup' | 'dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (email: string, password: string) => {
    // Simulate ML risk assessment
    const riskScore = Math.floor(Math.random() * 30) + 5; // Low risk score
    
    // Simulate login delay for "ML processing"
    setTimeout(() => {
      setUserEmail(email);
      setCurrentView('dashboard');
      toast.success('Login Successful', {
        description: `ML Risk Score: ${riskScore}% (Low Risk) - Authentication approved`,
      });
    }, 800);
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // Simulate signup process
    setTimeout(() => {
      setUserEmail(email);
      setCurrentView('dashboard');
      toast.success('Account Created Successfully', {
        description: 'Welcome to our ML-powered security platform!',
      });
    }, 800);
  };

  const handleLogout = () => {
    setUserEmail('');
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
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      )}
      
      <Toaster />
    </>
  );
}
