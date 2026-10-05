import { useState } from "react";
import { loginStaff } from "../services/api";
import "../styles/pages/login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const staff = await loginStaff(username, password);
      setPassword("");
      setShowPassword(false);
      await onLogin(staff);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* LEFT: BRANDING */}
      <section className="login-brand-panel">
        <div className="login-brand-header">
          <div className="login-logo-box">
            <img
              src="/WINCORE.svg"
              alt="Wincore Enterprises"
              className="login-logo"
            />
          </div>

          <div className="login-brand-name">
            <h2>Wincore</h2>
            <span>ENTERPRISES</span>
          </div>
        </div>

        <div className="login-brand-content">
          <span className="login-brand-eyebrow">REPAIR MANAGEMENT SYSTEM</span>

          <h1>
            Service.
            <br />
            <span>Organized.</span>
          </h1>

          <p>
            A streamlined workspace for managing gadget repairs and customer
            service.
          </p>

          <div className="login-brand-decoration">
            <span />
            <span />
            <span />
          </div>
        </div>

        <p className="login-brand-footer">WINCORE ENTERPRISES · STAFF ACCESS</p>
      </section>

      {/* RIGHT: LOGIN */}
      <section className="login-form-panel">
        <div className="login-top-link">
          <a href="/track" target="_blank" rel="noopener noreferrer">
            Customer Tracking
            <span aria-hidden="true"> ↗</span>
          </a>
        </div>

        <div className="login-form-wrapper">
          <h1>
            Welcome <span>back.</span>
          </h1>

          <p className="login-form-subtitle">
            Enter your credentials to access your workspace.
          </p>

          <form className="login-card" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <div className="login-field">
              <label htmlFor="username">Username</label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <div className="login-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  aria-controls="password"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c5.5 0 9.5 7 9.5 7a15 15 0 0 1-3.1 3.8" />
                      <path d="M6.4 6.4C3.8 8 2.5 12 2.5 12s4 7 9.5 7c1.6 0 3-.4 4.3-1.2" />
                      <path d="M10 10a2.8 2.8 0 0 0 4 4" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="login-access-note">Authorized staff access only.</p>
        </div>

        <div className="login-bottom">
          <span>WINCORE ENTERPRISES</span>
          <span>REPAIR MANAGEMENT</span>
        </div>
      </section>
    </main>
  );
}

export default Login;
