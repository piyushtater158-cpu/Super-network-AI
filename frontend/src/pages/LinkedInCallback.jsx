import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LinkedInCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithLinkedIn } = useAuth();
    const [error, setError] = useState(null);
    const authAttempted = useRef(false);

    useEffect(() => {
        if (authAttempted.current) return;

        const code = searchParams.get("code");

        // The Redirect URI must EXACTLY match what we set in LinkedIn Dev Portal 
        // AND what we send to the backend for the token exchange.
        const redirectUri = `${window.location.origin}/auth/linkedin/callback`;

        if (!code) {
            setError("No authorization code found from LinkedIn.");
            return;
        }

        authAttempted.current = true;

        const processLogin = async () => {
            try {
                // Exchange code for Custom Firebase Token from our backend
                const response = await axios.post(`${API}/auth/linkedin`, {
                    code,
                    redirect_uri: redirectUri
                });

                const { custom_token } = response.data;

                if (!custom_token) {
                    throw new Error("No custom token received from backend");
                }

                // Use AuthContext to sign into Firebase using the custom token
                await loginWithLinkedIn(custom_token);

                // loginWithLinkedIn will handle the routing from here based on onboarding status
            } catch (err) {
                console.error("LinkedIn Auth Exchange Error:", err);
                setError("Authentication failed. Please try again.");
                setTimeout(() => navigate('/login'), 4000);
            }
        };

        processLogin();
    }, [searchParams, navigate, loginWithLinkedIn]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6">
                {error ? (
                    <div className="text-red-400 bg-red-400/10 p-6 rounded-xl border border-red-500/20 max-w-md">
                        <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
                        <p>{error}</p>
                        <p className="text-sm mt-4 text-slate-400">Redirecting you back to login...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="text-violet-500 animate-spin" />
                        <h2 className="text-2xl font-bold text-white">Connecting to LinkedIn...</h2>
                        <p className="text-slate-400">Please wait while we securely set up your session.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkedInCallback;
