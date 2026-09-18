import React from 'react';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { QuickAddModal } from './components/QuickAddModal';
import { ResetModal } from './components/ResetModal';
import { HomePage } from './pages/HomePage';
import { FocusPage } from './pages/FocusPage';
import { TasksPage } from './pages/TasksPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BodyPage } from './pages/BodyPage';
import { ForFunPage } from './pages/ForFunPage';
import { ReviewPage } from './pages/ReviewPage';
import { AuthPage } from './pages/AuthPage';

export const App: React.FC = () => {
  const { page, toastMessage } = useApp();
  const { user, loading } = useAuth();

  // Loading state while verifying persistent session
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-light-bg dark:bg-night-bg text-light-text dark:text-night-text transition-colors duration-200">
        <div className="flex flex-col items-center gap-3 animate-soft-pulse">
          <span className="text-3xl text-pastel-yellow-ink dark:text-pastel-yellow">✦</span>
          <span className="font-serif italic text-lg text-light-muted dark:text-night-muted">
            loading workspace...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated: render Auth screen
  if (!user) {
    return <AuthPage />;
  }

  const renderActivePage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'focus':
        return <FocusPage />;
      case 'tasks':
        return <TasksPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'body':
        return <BodyPage />;
      case 'for_fun':
        return <ForFunPage />;
      case 'review':
        return <ReviewPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-night-bg text-light-text dark:text-night-text transition-colors duration-300">
      {/* Navigation Header */}
      <Header />

      {/* Side Navigation Drawer */}
      <NavigationDrawer />

      {/* Global Quick Add Modal */}
      <QuickAddModal />

      {/* Workspace Reset Modal */}
      <ResetModal />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 sm:pb-24">
        {renderActivePage()}
      </main>

      {/* Floating Gentle Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fadeIn">
          <div className="px-4 py-2 rounded-full bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg font-serif italic text-sm shadow-lg tracking-wide flex items-center gap-2">
            <span className="text-pastel-yellow text-xs">✦</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
