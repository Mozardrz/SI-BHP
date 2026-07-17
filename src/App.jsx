import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Materials } from './pages/Materials';
import { Labs } from './pages/Labs';
import { Courses } from './pages/Courses';
import { UsageRequests } from './pages/UsageRequests';
import { LowStock } from './pages/LowStock';
import { History } from './pages/History';
import { UserManagement } from './pages/UserManagement';
import { Profile } from './pages/Profile';

const AppContent = () => {
  const { currentUser, loading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // drawer menu di layar HP

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-mono text-slate-400">Memuat SI-BHP Polbeng...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={() => setCurrentPage('dashboard')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'materials':
        return <Materials />;
      case 'labs':
        return <Labs />;
      case 'courses':
        return <Courses />;
      case 'requests':
        return <UsageRequests />;
      case 'low-stock':
        return <LowStock />;
      case 'history':
        return <History />;
      case 'users':
        return isAdmin ? <UserManagement /> : <Dashboard onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex-1 flex w-full">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-hidden">
          {renderPage()}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
