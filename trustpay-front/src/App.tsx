import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { SendMoneyScreen } from './components/SendMoneyScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { DemoPanelScreen } from './components/DemoPanelScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const { currentScreen, currentUser } = useApp();

  // If no user selected and not on login screen, show login
  if (!currentUser && currentScreen !== 'login') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans">
        <Navbar />
        <main className="flex-1 min-w-0 min-h-screen overflow-y-auto">
          <LoginScreen />
        </main>
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-900">
      <Navbar />
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto pb-16">
        {currentScreen === 'login' && <LoginScreen />}
        {currentScreen === 'dashboard' && <DashboardScreen />}
        {currentScreen === 'send' && <SendMoneyScreen />}
        {currentScreen === 'confirmation' && <ConfirmationScreen />}
        {currentScreen === 'demo_panel' && <DemoPanelScreen />}
        {currentScreen === 'notifications' && <NotificationsScreen />}
      </main>
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
