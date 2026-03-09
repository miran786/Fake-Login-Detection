import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Users,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Globe,
  MapPin,
  Smartphone,
  Search,
  UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface AdminStats {
  totalUsers: number;
  totalLogins: number;
  totalFailedAttempts: number;
  riskDistribution: { low: number; medium: number; high: number };
  recentSignups: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string | null;
  loginCount: number;
  failedAttemptCount: number;
  latestRiskScore: number | null;
  latestRiskLevel: string | null;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string | null;
  loginHistory: Array<{
    id: string;
    timestamp: string;
    ip: string | null;
    city: string | null;
    country: string | null;
    device: string | null;
    riskScore: number;
    riskLevel: string;
  }>;
  failedAttempts: Array<{
    id: string;
    timestamp: string;
    ip: string | null;
    browser: string | null;
  }>;
}

const getRiskBadge = (level: string | null) => {
  if (!level) return { label: 'N/A', bgColor: 'bg-muted', color: 'text-muted-foreground', borderColor: 'border-border' };
  const l = level.toLowerCase();
  if (l === 'low') return { label: 'Low', bgColor: 'bg-success/10', color: 'text-success', borderColor: 'border-success/20' };
  if (l === 'medium') return { label: 'Medium', bgColor: 'bg-warning/10', color: 'text-warning', borderColor: 'border-warning/20' };
  return { label: 'High', bgColor: 'bg-destructive/10', color: 'text-destructive', borderColor: 'border-destructive/20' };
};

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (iso: string) => {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`),
        fetch(`${API_BASE}/api/admin/users`),
      ]);
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch (e) {
      console.error('Failed to fetch admin data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openUserDetail = async (userId: string) => {
    setDetailLoading(true);
    setDialogOpen(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`);
      setSelectedUser(await res.json());
    } catch (e) {
      console.error('Failed to fetch user detail:', e);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <h1 className="text-xl font-semibold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">User Management & Security Overview</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => (window.location.href = '/')}>
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <UserPlus className="w-3 h-3 inline mr-1" />
                  {stats.recentSignups} new this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Total Logins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalLogins}</div>
                <p className="text-xs text-muted-foreground mt-1">All time login attempts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Failed Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalFailedAttempts}</div>
                <p className="text-xs text-muted-foreground mt-1">Active failed attempts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="w-5 h-5 text-destructive" />
                  High Risk Logins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.riskDistribution.high}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-success">{stats.riskDistribution.low} low</span>
                  <span className="text-xs text-warning">{stats.riskDistribution.medium} med</span>
                  <span className="text-xs text-destructive">{stats.riskDistribution.high} high</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Click any user to see full login history and details</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No users match your search.' : 'No users found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-center">Logins</TableHead>
                      <TableHead className="text-center">Failed</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const risk = getRiskBadge(user.latestRiskLevel);
                      return (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer hover:bg-accent/50"
                          onClick={() => openUserDetail(user.id)}
                        >
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</TableCell>
                          <TableCell className="text-center">{user.loginCount}</TableCell>
                          <TableCell className="text-center">{user.failedAttemptCount}</TableCell>
                          <TableCell>
                            <Badge className={`${risk.bgColor} ${risk.color} border ${risk.borderColor}`}>
                              {risk.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* User Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          {detailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : selectedUser ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {selectedUser.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser.email} &middot; Joined {formatDate(selectedUser.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="logins" className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="logins" className="flex-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Login History ({selectedUser.loginHistory.length})
                  </TabsTrigger>
                  <TabsTrigger value="failed" className="flex-1">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Failed Attempts ({selectedUser.failedAttempts.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="logins">
                  {selectedUser.loginHistory.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No login history</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>Risk</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedUser.loginHistory.map((h) => {
                            const risk = getRiskBadge(h.riskLevel);
                            return (
                              <TableRow key={h.id}>
                                <TableCell className="whitespace-nowrap text-sm">
                                  {formatDateTime(h.timestamp)}
                                </TableCell>
                                <TableCell>
                                  <span className="flex items-center gap-1 text-sm">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    {[h.city, h.country].filter(Boolean).join(', ') || 'Unknown'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="flex items-center gap-1 text-sm">
                                    <Globe className="w-3 h-3 text-muted-foreground" />
                                    {h.ip || 'N/A'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="flex items-center gap-1 text-sm">
                                    <Smartphone className="w-3 h-3 text-muted-foreground" />
                                    <span className="truncate max-w-[150px]">{h.device || 'Unknown'}</span>
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${risk.bgColor} ${risk.color} border ${risk.borderColor} text-xs`}>
                                      {h.riskScore}%
                                    </Badge>
                                    <Progress value={h.riskScore} className="h-1.5 w-12" />
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="failed">
                  {selectedUser.failedAttempts.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No failed attempts</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Browser</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedUser.failedAttempts.map((f) => (
                            <TableRow key={f.id}>
                              <TableCell className="whitespace-nowrap text-sm">
                                {formatDateTime(f.timestamp)}
                              </TableCell>
                              <TableCell>
                                <span className="flex items-center gap-1 text-sm">
                                  <Globe className="w-3 h-3 text-muted-foreground" />
                                  {f.ip || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">{f.browser || 'Unknown'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
