import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { signInWithPopup, signOut, signInWithCustomToken } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true,
      });
      setUser(response.data);
      setLoading(false);
      return true;
    } catch (error) {
      setUser(null);
      setLoading(false);
      return false;
    }
  }, []);

  const login = useCallback(async () => {
    try {
      // 1. Google Sign-In popup via Firebase Auth
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // 2. Exchange Firebase ID token for our session cookie
      const response = await axios.post(
        `${API}/auth/session`,
        { id_token: idToken },
        { withCredentials: true }
      );

      const userData = response.data.user;
      setUser(userData);

      // 3. Redirect based on onboarding status
      if (userData.onboarding_completed) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const loginWithLinkedIn = useCallback(async (customToken) => {
    try {
      // 1. Sign into Firebase using the custom token minted by our backend
      await signInWithCustomToken(auth, customToken);

      // 2. We need the standard Firebase ID token to establish our app session cookie
      const idToken = await auth.currentUser.getIdToken();

      // 3. Exchange Firebase ID token for our session cookie (same as Google flow)
      const response = await axios.post(
        `${API}/auth/session`,
        { id_token: idToken },
        { withCredentials: true }
      );

      const userData = response.data.user;
      setUser(userData);

      // 4. Redirect based on onboarding status
      if (userData.onboarding_completed) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (error) {
      console.error("LinkedIn Custom Token Login error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase signOut error:", error);
    }
    setUser(null);
    window.location.href = "/";
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithLinkedIn,
        logout,
        checkAuth,
        updateUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
