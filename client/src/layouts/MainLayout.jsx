import React, { useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import Button from '../components/Button';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <span className="font-bold text-lg dark:text-white">ExpenseTrack</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-500 dark:text-slate-400"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 lg:translate-x-0 flex flex-col",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="p-8 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200 dark:shadow-none">
            <Wallet size={24} />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">ExpenseTrack</span>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold",
                location.pathname === item.path
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon size={22} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50 dark:border-slate-800 space-y-6">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all font-semibold"
          >
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="px-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider font-semibold">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-bold"
          >
            <LogOut size={22} />
            Logout
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
