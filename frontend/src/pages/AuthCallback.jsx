import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);

        if (!sessionIdMatch) {
          console.error("No session_id found in URL");
          navigate("/", { replace: true });
          return;
        }

        const sessionId = sessionIdMatch[1];

        // Exchange session_id for session_token
        const response = await axios.post(
          `${API}/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const userData = response.data.user;
        setUser(userData);

        // Clear the hash from URL
        window.history.replaceState(null, "", window.location.pathname);

        // Redirect based on onboarding status
        if (userData.onboarding_completed) {
          navigate("/dashboard", { replace: true, state: { user: userData } });
        } else {
          navigate("/onboarding", { replace: true, state: { user: userData } });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/", { replace: true });
      }
    };

    processAuth();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-[hsl(240_10%_2%)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[hsl(250_100%_70%)] border-t-transparent animate-spin" />
        <p className="text-slate-400 font-medium">Authenticating...</p>
      </div>
    </div>
  );
}
