import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { loadDB, saveDB, generateId, Profile } from '@/lib/db';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'teacher' | 'student'>('student');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const db = loadDB();
    const user = db.profiles.find(p => p.email === loginEmail && p.password === loginPassword);
    
    if (user) {
      db.session.userId = user.id;
      saveDB(db);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } else {
      toast.error('Invalid email or password');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const db = loadDB();
    
    if (db.profiles.find(p => p.email === signupEmail)) {
      toast.error('Email already exists');
      return;
    }

    const newUser: Profile = {
      id: generateId('user'),
      email: signupEmail,
      password: signupPassword,
      role: signupRole,
      name: signupName,
    };

    db.profiles.push(newUser);
    db.session.userId = newUser.id;
    saveDB(db);
    
    toast.success(`Account created! Welcome, ${newUser.name}!`);
    navigate(newUser.role === 'teacher' ? '/teacher' : '/student');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-subtle)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4" style={{ boxShadow: 'var(--shadow-glow)' }}>
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gradebook</h1>
          <p className="text-muted-foreground">Manage grades and track progress</p>
        </div>

        <Card className="border-border" style={{ boxShadow: 'var(--shadow-elegant)' }}>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Login or create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="teacher@demo"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="demo"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Demo: teacher@demo / student@demo (password: demo)
                  </p>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={signupRole === 'student' ? 'default' : 'outline'}
                        onClick={() => setSignupRole('student')}
                        className="flex-1"
                      >
                        Student
                      </Button>
                      <Button
                        type="button"
                        variant={signupRole === 'teacher' ? 'default' : 'outline'}
                        onClick={() => setSignupRole('teacher')}
                        className="flex-1"
                      >
                        Teacher
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
