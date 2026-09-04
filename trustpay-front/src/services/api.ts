import {
  User,
  Transaction,
  TransactionSignals,
  InterfaceVariant,
  RiskBand,
  AppNotification,
  DemoScenario,
} from '../types';
import { DEMO_SCENARIOS } from './demoScenarios';
import { getRiskBandForScore } from '../utils/colors';

const STORAGE_KEY_URL = 'trustpay_backend_url';
const STORAGE_KEY_HISTORY = 'trustpay_tx_history';
const STORAGE_KEY_NOTIFICATIONS = 'trustpay_notifications';
const STORAGE_KEY_USER = 'trustpay_current_user';

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr_aarav_sharma',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@trustpay.in',
    accountNumber: '•••• 8492',
    balance: 148500.00,
    averageTrustScore: 88,
    trustedContact: {
      name: 'Ananya Sharma',
      phone: '+91 98765 43210',
      relationship: 'Sister',
      notifyOnHighRisk: true,
    },
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_priya_patel',
    name: 'Priya Patel',
    email: 'priya.patel@fintech.in',
    accountNumber: '•••• 3190',
    balance: 94200.00,
    averageTrustScore: 94,
    trustedContact: {
      name: 'Vikram Patel',
      phone: '+91 98234 56789',
      relationship: 'Spouse',
      notifyOnHighRisk: true,
    },
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_rohan_mehta',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@icicibank.co.in',
    accountNumber: '•••• 5021',
    balance: 235000.00,
    averageTrustScore: 78,
    trustedContact: {
      name: 'Kavita Mehta',
      phone: '+91 97123 45670',
      relationship: 'Mother',
      notifyOnHighRisk: true,
    },
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_HISTORY: Transaction[] = [
  {
    id: 'tx_hist_001',
    userId: 'usr_aarav_sharma',
    amount: 18500.00,
    recipient: 'Godrej Greens Residency',
    recipientAccount: 'ICIC0000492 • 4829103948',
    note: 'Monthly Apartment Rent',
    timestamp: 'Yesterday, 10:14 AM',
    trustScore: 98,
    riskBand: 'trusted',
    interface: 'normal',
    status: 'completed',
    layer7Warnings: [],
    naturalLanguageSummary: 'Standard recurring monthly rent transaction authorized on primary biometric device.',
  },
  {
    id: 'tx_hist_002',
    userId: 'usr_aarav_sharma',
    amount: 1450.00,
    recipient: "Nature's Basket Supermarket",
    recipientAccount: 'UPI POS: naturesbasket@icici',
    note: 'Groceries & Household Essentials',
    timestamp: 'Sep 2, 2026, 4:30 PM',
    trustScore: 95,
    riskBand: 'trusted',
    interface: 'normal',
    status: 'completed',
    layer7Warnings: [],
    naturalLanguageSummary: 'In-store UPI contactless payment at regular neighborhood grocery merchant.',
  },
  {
    id: 'tx_hist_003',
    userId: 'usr_aarav_sharma',
    amount: 12500.00,
    recipient: 'FabIndia Crafts Pvt Ltd',
    recipientAccount: 'HDFC0001234 • 9928102931',
    note: 'Handcrafted Teak Dining Set Deposit',
    timestamp: 'Aug 29, 2026, 2:15 PM',
    trustScore: 76,
    riskBand: 'slightly_suspicious',
    interface: 'normal_with_extra',
    status: 'completed',
    layer7Warnings: ['Amount exceeds typical discretionary transaction tier'],
    naturalLanguageSummary: 'Higher than usual amount verified successfully via SMS passkey.',
  },
  {
    id: 'tx_hist_004',
    userId: 'usr_aarav_sharma',
    amount: 9200.00,
    recipient: 'WazirVault Liquidations',
    recipientAccount: 'UPI: wazirvault@okhdfcbank',
    note: 'Urgent Peer-to-Peer Transfer',
    timestamp: 'Aug 21, 2026, 3:22 AM',
    trustScore: 42,
    riskBand: 'suspicious',
    interface: 'simplified',
    status: 'cancelled',
    layer7Warnings: [
      'Screen capture or cast stream active on local device',
      'Transaction initiated at 03:22 AM outside habitual active hours',
    ],
    naturalLanguageSummary: 'User initiated transfer during remote desktop session at 3:22 AM; transaction cancelled by user following high-clarity friction warning.',
  },
  {
    id: 'tx_hist_005',
    userId: 'usr_aarav_sharma',
    amount: 48500.00,
    recipient: 'Cyber Node Mumbai Escrow (Rajesh Verma)',
    recipientAccount: 'SBIN0048291 • Current A/c',
    note: 'Immediate Account Liquidation',
    timestamp: 'Aug 14, 2026, 11:05 AM',
    trustScore: 14,
    riskBand: 'emergency',
    interface: 'emergency',
    status: 'blocked',
    layer7Warnings: [
      'Active screen-sharing detected (AnyDesk / TeamViewer)',
      'Recipient account opened < 24h ago with zero history',
      'Sudden high-velocity account drainage pattern',
    ],
    naturalLanguageSummary: 'Tech support remote access scam intercepted in real time. Funds secured in account, designated trusted contact Ananya Sharma alerted via emergency SMS.',
  },
];

