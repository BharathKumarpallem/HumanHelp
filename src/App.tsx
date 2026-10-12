import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { BookingModal } from './components/BookingModal';
import { ProviderProfile } from './types';

// Pages
import { HomePage } from './pages/HomePage';
import { ExploreServicesPage } from './pages/ExploreServicesPage';
import { ProviderProfilePage } from './pages/ProviderProfilePage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { MessagesPage } from './pages/MessagesPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AuthPage } from './pages/AuthPage';

export function App() {
  const [activeBookingProvider, setActiveBookingProvider] = useState<ProviderProfile | null>(null);

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExploreServicesPage />} />
              <Route path="/provider/:id" element={<ProviderProfilePage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/safety" element={<SafetyCenterPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/provider/dashboard" element={<ProviderDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </main>

          <Footer />

          {/* Floating AI Assistant Widget accessible across all pages */}
          <AIAssistantWidget 
            onSelectProviderForBooking={(provider) => setActiveBookingProvider(provider)} 
          />

          {/* Global Booking Modal if launched by AI widget or actions */}
          {activeBookingProvider && (
            <BookingModal
              provider={activeBookingProvider}
              onClose={() => setActiveBookingProvider(null)}
              onSuccess={() => {}}
            />
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
