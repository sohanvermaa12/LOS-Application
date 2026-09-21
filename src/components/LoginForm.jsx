"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import loginImage from "../public/asset/login page12.png";
import { login } from "../services/login";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      window.localStorage.setItem("authData", JSON.stringify(response.data));
      window.location.assign("/dashboard");
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="login-page"
      style={{
        width: "100%",
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        overflow: "hidden",
        background: "#f5f7fa",
      }}
    >
      {/* LEFT SIDE - IMAGE ONLY */}
      <div
        className="login-image-panel"
        style={{
          width: "calc(50% - 40px)",
          height: "calc(100vh - 40px)",
          margin: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
     <img
  src={loginImage.src}
  alt="Login"
  style={{
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "contain",
    objectPosition: "center",
  
  }}
/>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="login-form-panel"
        style={{
          width: "50%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          overflow: "auto",
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="login-form-content"
          style={{
            width: "min(468px, calc(100% - 80px))",
          }}
        >
          {/* HEADING */}
          <div
            style={{
              marginBottom: "38px",
            }}
          >
            <h2
              style={{
                margin: "0",
                color: "#202938",
                fontSize: "30px",
                fontWeight: "700",
                lineHeight: "1.2",
              }}
            >
              Welcome Back
            </h2>

            <p
              style={{
                margin: "2px 0 0",
                color: "#263244",
                fontSize: "15px",
                lineHeight: "1.5",
              }}
            >
              Login to your account to continue
              <br />
              with your loan application.
            </p>
          </div>

          {/* USERNAME / EMAIL */}
          <label
            style={{
              display: "block",
              marginBottom: "38px",
              color: "#111827",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Username / Email

            <div
              style={{
                height: "59px",
                marginTop: "9px",
                display: "flex",
                alignItems: "center",
                padding: "0 15px",
                boxSizing: "border-box",
                border: "1px solid #ccd3dd",
                borderRadius: "10px",
                background: "#ffffff",
              }}
            >
              <UserRound
                size={19}
                color="#727d8f"
              />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your username or email"
                required
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  outline: "none",
                  padding: "0 13px",
                  background: "transparent",
                  fontSize: "14px",
                  color: "#202938",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </label>

          {/* PASSWORD */}
          <label
            style={{
              display: "block",
              marginBottom: "27px",
              color: "#111827",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Password

            <div
              style={{
                height: "59px",
                marginTop: "9px",
                display: "flex",
                alignItems: "center",
                padding: "0 15px",
                boxSizing: "border-box",
                border: "1px solid #ccd3dd",
                borderRadius: "10px",
                background: "#ffffff",
              }}
            >
              <LockKeyhole
                size={19}
                color="#727d8f"
              />

=======
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="allianza-auth-page">
      <div className="auth-visual-panel" aria-label="Login image panel" />

      <div className="auth-login-panel">
        <div className="login-box">
          <h2>Welcome Back</h2>
          <p className="login-subtext">
            Login in to your account to continue
            <br />
            with your loan application.
          </p>

          <form className="login-form">
            <label className="field-label" htmlFor="username">
              Username / Email
            </label>
            <div className="input-with-icon">
              <Mail size={18} />
>>>>>>> fa76eb3 (s)
              <input
                id="username"
                type="email"
                placeholder="Enter your username or email"
              />
            </div>

            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon password-input">
              <Lock size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
<<<<<<< HEAD
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  outline: "none",
                  padding: "0 13px",
                  background: "transparent",
                  fontSize: "14px",
                  color: "#202938",
                  boxSizing: "border-box",
                }}
=======
                placeholder="Enter your password"
>>>>>>> fa76eb3 (s)
              />

              <button
                type="button"
<<<<<<< HEAD
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#707b8d",
                }}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </label>

          {/* REMEMBER + FORGOT */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "35px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "400",
                color: "#151b26",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                style={{
                  width: "19px",
                  height: "19px",
                  margin: "0",
                  accentColor: "#2864e6",
                }}
              />

              <span>Remember me</span>
            </label>

            <button
              type="button"
              style={{
                border: "none",
                background: "transparent",
                color: "#2864e6",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Forgot Password?
=======
                className="toggle-password"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="login-actions">
              <label className="remember-me">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-password">
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="login-submit-btn">
              Login
>>>>>>> fa76eb3 (s)
            </button>
          </form>

          <div className="divider-row">
            <span />
            <small>OR</small>
            <span />
          </div>

<<<<<<< HEAD
          {error && (
            <p
              role="alert"
              style={{
                margin: "-10px 0 20px",
                color: "#c62828",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: "63px",
              border: "none",
              borderRadius: "9px",
              background: "#2864e6",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: isSubmitting ? "wait" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          {/* OR */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginTop: "34px",
            }}
          >
            <span
              style={{
                height: "1px",
                flex: "1",
                background: "#d2d7df",
              }}
            />

            <p
              style={{
                margin: "0",
                color: "#687386",
                fontSize: "14px",
              }}
            >
              OR
            </p>

            <span
              style={{
                height: "1px",
                flex: "1",
                background: "#d2d7df",
              }}
            />
          </div>

          {/* CONTACT */}
          <button
            type="button"
            style={{
              display: "block",
              margin: "23px auto 0",
              border: "none",
              background: "transparent",
              color: "#2864e6",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Contact Us
          </button>
        </form>
=======
          <button type="button" className="contact-btn">
            Contact Us
          </button>
        </div>
>>>>>>> fa76eb3 (s)
      </div>
    </div>
  );
}