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
      {/* Background Animation - Responsive sizes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-32 md:-top-40 -right-20 sm:-right-32 md:-right-40 w-40 sm:w-60 md:w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem] h-40 sm:h-60 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem] bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-20 sm:-left-32 md:-left-40 w-40 sm:w-60 md:w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem] h-40 sm:h-60 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem] bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
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
        "fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-slate-200/50 transform transition-all duration-500 ease-out",
        // Responsive width: smaller on mobile, normal on larger screens
        "w-72 sm:w-64 md:w-64 lg:w-64 xl:w-72 2xl:w-80",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 sm:h-16 items-center justify-between border-b border-slate-200/50 px-3 sm:px-4 md:px-6 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
            <div className="flex items-center group relative z-10 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <Building2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" />
                <div className="absolute inset-0 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 bg-white/20 rounded-full blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
              </div>
              <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                <div className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight drop-shadow-sm truncate">
                  <span className="hidden sm:inline">MT Web Experts</span>
                  <span className="sm:hidden">MT Web</span>
                </div>
                <div className="text-xs text-blue-100/90 hidden sm:block">Accounts Management</div>
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
                    'flex items-center px-2 sm:px-3 md:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 relative group animate-in slide-in-from-left transform hover:scale-105',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 hover:shadow-md'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 w-1 h-6 sm:h-7 md:h-8 bg-white rounded-full transform -translate-y-1/2 animate-in slide-in-from-left duration-500"></div>
                  )}

                  {/* Icon with animation */}
                  <Icon className={cn(
                    "mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 flex-shrink-0",
                    isActive ? "text-white drop-shadow-sm" : "text-gray-500 group-hover:text-blue-600"
                  )} />

                  {/* Text */}
                  <span className="relative z-10 truncate flex-1 min-w-0">
                    <span className="hidden sm:inline">{item.name}</span>
                    <span className="sm:hidden">
                      {item.name.split(' ')[0]}
                    </span>
                  </span>

                  {/* Hover effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}

                  {/* Chat notification badge */}
                  {item.name === 'Chat' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-200/50 p-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-3 py-3 h-auto rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group">
                  <Avatar className="h-10 w-10 mr-3 ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all duration-300">
                    <AvatarImage src={user.profilePhoto} />
                    <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{user.name}</div>
                    <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-300 capitalize">{user.role}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-all duration-300 group-hover:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-slate-200 shadow-2xl backdrop-blur-xl bg-white/95">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-300 cursor-pointer group"
                >
                  <LogOut className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 xl:pl-72 2xl:pl-80 relative">
        <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 sticky top-0 z-30">
          <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center min-w-0 flex-1">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 mr-2 sm:mr-3 transition-all duration-300 hover:scale-110 flex-shrink-0"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="animate-in slide-in-from-left duration-500 min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  <span className="hidden md:inline">
                    {user.role === 'Admin' ? 'Administrator Dashboard' : 'Worker Dashboard'}
                  </span>
                  <span className="md:hidden">
                    {user.role === 'Admin' ? 'Admin' : 'Worker'}
                  </span>
                </h1>
                <div className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate hidden sm:block">
                  Welcome back, {user.name.split(' ')[0]}
                </div>
              </div>
            </div>
            {user.role === 'Worker' && (
              <div className="flex items-center space-x-3 animate-in slide-in-from-right duration-500">
                <Avatar className="h-8 w-8 ring-2 ring-blue-100 hover:ring-blue-300 transition-all duration-300">
                  <AvatarImage src={user.profilePhoto} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline hover:text-blue-600 transition-colors duration-300">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 animate-in fade-in duration-700 relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
          <div className="relative z-10 max-w-[1920px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
