import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

// Pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import IkigaiOnboarding from "./pages/IkigaiOnboarding";
import Profile from "./pages/Profile";
import PeopleSearch from "./pages/PeopleSearch";
import OpportunityDetails from "./pages/OpportunityDetails";
import CreateOpportunity from "./pages/CreateOpportunity";
import Messaging from "./pages/Messaging";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import LinkedInCallback from "./pages/LinkedInCallback";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext";

import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading, checkAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // If user already set from login, skip check
    if (location.state?.user) {
      setChecked(true);
      return;
    }

    const verify = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        navigate("/", { replace: true });
      }
      setChecked(true);
    };

    verify();
  }, [checkAuth, navigate, location.state]);

  if (loading || !checked) {
    return (
      <div className="min-h-screen bg-[hsl(240_10%_2%)] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full border-4 border-[hsl(250_100%_70%)] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!user && checked) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Onboarding Check - redirect to onboarding if not completed
const OnboardingCheck = ({ children }) => {
  const { user } = useAuth();

  if (user && !user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardingCheck>
              <Dashboard />
            </OnboardingCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <IkigaiOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <OnboardingCheck>
              <Profile />
            </OnboardingCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <OnboardingCheck>
              <PeopleSearch />
            </OnboardingCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/opportunity/:opportunityId"
        element={
          <ProtectedRoute>
            <OnboardingCheck>
              <OpportunityDetails />
            </OnboardingCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-opportunity"
        element={
          <ProtectedRoute>
            <OnboardingCheck>
              <CreateOpportunity />
            </OnboardingCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <OnboardingCheck>
              <Messaging />
            </OnboardingCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <OnboardingCheck>
              <Leaderboard />
            </OnboardingCheck>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <OnboardingCheck>
              <Settings />
            </OnboardingCheck>
          </ProtectedRoute>
        }
      />
      <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
