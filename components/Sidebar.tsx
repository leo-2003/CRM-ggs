import React from 'react';
import { DashboardIcon, UsersIcon, SettingsIcon } from './Icons';

type View = 'dashboard' | 'realtors' | 'settings';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userName }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'realtors', label: 'Realtors CRM', icon: UsersIcon },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ];

  return (
    <nav className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="flex items-center justify-center p-6 border-b border-slate-800">
        <span className="text-xl font-bold text-white">{userName}</span>
      </div>
      <ul className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setView(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                currentView === item.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Agencia GGS</p>
        <p>Version 2.0.0</p>
      </div>
    </nav>
  );
};

export default Sidebar;