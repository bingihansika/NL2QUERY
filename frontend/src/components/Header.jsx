import React from 'react';
import { Database, Plus, Sparkles, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header = () => {
  const { handleNewChat, setIsAnalyticsOpen } = useApp();

  return (
    <header className="top-header">
      <div className="header-brand">
        <div className="sidebar-logo-icon">
          <Database size={20} />
        </div>
        <div>
          <div className="header-brand-title">NL2QUERY</div>
          <div className="sidebar-subtitle">QUERY ENGINE</div>
        </div>
      </div>

      <div className="header-actions">
        <button className="btn-header-action" title="Toggle Theme">
          <Moon size={16} />
        </button>
        
        <button className="btn-header-action" onClick={handleNewChat}>
          <Plus size={16} />
          New Chat
        </button>

        <button className="btn-header-action btn-sparkle" onClick={() => setIsAnalyticsOpen(true)}>
          <Sparkles size={16} />
          Data Analytics
        </button>
      </div>
    </header>
  );
};
