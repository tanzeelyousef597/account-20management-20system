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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Enhanced 4D animated background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(59,130,246,0.1)_1px,_transparent_0)] bg-[length:20px_20px] opacity-60 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-indigo-50/20"></div>

      {/* Floating geometric shapes for 4D effect */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-blue-200/10 rounded-full blur-2xl animate-bounce opacity-40"></div>
      <div className="absolute bottom-40 left-10 w-24 h-24 bg-indigo-300/10 rounded-lg rotate-45 animate-pulse opacity-30"></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-cyan-200/10 rounded-full animate-ping opacity-20"></div>

      {/* Dynamic grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] animate-pulse opacity-50"></div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Enhanced 4D Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-white via-white to-slate-50/50 shadow-2xl border-r border-slate-200/60 backdrop-blur-xl transform transition-all duration-500 ease-out",
        // Responsive width: optimized for all screen sizes
        "w-72 xs:w-64 sm:w-64 md:w-64 lg:w-64 xl:w-72 2xl:w-80 3xl:w-84 4xl:w-96 5xl:w-[26rem]",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/30 opacity-60"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 opacity-80"></div>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 sm:h-16 items-center justify-between border-b border-blue-200/50 px-3 sm:px-4 md:px-6 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 relative overflow-hidden">
            {/* Enhanced animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)] animate-ping opacity-20"></div>

            <div className="flex items-center group relative z-10 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                {/* Company Logo with 4D effects */}
                <div className="relative p-1 bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/30">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F1fbf421a819c445c98433c60c021cfe3%2F3b08740381e240668387cc3e852e7f75?format=webp&width=800"
                    alt="MT Web Experts Logo"
                    className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 object-contain drop-shadow-lg transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-150"></div>
                </div>
              </div>
              <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                <div className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight drop-shadow-sm truncate transition-all duration-200 group-hover:scale-105">
                  <span className="hidden sm:inline">MT Web Experts</span>
                  <span className="sm:hidden">MT Web</span>
                </div>
                <div className="text-xs text-blue-100/90 hidden sm:block transition-colors duration-200 group-hover:text-white">Accounts Management</div>
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
          <nav className="flex-1 space-y-2 p-4 relative overflow-y-auto overflow-x-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-transparent to-indigo-50/20 pointer-events-none"></div>
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent"></div>
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
                    'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative group overflow-hidden animate-slide-up',
                    isActive
                      ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg transform scale-105'
                      : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50/50 hover:text-slate-900 hover:scale-102'
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
      <div className="lg:pl-64 xl:pl-72 2xl:pl-80 3xl:pl-84 4xl:pl-96 5xl:pl-[26rem] relative">
        <header className="bg-gradient-to-r from-white via-slate-50/80 to-blue-50/50 border-b border-slate-200/60 sticky top-0 z-30 backdrop-blur-md shadow-lg">
          <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-indigo-50/20 opacity-0 animate-pulse"></div>
            <div className="flex items-center min-w-0 flex-1">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50/50 mr-3 transition-all duration-300 flex-shrink-0 relative z-10 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-xl font-semibold text-slate-700 truncate">
                  <span className="hidden md:inline">
                    {user.role === 'Admin' ? 'Administrator Dashboard' : 'Worker Dashboard'}
                  </span>
                  <span className="md:hidden">
                    {user.role === 'Admin' ? 'Admin' : 'Worker'}
                  </span>
                </h1>
                <div className="text-sm text-slate-500 mt-0.5 truncate hidden sm:block">
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

        <main className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 animate-fade-in relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50/80 via-white/60 to-blue-50/40 overflow-hidden">
          {/* Enhanced 4D main content background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.03)_0%,_transparent_70%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_rgba(59,130,246,0.01)_0deg,_transparent_60deg,_rgba(99,102,241,0.01)_120deg,_transparent_180deg)] pointer-events-none animate-spin" style={{animationDuration: '20s'}}></div>

          {/* Floating elements for depth */}
          <div className="absolute top-10 right-10 w-2 h-2 bg-blue-400/20 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 right-1/4 w-1 h-1 bg-cyan-400/30 rounded-full animate-bounce"></div>

          <div className="relative z-10 w-full max-w-full overflow-hidden">
            <div className="animate-scale-in max-w-full transform transition-all duration-700 hover:scale-[1.001]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
