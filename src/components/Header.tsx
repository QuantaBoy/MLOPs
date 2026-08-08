import React, { useState } from 'react';
import type { UserRole, AppNotification } from '../types';
import { Cpu, Bell, LifeBuoy, Sparkles, Check, Search, ChevronDown, ListFilter, Activity } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  activeModelVersion: string;
  macroF1: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  notifications,
  onMarkNotificationRead,
  activeModelVersion,
  macroF1
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: { role: UserRole; label: string; icon: React.ElementType; badge: string }[] = [
    { role: 'customer', label: 'Customer Portal', icon: LifeBuoy, badge: 'Submit Ticket' },
    { role: 'agent', label: 'Priority Queue', icon: ListFilter, badge: 'Agent Triage' },
    { role: 'admin', label: 'MLOps Control', icon: Activity, badge: 'Analytics' },
    { role: 'mlops', label: 'MLOps Engineer', icon: Cpu, badge: 'Retrain Pipeline' }
  ];

  const currentRoleObj = roles.find((r) => r.role === currentRole) || roles[1];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Brand & Model Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onRoleChange('agent')}>
              <div className="p-2 rounded-lg bg-teal-600 shadow-sm text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">SmartSupport</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">MLOps</span>
                </div>
              </div>
            </div>

            {/* Active Model Status Badge (Executive Pill) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Model: <strong className="font-mono text-teal-900">{activeModelVersion}</strong> (Live)</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-teal-700 font-bold">F1: {macroF1.toFixed(3)}</span>
            </div>
          </div>

          {/* Center Navigation Segmented Control */}
          <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => onRoleChange('customer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'customer'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>

            <button
              onClick={() => onRoleChange('agent')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'agent'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Priority Queue</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">12</span>
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'admin' || currentRole === 'mlops'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>MLOps Control Center</span>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Global Search Bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs w-48">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs w-full"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-mono text-slate-500">Ctrl+K</kbd>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-600" />
                      Realtime Priority Alerts
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">{unreadCount} unread</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-slate-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors flex items-start justify-between gap-3 ${
                            n.read ? 'bg-white text-slate-500' : 'bg-teal-50/50 text-slate-800 font-medium'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${n.priority === 'critical' ? 'bg-red-600' : 'bg-orange-600'}`} />
                              {n.ticket_title}
                            </div>
                            <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                            <span className="mt-1 inline-block text-[10px] text-slate-400 font-mono">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!n.read && (
                            <button
                              onClick={() => onMarkNotificationRead(n.id)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-teal-600"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 p-1 pr-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                  SC
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <div className="text-xs font-semibold text-slate-900">Sarah Connor</div>
                  <div className="text-[10px] text-slate-500 font-medium">{currentRoleObj.label}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl z-50 py-1 divide-y divide-slate-100 animate-fadeIn">
                  <div className="px-3 py-2 bg-slate-50">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Switch Persona View</p>
                  </div>
                  <div className="py-1">
                    {roles.map((r) => {
                      const Icon = r.icon;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            onRoleChange(r.role);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                            currentRole === r.role
                              ? 'bg-teal-50 text-teal-800 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-slate-500" />
                            <span>{r.label}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{r.badge}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
