import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
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
  Settings,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Assigned Orders', href: '/assigned-orders', icon: ClipboardList },
  { name: 'Orders from Workers', href: '/orders-from-workers', icon: FileText },
  { name: 'Monthly Report', href: '/monthly-report', icon: TrendingUp },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Invoices', href: '/invoices', icon: DollarSign },
  { name: 'Bonuses', href: '/bonuses', icon: TrendingUp },
  { name: 'Fines', href: '/fines', icon: AlertCircle },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Activity Logs', href: '/logs', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const workerNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'My Orders', href: '/my-orders', icon: ClipboardList },
  { name: 'My Invoices', href: '/my-invoices', icon: FileText },
  { name: 'My Bonuses', href: '/my-bonuses', icon: TrendingUp },
  { name: 'My Fines', href: '/my-fines', icon: AlertCircle },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-slate-200/50 transform transition-all duration-500 ease-out",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200/50 px-6 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
            <div className="flex items-center group relative z-10">
              <div className="relative">
                <Building2 className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" />
                <div className="absolute inset-0 h-8 w-8 bg-white/20 rounded-full blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
              </div>
              <div className="ml-3">
                <div className="text-lg font-bold text-white tracking-tight drop-shadow-sm">MT Web Experts</div>
                <div className="text-xs text-blue-100/90">Accounts Management</div>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 relative z-10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent pointer-events-none"></div>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group animate-in slide-in-from-left',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.name === 'Chat' && unreadCount > 0 && (
                    <span className="absolute top-1 left-7 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
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
      <div className="lg:pl-64">
        <header className="bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-3"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {user.role === 'Admin' ? 'Administrator' : 'Worker'}
                </h1>
              </div>
            </div>
            {user.role === 'Worker' && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profilePhoto} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
