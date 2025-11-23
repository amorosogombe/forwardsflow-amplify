import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';

import LandingPage from './components/LandingPage';
import BankDashboard from './components/BankDashboard';
import InvestorDashboard from './components/InvestorDashboard';
import BorrowerDashboard from './components/BorrowerDashboard';
import AdminDashboard from './components/AdminDashboard';

Amplify.configure(awsExports);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route
          path="/bank/*"
          element={
            <Authenticator>
              {({ signOut, user }) => (
                <BankDashboard user={user} signOut={signOut} />
              )}
            </Authenticator>
          }
        />
        
        <Route
          path="/investor/*"
          element={
            <Authenticator>
              {({ signOut, user }) => (
                <InvestorDashboard user={user} signOut={signOut} />
              )}
            </Authenticator>
          }
        />
        
        <Route
          path="/borrower/*"
          element={
            <Authenticator>
              {({ signOut, user }) => (
                <BorrowerDashboard user={user} signOut={signOut} />
              )}
            </Authenticator>
          }
        />
        
        <Route
          path="/admin/*"
          element={
            <Authenticator>
              {({ signOut, user }) => (
                <AdminDashboard user={user} signOut={signOut} />
              )}
            </Authenticator>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
