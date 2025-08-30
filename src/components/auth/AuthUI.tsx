import React, { useState } from "react";
import {
  signInWithGoogle,
  signInWithFacebook,
  signUpWithEmail,
  signInWithEmail,
  logout,
} from "../../firebase/auth";
import { useAuth } from "./AuthContext";

// Use AlertContext for welcome and logout confirmation
import { useAlert } from "@components/common/AlertContext";

export const AuthUI: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      showAlert({
        message: `Welcome, ${user?.displayName || user?.email || "user"}!`,
        type: "success",
        duration: 4000,
      });
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebook = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithFacebook();
      showAlert({
        message: `Welcome, ${user?.displayName || user?.email || "user"}!`,
        type: "success",
        duration: 4000,
      });
    } catch (err: any) {
      setError(err.message || "Facebook sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
        showAlert({
          message: `Welcome, ${email}!`,
          type: "success",
          duration: 4000,
        });
      } else {
        await signInWithEmail(email, password);
        showAlert({
          message: `Welcome back, ${email}!`,
          type: "success",
          duration: 4000,
        });
      }
    } catch (err: any) {
      setError(err.message || "Email authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    showAlert({
      message: "You have been logged out.",
      type: "info",
      duration: 3000,
    });
    await logout();
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">
          Logged in as {user.email || user.displayName}
        </span>
        <button
          className="px-2 py-1 bg-red-600 text-white rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-start">
      <button
        className="px-2 py-1 bg-blue-600 text-white rounded w-full"
        onClick={handleGoogle}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>
      <button
        className="px-2 py-1 bg-blue-800 text-white rounded w-full"
        onClick={handleFacebook}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in with Facebook"}
      </button>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleEmail}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-2 py-1 rounded"
          disabled={loading}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-2 py-1 rounded"
          disabled={loading}
          required
        />
        <button
          className="px-2 py-1 bg-green-600 text-white rounded"
          type="submit"
          disabled={loading}
        >
          {mode === "signup" ? "Sign Up" : "Login"}
        </button>
        <button
          type="button"
          className="text-xs underline"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          disabled={loading}
        >
          {mode === "signup"
            ? "Already have an account? Login"
            : "No account? Sign up"}
        </button>
      </form>
      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default AuthUI;
