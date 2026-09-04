import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Transaction,
  AppNotification,
  DemoScenario,
  TransactionSignals,
} from '../types';
import { TrustPayApiService, DEFAULT_USERS } from '../services/api';

export type ScreenView = 
  | 'login' 
  | 'dashboard' 
  | 'send' 
  | 'confirmation' 
  | 'demo_panel' 
  | 'notifications';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  currentScreen: ScreenView;
  setCurrentScreen: (screen: ScreenView) => void;
  balance: number;
  history: Transaction[];
  activeTransaction: Transaction | null;
  setActiveTransaction: (tx: Transaction | null) => void;
  notifications: AppNotification[];
  isLoading: boolean;
  error: string | null;
  toastMessage: { title: string; body: string; type?: 'info' | 'success' | 'warning' | 'emergency' } | null;
  clearToast: () => void;
  backendUrl: string;
  isLiveApi: boolean;
  updateBackendUrl: (url: string) => Promise<{ ok: boolean; message: string }>;
  handleSelectUser: (user: User) => void;
  handleCreateUser: (data: {
    name: string;
    email: string;
    trustedContactName: string;
    trustedContactPhone: string;
    relationship?: string;
  }) => Promise<void>;
  handleInitiateTransaction: (payload: {
    recipient: string;
    amount: number;
    note?: string;
    signals: TransactionSignals;
  }) => Promise<Transaction | null>;
  handleRunScenario: (scenario: DemoScenario) => Promise<void>;
  handleCompleteActiveTransaction: () => Promise<void>;
  handleVerifyActiveTransaction: () => Promise<void>;
  handleCancelActiveTransaction: () => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('login');
  const [balance, setBalance] = useState<number>(148500.00);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string; type?: 'info' | 'success' | 'warning' | 'emergency' } | null>(null);
  const [backendUrl, setBackendUrlState] = useState<string>('');
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Initialize service & persisted state on mount
  useEffect(() => {
    TrustPayApiService.init();
    const storedUrl = TrustPayApiService.getBackendUrl();
    setBackendUrlState(storedUrl);
    setIsLiveApi(TrustPayApiService.isLiveConfigured());

    // Load notifications
    setNotifications(TrustPayApiService.getStoredNotifications());

    // Load users
    TrustPayApiService.getUsers().then(loadedUsers => {
      setUsers(loadedUsers);
      // Auto-select first demo user if none chosen
      const savedUserId = localStorage.getItem('trustpay_selected_user_id');
      const found = loadedUsers.find(u => u.id === savedUserId) || loadedUsers[0];
      if (found) {
        setCurrentUser(found);
        setBalance(found.balance);
        loadHistory(found.id);
      }
    });
  }, []);

  const loadHistory = async (userId: string) => {
    setIsLoading(true);
    try {
      const txs = await TrustPayApiService.getUserHistory(userId);
      setHistory(txs);
    } catch (err: any) {
      console.warn('Could not load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearToast = () => setToastMessage(null);

  const showToast = (title: string, body: string, type: 'info' | 'success' | 'warning' | 'emergency' = 'info') => {
    setToastMessage({ title, body, type });
  };

  const updateBackendUrl = async (newUrl: string) => {
    TrustPayApiService.setBackendUrl(newUrl);
    setBackendUrlState(newUrl);
    const configured = TrustPayApiService.isLiveConfigured();
    setIsLiveApi(configured);
    if (configured) {
      const result = await TrustPayApiService.testConnection();
      return result;
    }
    return { ok: true, message: 'Switched to Demo Simulation Mode' };
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setBalance(user.balance);
    localStorage.setItem('trustpay_selected_user_id', user.id);
    loadHistory(user.id);
    setCurrentScreen('dashboard');
  };

  const handleCreateUser = async (data: {
    name: string;
    email: string;
    trustedContactName: string;
    trustedContactPhone: string;
    relationship?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await TrustPayApiService.createUser(data);
      setUsers(prev => [created, ...prev]);
      handleSelectUser(created);
      showToast('Profile Created', `Welcome to TrustPay, ${created.name}!`, 'success');
    } catch (err: any) {
      setError(err?.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateTransaction = async (payload: {
    recipient: string;
    amount: number;
    note?: string;
    signals: TransactionSignals;
  }): Promise<Transaction | null> => {
    if (!currentUser) return null;
    setIsLoading(true);
    setError(null);
    try {
      const result = await TrustPayApiService.createTransaction({
        userId: currentUser.id,
        recipient: payload.recipient,
        amount: payload.amount,
        note: payload.note,
        signals: payload.signals,
        trustedContact: {
          name: currentUser.trustedContact.name,
          phone: currentUser.trustedContact.phone,
        },
      });

      setActiveTransaction(result);

      // Merge newly triggered notifications
      if (result.notifications && result.notifications.length > 0) {
        setNotifications(prev => {
          const updated = [...result.notifications!, ...prev];
          TrustPayApiService.saveNotifications(updated);
          return updated;
        });

        // Trigger toast for highest severity notification
        const topNotif = result.notifications[0];
        showToast(topNotif.title, topNotif.body, topNotif.severity);
      }

      setCurrentScreen('confirmation');
      return result;
    } catch (err: any) {
      setError(err?.message || 'Transaction evaluation error');
      showToast('Transaction Evaluation Failed', err?.message || 'Network error', 'emergency');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScenario = async (scenario: DemoScenario) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const tx = await TrustPayApiService.createTransaction({
        userId: currentUser.id,
        recipient: scenario.recipient,
        amount: scenario.amount,
        note: scenario.name,
        signals: scenario.signals,
        trustedContact: {
          name: currentUser.trustedContact.name,
          phone: currentUser.trustedContact.phone,
        },
      });

      // Ensure scenario's defined interface and warnings match scenario intent
      tx.interface = scenario.expectedInterface;
      tx.riskBand = scenario.riskBand;
      tx.trustScore = scenario.trustScore;
      tx.layer7Warnings = scenario.layer7Warnings;
      tx.naturalLanguageSummary = scenario.naturalLanguageSummary;

      setActiveTransaction(tx);

      if (tx.notifications && tx.notifications.length > 0) {
        setNotifications(prev => {
          const updated = [...tx.notifications!, ...prev];
          TrustPayApiService.saveNotifications(updated);
          return updated;
        });
        const top = tx.notifications[0];
        showToast(top.title, top.body, top.severity);
      }

      setCurrentScreen('confirmation');
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger scenario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteActiveTransaction = async () => {
    if (!activeTransaction || !currentUser) return;
    setIsLoading(true);
    try {
      const updatedTx: Transaction = {
        ...activeTransaction,
        status: 'completed',
        timestamp: 'Just now',
      };

      setBalance(prev => Math.max(0, prev - updatedTx.amount));
      const newHistory = [updatedTx, ...history];
      setHistory(newHistory);
      TrustPayApiService.saveUserHistory(currentUser.id, newHistory);

      showToast(
        'Payment Complete',
        `₹${updatedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} sent securely to ${updatedTx.recipient}.`,
        'success'
      );
      setActiveTransaction(null);
      setCurrentScreen('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyActiveTransaction = async () => {
    if (!activeTransaction || !currentUser) return;
    setIsLoading(true);
    try {
      const result = await TrustPayApiService.verifyTransaction(activeTransaction.id);
      const updatedTx: Transaction = {
        ...activeTransaction,
        status: 'verified',
        timestamp: 'Just now',
        trustScore: Math.min(95, activeTransaction.trustScore + 35),
      };

      setBalance(prev => Math.max(0, prev - updatedTx.amount));
      const newHistory = [updatedTx, ...history];
      setHistory(newHistory);
      TrustPayApiService.saveUserHistory(currentUser.id, newHistory);

      showToast('Identity Verified', result.message || 'Transaction approved after verification.', 'success');
      setActiveTransaction(null);
      setCurrentScreen('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelActiveTransaction = async () => {
    if (!activeTransaction || !currentUser) return;
    setIsLoading(true);
    try {
      const result = await TrustPayApiService.cancelTransaction(activeTransaction.id);
      const updatedTx: Transaction = {
        ...activeTransaction,
        status: 'cancelled',
        timestamp: 'Just now',
      };

      const newHistory = [updatedTx, ...history];
      setHistory(newHistory);
      TrustPayApiService.saveUserHistory(currentUser.id, newHistory);

      showToast('Transaction Cancelled', result.message || 'No funds were moved. Your balance is protected.', 'info');
      setActiveTransaction(null);
      setCurrentScreen('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHistory = async () => {
    if (currentUser) {
      await loadHistory(currentUser.id);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        currentScreen,
        setCurrentScreen,
        balance,
        history,
        activeTransaction,
        setActiveTransaction,
        notifications,
        isLoading,
        error,
        toastMessage,
        clearToast,
        backendUrl,
        isLiveApi,
        updateBackendUrl,
        handleSelectUser,
        handleCreateUser,
        handleInitiateTransaction,
        handleRunScenario,
        handleCompleteActiveTransaction,
        handleVerifyActiveTransaction,
        handleCancelActiveTransaction,
        refreshHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
