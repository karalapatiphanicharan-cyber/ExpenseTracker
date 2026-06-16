import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import {
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Wallet,
  User,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import Button from '../components/Button';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
            <Wallet size={20} />
          </div>
          <span className="font-bold text-lg dark:text-white tracking-tight">ExpenseTrack</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ease-in-out flex flex-col group",
        isCollapsed ? "w-20" : "w-72",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "fixed lg:static"
      )}>
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-600 shadow-sm z-50 opacity-0 group-hover:opacity-100 transition-all"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={cn(
          "flex items-center border-b border-slate-50 dark:border-slate-800 transition-all duration-300",
          isCollapsed ? "p-5 justify-center" : "p-8 gap-3"
        )}>
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200 dark:shadow-none shrink-0">
            <Wallet size={24} />
          </div>
          {!isCollapsed && <span className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight whitespace-nowrap overflow-hidden">ExpenseTrack</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center transition-all font-semibold rounded-2xl h-12",
                isCollapsed ? "justify-center px-0" : "px-4 gap-3",
                location.pathname === item.path
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
              title={isCollapsed ? item.name : ""}
            >
              <item.icon size={22} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50 dark:border-slate-800 space-y-4">
          <button
            onClick={toggleDarkMode}
            className={cn(
              "flex items-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all font-semibold h-12",
              isCollapsed ? "justify-center px-0" : "px-4 gap-3",
            )}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isCollapsed ? (darkMode ? 'Light Mode' : 'Dark Mode') : ""}
          >
            {darkMode ? <Sun size={22} className="shrink-0" /> : <Moon size={22} className="shrink-0" />}
            {!isCollapsed && <span className="whitespace-nowrap">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <div className={cn(
            "bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center border border-slate-100 dark:border-slate-800 transition-all duration-300",
            isCollapsed ? "p-1 justify-center" : "p-4 gap-3"
          )}>
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider font-semibold">{user?.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-bold h-12",
              isCollapsed ? "justify-center px-0" : "px-4 gap-3",
            )}
            aria-label="Logout"
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={22} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen pt-20 lg:pt-0">
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
