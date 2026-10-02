import React from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { AnalyticsModal } from './components/AnalyticsModal';

function AppContent() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <ChatView />
        <AnalyticsModal />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
