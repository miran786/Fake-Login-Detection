import { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Smartphone,
  Globe,
  LogOut,
  TrendingUp,
  TrendingDown,
  Brain,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { SecurityInfo } from './security-info';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

import { useAuth } from '../context/AuthContext';



export function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const { loginHistory } = useAuth();
  const [currentRiskScore, setCurrentRiskScore] = useState(0);

  // Filter history for current user
  const userHistory = loginHistory.filter(h => h.email === userEmail);
  const latestLogin = userHistory.length > 0 ? userHistory[0] : null;

  useEffect(() => {
    // Animate risk score based on latest login or default
    const targetScore = latestLogin ? latestLogin.riskScore : 0;

    let current = 0;
    const interval = setInterval(() => {
      // If target is 0, just stay 0. If target > current, increment.
      if (current < targetScore) {
        current += 1;
        setCurrentRiskScore(current);
      } else if (current > targetScore) { // If we started high (e.g. from prev state) or just reset
        current = targetScore;
        setCurrentRiskScore(current);
        clearInterval(interval);
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [latestLogin]);

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: 'Low Risk', color: 'text-success', bgColor: 'bg-success/10', borderColor: 'border-success/20' };
    if (score < 60) return { label: 'Medium Risk', color: 'text-warning', bgColor: 'bg-warning/10', borderColor: 'border-warning/20' };
    return { label: 'High Risk', color: 'text-destructive', bgColor: 'bg-destructive/10', borderColor: 'border-destructive/20' };
  };

  const riskLevel = getRiskLevel(currentRiskScore);

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Fake Login Detection</h1>
                <p className="text-sm text-muted-foreground">ML-Powered Security Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-muted-foreground">Logged in as</p>
                <p className="text-sm font-medium">{userEmail}</p>
              </div>
              <Button variant="outline" onClick={onLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Current Session Risk Score */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  ML Risk Score Analysis
                </CardTitle>
                <CardDescription>
                  Real-time threat assessment using machine learning algorithms
                </CardDescription>
              </div>
              <Badge className={`${riskLevel.bgColor} ${riskLevel.color} border ${riskLevel.borderColor} text-base px-4 py-2`}>
                {riskLevel.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Risk Score</span>
                <span className={`text-2xl font-bold ${riskLevel.color}`}>{currentRiskScore}/100</span>
              </div>
              <Progress value={currentRiskScore} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Location Analysis</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestLogin ? `Detected: ${latestLogin.location}` : 'Geolocation tracking enabled'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Device Fingerprinting</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestLogin ? `Current: ${latestLogin.device}` : 'Device analysis enabled'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">IP Reputation</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestLogin ? `IP: ${latestLogin.ip}` : 'IP monitoring enabled'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">How It Works</p>
                  <p className="text-muted-foreground">
                    Our ML model analyzes multiple factors including IP reputation, geolocation consistency,
                    device fingerprint matching, behavioral patterns, and login timing to calculate a real-time
                    risk score. Suspicious activities are automatically flagged or blocked.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Successful Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    <p className="text-3xl font-bold">
                      {userHistory.filter(a => a.status === 'success').length}
                    </p>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                </div>
                <div className="flex items-center gap-1 text-success text-sm">
                  <TrendingDown className="w-4 h-4" />
                  <span>12%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Flagged Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    <p className="text-3xl font-bold">
                      {userHistory.filter(a => a.status === 'flagged').length}
                    </p>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                </div>
                <div className="flex items-center gap-1 text-warning text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>8%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-destructive" />
                Blocked Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    <p className="text-3xl font-bold">
                      {userHistory.filter(a => a.status === 'blocked').length}
                    </p>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                </div>
                <div className="flex items-center gap-1 text-success text-sm">
                  <TrendingDown className="w-4 h-4" />
                  <span>5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Login Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Login Attempts</CardTitle>
            <CardDescription>
              Complete history of authentication attempts with ML risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userHistory.map((attempt) => {
                const attemptRisk = getRiskLevel(attempt.riskScore);
                return (
                  <div
                    key={attempt.id}
                    className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {attempt.status === 'success' && (
                            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                          )}
                          {attempt.status === 'flagged' && (
                            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                          )}
                          {attempt.status === 'blocked' && (
                            <Lock className="w-5 h-5 text-destructive flex-shrink-0" />
                          )}
                          <span className="font-medium capitalize">{attempt.status}</span>
                          <span className="text-sm text-muted-foreground">
                            • {formatTimestamp(attempt.timestamp)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{attempt.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{attempt.ip}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{attempt.device}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${attemptRisk.bgColor} ${attemptRisk.color} border ${attemptRisk.borderColor}`}>
                          Risk: {attempt.riskScore}%
                        </Badge>
                        <div className="w-24">
                          <Progress value={attempt.riskScore} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <div className="mt-8">
          <SecurityInfo />
        </div>
      </main>
    </div>
  );
}