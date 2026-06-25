import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function AuthPage() {
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">₣</div>
          <h1 className="auth-title">Finance Tracker</h1>
          <p className="auth-subtitle">
            {isLogin ? "Welcome back" : "Take control of your money"}
          </p>
        </div>

        <div className="auth-form">
          {!isLogin && (
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Gai Garang"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="auth-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Log In" : "Create Account"}
          </button>
        </div>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;