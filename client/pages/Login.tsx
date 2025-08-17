import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, Zap, Globe } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 4D Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Floating geometric shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-cyan-400/10 rounded-lg rotate-45 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl animate-ping"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>

      {/* Main login container */}
      <div className="relative z-10 w-full max-w-md mx-auto p-4">
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2">
          <CardHeader className="text-center pb-8">
            {/* Company Logo with 4D animations */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                {/* Logo container with 3D effects */}
                <div className="relative p-4 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl transform transition-all duration-700 group-hover:rotate-y-12 group-hover:scale-110">
                  {/* Glowing ring effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/50 to-cyan-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  
                  {/* Company Logo */}
                  <img 
                    src="https://cdn.builder.io/api/v1/image/assets%2F1fbf421a819c445c98433c60c021cfe3%2F3b08740381e240668387cc3e852e7f75?format=webp&width=800"
                    alt="MT Web Experts Logo"
                    className="w-20 h-20 relative z-10 drop-shadow-2xl transition-all duration-500 group-hover:drop-shadow-3xl"
                  />
                  
                  {/* Floating sparkles around logo */}
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-ping" />
                  <Zap className="absolute -bottom-2 -left-2 w-5 h-5 text-cyan-400 animate-bounce" />
                  <Globe className="absolute top-1/2 -right-4 w-4 h-4 text-blue-400 animate-spin" />
                </div>
              </div>
            </div>

            {/* Animated title */}
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-2 transform transition-all duration-500 hover:scale-105">
              MT Web Experts
            </CardTitle>
            <CardDescription className="text-white/80 text-lg font-medium">
              Accounts Management System
            </CardDescription>
            
            {/* Animated underline */}
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto mt-4 animate-pulse"></div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field with 3D styling */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-medium">
                  Email Address
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:border-blue-400/50 focus:shadow-lg focus:shadow-blue-400/25 transform focus:scale-[1.02]"
                    placeholder="Enter your email"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Password field with 3D styling */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 font-medium">
                  Password
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:border-blue-400/50 focus:shadow-lg focus:shadow-blue-400/25 transform focus:scale-[1.02]"
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Error alert with enhanced styling */}
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-400/50 backdrop-blur-sm animate-shake">
                  <AlertDescription className="text-red-100">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Animated submit button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed border-0" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    <span className="animate-pulse">Signing you in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center group">
                    <span>Sign In</span>
                    <Zap className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>

      {/* Additional 4D CSS styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes rotate-y-12 {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(12deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .group:hover .group-hover\\:rotate-y-12 {
          animation: rotate-y-12 0.7s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