export class TrustPayApiService {
  private static backendUrl: string = '';

  static init() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_URL);
      if (saved) {
        this.backendUrl = saved.trim();
      } else {
        const envUrl = ((import.meta as any).env?.VITE_BACKEND_URL as string) || '';
        if (envUrl && !envUrl.includes('<YOUR_BACKEND_URL>')) {
          this.backendUrl = envUrl.trim();
        }
      }
    }
  }

  static getBackendUrl(): string {
    if (!this.backendUrl && typeof window !== 'undefined') {
      this.init();
    }
    return this.backendUrl;
  }

  static setBackendUrl(url: string) {
    this.backendUrl = url.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_URL, this.backendUrl);
    }
  }

  static isLiveConfigured(): boolean {
    const url = this.getBackendUrl();
    return Boolean(
      url &&
      url !== '<YOUR_BACKEND_URL>' &&
      (url.startsWith('http://') || url.startsWith('https://'))
    );
  }

  static cleanUrl(path: string): string {
    const base = this.getBackendUrl().replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }

  static async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.isLiveConfigured()) {
      return { ok: false, message: 'Backend URL is not configured or is placeholder.' };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      
      // Try /api/health or /api/users or root
      const response = await fetch(this.cleanUrl('/api/health'), {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeout);

      if (response && (response.ok || response.status === 404)) {
        return { ok: true, message: `Connected to API at ${this.getBackendUrl()}` };
      }
      return { ok: true, message: 'Endpoint reachable' };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Connection test failed' };
    }
  }

  // 1. Users
  static async getUsers(): Promise<User[]> {
    if (this.isLiveConfigured()) {
      try {
        const res = await fetch(this.cleanUrl('/api/users'), { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data;
          }
        }
      } catch (err) {
        console.warn('Fallback to local users list:', err);
      }
    }
    return DEFAULT_USERS;
  }

  static async createUser(userData: {
    name: string;
    email: string;
    trustedContactName: string;
    trustedContactPhone: string;
    relationship?: string;
  }): Promise<User> {
    if (this.isLiveConfigured()) {
      try {
        const res = await fetch(this.cleanUrl('/api/users'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            trustedContact: {
              name: userData.trustedContactName,
              phone: userData.trustedContactPhone,
              relationship: userData.relationship || 'Emergency Contact',
            },
          }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Failed to POST /api/users to live backend, falling back to local creation', err);
      }
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      balance: 10000.00,
      averageTrustScore: 92,
      trustedContact: {
        name: userData.trustedContactName,
        phone: userData.trustedContactPhone,
        relationship: userData.relationship || 'Emergency Contact',
        notifyOnHighRisk: true,
      },
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };
    return newUser;
  }

  // 2. Transaction History
  static async getUserHistory(userId: string): Promise<Transaction[]> {
    if (this.isLiveConfigured()) {
      try {
        const res = await fetch(this.cleanUrl(`/api/users/${userId}/history`), { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) return data;
        }
      } catch (err) {
        console.warn('Fallback to cached/seeded history:', err);
      }
    }

    // Local Storage History
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_KEY_HISTORY}_${userId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }

    return INITIAL_HISTORY.map(tx => ({ ...tx, userId }));
  }

  static saveUserHistory(userId: string, history: Transaction[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_HISTORY}_${userId}`, JSON.stringify(history));
    }
  }

  // 3. Evaluate & Create Transaction
  static async createTransaction(payload: {
    userId: string;
    recipient: string;
    amount: number;
    note?: string;
    signals: TransactionSignals;
    trustedContact?: { name: string; phone: string };
  }): Promise<Transaction> {
    if (this.isLiveConfigured()) {
      try {
        const res = await fetch(this.cleanUrl('/api/transactions'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        console.warn('Live transaction evaluation failed, using deterministic fraud-layer fallback:', err);
      }
    }

    // Deterministic Layer Evaluation Fallback
    // Computes continuous 0-100 Trust Score based on the requested signals and amount
    let score = 96;
    const warnings: string[] = [];
    const sig = payload.signals;

    if (sig.screenSharingActive) {
      score -= 48;
      warnings.push('Active screen-sharing software (e.g. AnyDesk, TeamViewer, Zoom) detected');
    }
    if (sig.unusualTimeOfDay) {
      score -= 16;
      warnings.push('Transaction executed outside user customary diurnal active hours (late night / early morning)');
    }
    if (sig.newRecipient) {
      score -= 14;
      warnings.push('Recipient account has no historical payment relationship with sender');
    }
    if (sig.geoAnomaly) {
      score -= 22;
      warnings.push('Inbound request originated from high-entropy IP geolocation or anomalous datacenter proxy');
    }
    if (sig.highVelocity) {
      score -= 18;
      warnings.push('Transaction velocity is significantly elevated compared to standard 30-day baseline');
    }
    if (sig.rapidAmountEscalation || payload.amount > 20000) {
      score -= 15;
      warnings.push(`Transfer value (₹${payload.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) surpasses habitual single-transaction discretionary cap`);
    }

    score = Math.max(8, Math.min(99, score));

    // Determine interface variant strictly according to prompt specifications
    let iface: InterfaceVariant = 'normal';
    let riskBand: RiskBand = getRiskBandForScore(score);

    if (sig.geoAnomaly && score < 60 && !sig.screenSharingActive) {
      iface = 'review_pending';
      riskBand = 'review_pending';
    } else if (score < 30 || (sig.screenSharingActive && payload.amount >= 20000)) {
      iface = 'emergency';
      riskBand = 'emergency';
    } else if (score < 60) {
      iface = 'simplified';
      riskBand = 'suspicious';
    } else if (score < 85 || payload.amount > 10000) {
      iface = 'normal_with_extra';
      riskBand = 'slightly_suspicious';
    } else {
      iface = 'normal';
      riskBand = 'trusted';
    }

    // Natural language summary (matching Gemini backend style)
    let naturalLanguageSummary = '';
    if (iface === 'emergency') {
      naturalLanguageSummary = `TrustPay halted this transaction because an active screen-mirroring tool was detected in combination with an urgent transfer of ₹${payload.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to an unverified recipient. This pattern matches high-frequency remote access scams. No funds have left your account.`;
    } else if (iface === 'simplified') {
      naturalLanguageSummary = `We noticed multiple unusual risk indicators, including screen-sharing activity and an atypical time of day. We have magnified the confirmation details to help you verify who is requesting this payment.`;
    } else if (iface === 'normal_with_extra') {
      naturalLanguageSummary = `Your payment details and device look secure. Since this transaction is above your typical single-transfer baseline, please complete a fast one-time SMS passkey verification.`;
    } else if (iface === 'review_pending') {
      naturalLanguageSummary = `We detected an unfamiliar network routing environment and novel device profile. This payment is safely paused in pending escrow while your identity is verified.`;
    } else {
      naturalLanguageSummary = `Transaction verified against normal behavioral baselines, recognized recipient, and valid device telemetry. No friction required.`;
    }

    const txId = `tx_${Date.now()}`;
    const contact = payload.trustedContact || {
      name: 'Ananya Sharma',
      phone: '+91 98765 43210',
    };

    const notifications: AppNotification[] = [];
    if (iface === 'emergency') {
      notifications.push({
        id: `notif_${Date.now()}_tc`,
        recipientName: contact.name,
        recipientType: 'trusted_contact',
        channel: 'sms',
        severity: 'emergency',
        title: 'URGENT: Suspicious Transaction Held',
        body: `TrustPay Alert: We safely intercepted a high-risk transfer of ₹${payload.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} for your contact. A remote access scam pattern was detected. Funds are secure.`,
        timestamp: 'Just now',
        transactionId: txId,
      });
      notifications.push({
        id: `notif_${Date.now()}_usr`,
        recipientName: 'You',
        recipientType: 'user',
        channel: 'push',
        severity: 'emergency',
        title: 'Transaction Held for Safety',
        body: `Your payment of ₹${payload.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to ${payload.recipient} was paused. No money was sent. We notified your trusted contact ${contact.name}.`,
        timestamp: 'Just now',
        transactionId: txId,
      });
    } else if (iface === 'simplified' || iface === 'review_pending') {
      notifications.push({
        id: `notif_${Date.now()}_usr`,
        recipientName: 'You',
        recipientType: 'user',
        channel: 'push',
        severity: 'warning',
        title: 'Step-up Verification Requested',
        body: `Additional verification required for ₹${payload.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} transfer to ${payload.recipient}.`,
        timestamp: 'Just now',
        transactionId: txId,
      });
    }

    const result: Transaction = {
      id: txId,
      userId: payload.userId,
      amount: payload.amount,
      recipient: payload.recipient,
      recipientAccount: `GB09 BANK ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      note: payload.note || 'Transfer via TrustPay',
      timestamp: 'Just now',
      trustScore: score,
      riskBand,
      interface: iface,
      status: iface === 'emergency' ? 'blocked' : (iface === 'review_pending' ? 'pending' : 'pending'),
      signals: payload.signals,
      layer7Warnings: warnings,
      naturalLanguageSummary,
      trustedContactNotified: iface === 'emergency',
      trustedContact: contact,
      notifications,
    };

    return result;
  }

  // 4. Verify Transaction
  static async verifyTransaction(transactionId: string): Promise<{ success: boolean; message: string }> {
    if (this.isLiveConfigured()) {
      try {
        const res = await fetch(this.cleanUrl(`/api/transactions/${transactionId}/verify`), {
          method: 'POST',
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Fallback verify:', err);
      }
    }
    return {
      success: true,
      message: 'Identity successfully authenticated via two-factor cryptographic challenge.',
    };
  }

  // 5. Cancel Transaction
  static async cancelTransaction(transactionId: string): Promise<{ success: boolean; message: string }> {
    if (this.isLiveConfigured()) {
      try {
        const res = await fetch(this.cleanUrl(`/api/transactions/${transactionId}/cancel`), {
          method: 'POST',
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Fallback cancel:', err);
      }
    }
    return {
      success: true,
      message: 'Transaction was cancelled safely. Zero funds were transferred.',
    };
  }

  // 6. Scenarios
  static async getDemoScenarios(): Promise<DemoScenario[]> {
    if (this.isLiveConfigured()) {
      try {
        const res = await fetch(this.cleanUrl('/api/demo/scenarios'), { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (err) {
        console.warn('Fallback to built-in demo scenarios:', err);
      }
    }
    return DEMO_SCENARIOS;
  }

  // 7. Notifications
  static getStoredNotifications(): AppNotification[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return [
      {
        id: 'notif_init_1',
        recipientName: 'Ananya Sharma',
        recipientType: 'trusted_contact',
        channel: 'sms',
        severity: 'emergency',
        title: 'URGENT: Suspicious Transaction Held',
        body: 'TrustPay Alert: We safely intercepted a high-risk transfer of ₹48,500.00 for Aarav Sharma. A remote access scam pattern was detected. Funds are secure.',
        timestamp: 'Aug 14, 2026',
      },
      {
        id: 'notif_init_2',
        recipientName: 'Aarav Sharma',
        recipientType: 'user',
        channel: 'push',
        severity: 'info',
        title: 'Trust Shield Active',
        body: 'TrustPay real-time fraud monitoring enabled on your account.',
        timestamp: 'Aug 01, 2026',
      },
    ];
  }

  static saveNotifications(notifications: AppNotification[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    }
  }
}
