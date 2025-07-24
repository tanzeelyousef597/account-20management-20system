import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  BarChart3,
  ClipboardList,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  LogOut,
  User,
  ChevronDown,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Work Orders', href: '/work-orders', icon: ClipboardList },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Bonuses', href: '/bonuses', icon: TrendingUp },
  { name: 'Fines', href: '/fines', icon: AlertCircle },
  { name: 'Activity Logs', href: '/logs', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const workerNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'My Orders', href: '/my-orders', icon: ClipboardList },
  { name: 'My Invoices', href: '/my-invoices', icon: FileText },
  { name: 'My Bonuses', href: '/my-bonuses', icon: TrendingUp },
  { name: 'My Fines', href: '/my-fines', icon: AlertCircle },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <>{children}</>;
  }

  const navItems = user.role === 'Admin' ? adminNavItems : workerNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b px-6">
            <Building2 className="h-8 w-8 text-primary" />
            <div className="ml-3">
              <div className="text-lg font-semibold text-gray-900">MT Web Experts</div>
              <div className="text-xs text-gray-500">Accounts Management</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-3 py-2 h-auto">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={user.profilePhoto} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <header className="bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {user.role === 'Admin' ? 'Administrator' : 'Worker'}
              </h1>
            </div>
            {user.role === 'Worker' && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profilePhoto} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
