import { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { sendOTP } from '../utils/email-service';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToSignup: () => void;
}

export function LoginPage({ onLogin, onSwitchToSignup }: LoginPageProps) {
  const { checkUserExists, forceLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // OTP State
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendOTP = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (!checkUserExists(resetEmail)) {
      toast.error('Email not found. Please sign up first.');
      return;
    }

    setIsLoading(true);
    const code = generateOTP();
    const success = await sendOTP(resetEmail, code);

    if (success) {
      setSentOtpCode(code);
      setOtpSent(true);
      toast.success('Verification code sent to your email');
    } else {
      toast.error('Failed to send verification code. Please try again.');
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp === sentOtpCode) {
      toast.success('Email verified successfully! You can now access your account.');
      // For demo, we just log them in or allow reset
      // In a real app, you'd redirect to password reset form
      await forceLogin(resetEmail);
    } else {
      toast.error('Invalid verification code');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-background to-cyan-950/20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <Card className="w-full max-w-md relative z-10 border-blue-500/20 bg-card/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full border-2 border-primary/20">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Secure Login</CardTitle>
          <CardDescription className="text-muted-foreground">
            AI-powered authentication with real-time threat detection
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isResetting ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Verification Required</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {otpSent
                    ? `Enter the code sent to ${resetEmail}`
                    : "Enter your email to receive a verification code"}
                </p>
              </div>

              {!otpSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="name@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="bg-input-background"
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Verification Code"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsResetting(false)}
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="bg-input-background text-center text-2xl tracking-widest"
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleVerifyOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </Button>
                  <div className="flex justify-between text-sm">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-normal text-muted-foreground"
                      onClick={() => setOtpSent(false)}
                    >
                      Change Email
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-normal"
                      onClick={handleSendOTP}
                    >
                      Resend Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-input-background border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-input-background border-border focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                  <input type="checkbox" className="rounded border-border" />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-primary hover:underline bg-transparent border-0 p-0"
                  onClick={() => setIsResetting(true)}
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                <Lock className="w-4 h-4 mr-2" />
                Sign In Securely
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">New to our platform?</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border hover:bg-primary/10 hover:border-primary"
                onClick={onSwitchToSignup}
              >
                Create New Account
              </Button>
            </form>
          )}

          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Protected by ML-based Security</p>
                <p>Your login is monitored by our advanced machine learning algorithms for suspicious activity.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
