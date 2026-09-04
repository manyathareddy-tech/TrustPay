export type RiskBand = 
  | 'trusted' 
  | 'slightly_suspicious' 
  | 'suspicious' 
  | 'emergency' 
  | 'review_pending';

export type InterfaceVariant = 
  | 'normal' 
  | 'normal_with_extra' 
  | 'simplified' 
  | 'emergency' 
  | 'review_pending';

export interface TrustedContact {
  name: string;
  phone: string;
  relationship?: string;
  notifyOnHighRisk?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  balance: number;
  averageTrustScore: number;
  trustedContact: TrustedContact;
  avatarUrl?: string;
}

export interface TransactionSignals {
  screenSharingActive: boolean;
  unusualTimeOfDay: boolean;
  newRecipient: boolean;
  highVelocity: boolean;
  geoAnomaly: boolean;
  rapidAmountEscalation: boolean;
  deviceBiometricBypass?: boolean;
}

export interface AppNotification {
  id: string;
  recipientName: string;
  recipientType: 'user' | 'trusted_contact';
  channel: 'sms' | 'push' | 'email';
  title: string;
  body: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'emergency';
  transactionId?: string;
  read?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  recipient: string;
  recipientAccount?: string;
  note?: string;
  timestamp: string;
  trustScore: number; // 0 - 100
  riskBand: RiskBand;
  interface: InterfaceVariant;
  status: 'pending' | 'completed' | 'blocked' | 'cancelled' | 'verified';
  signals?: TransactionSignals;
  layer7Warnings?: string[];
  naturalLanguageSummary?: string;
  trustedContactNotified?: boolean;
  trustedContact?: TrustedContact;
  notifications?: AppNotification[];
}

export interface DemoScenario {
  id: string;
  name: string;
  tagline: string;
  description: string;
  expectedInterface: InterfaceVariant;
  riskBand: RiskBand;
  trustScore: number;
  recipient: string;
  amount: number;
  signals: TransactionSignals;
  naturalLanguageSummary: string;
  layer7Warnings: string[];
}
