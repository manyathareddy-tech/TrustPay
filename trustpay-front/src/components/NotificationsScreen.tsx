import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  Smartphone,
  PhoneCall,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  Sparkles,
  Send,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';

export const NotificationsScreen: React.FC = () => {
  const { currentUser, notifications, setCurrentScreen } = useApp();
  const [filter, setFilter] = useState<'all' | 'trusted_contact' | 'user'>('all');

  const filtered = notifications.filter(notif => {
    if (filter === 'trusted_contact') return notif.recipientType === 'trusted_contact';
    if (filter === 'user') return notif.recipientType === 'user';
    return true;
  });

  const trustedContactName = currentUser?.trustedContact.name || 'Ananya Sharma';
  const trustedContactPhone = currentUser?.trustedContact.phone || '+91 98765 43210';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Simulated Notification Dispatch
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
              Simulated for Demo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live preview of SMS alerts sent to your designated trusted contact ({trustedContactName}) and push notifications sent to your phone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen('demo_panel')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ← Back to Scenarios
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex bg-slate-100 rounded-xl p-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            All Dispatches ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('trusted_contact')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'trusted_contact' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
            <span>Trusted Contact SMS</span>
          </button>
          <button
            onClick={() => setFilter('user')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'user' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>User Push Alerts</span>
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Target phone: <code className="font-mono text-slate-700 font-semibold">{trustedContactPhone}</code>
        </span>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No notifications in this filter</p>
            <p className="text-xs text-slate-400 mt-1">
              Trigger "Simran's Scam" from the Demo Control Panel to view real-time emergency alerts.
            </p>
          </div>
        ) : (
          filtered.map((notif: AppNotification) => {
            const isEmergency = notif.severity === 'emergency';
            const isTrustedContact = notif.recipientType === 'trusted_contact';

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-xs ${
                  isEmergency
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isEmergency
                          ? 'bg-rose-100 text-rose-600'
                          : isTrustedContact
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isEmergency ? (
                        <AlertOctagon className="w-5 h-5" />
                      ) : isTrustedContact ? (
                        <PhoneCall className="w-5 h-5" />
                      ) : (
                        <Smartphone className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          {isTrustedContact ? `SMS to Trusted Contact (${notif.recipientName})` : 'Push to User Device'}
                        </span>
                        {isEmergency && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-rose-600 text-white">
                            High Priority Alert
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {notif.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {notif.timestamp}
                  </span>
                </div>

                {/* Message Body Styled like a Mobile SMS preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-sans leading-relaxed">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                    <span>Carrier Message (SMS Gateway #8829)</span>
                  </div>
                  <p>{notif.body}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer Info Box */}
      <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
        <span>
          <strong>Why this matters for judges:</strong> In traditional banking apps, fraud victims are isolated under active coercion. TrustPay automatically breaks isolation by pulling a designated advocate into the loop before funds transfer.
        </span>
      </div>
    </div>
  );
};
