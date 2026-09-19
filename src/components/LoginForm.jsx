"use client";

import { useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import Brand from "./Brand";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="login-shell">
      <Brand />
      <div className="login-layout">
        <div className="login-story">
          <div className="eyebrow">RETAIL CREDIT OPERATIONS</div>
          <h1>
            Move every
            <br />
            <em>decision</em> forward.
          </h1>
          <p>
            A focused workspace for faster, clearer lending decisions from
            application to approval.
          </p>
          <div className="login-stat">
            <strong>98.4%</strong>
            <span>
              platform availability
              <br />
              across your branches
            </span>
          </div>
        </div>
        <div className="login-card">
          <div className="eyebrow">WELCOME BACK</div>
          <h2>Sign in to Northstar</h2>
          <p className="login-copy">Use your work credentials to continue.</p>
          <label>
            Work email
            <input type="email" defaultValue="aditya.sharma@northstar.in" />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                defaultValue="northstar123"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <div className="login-options">
            <label className="check-label">
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <button className="forgot-link" type="button">
              Forgot password?
            </button>
          </div>
          <button
            className="primary-button login-button"
            onClick={() => window.location.assign("/dashboard")}
          >
            Sign in <ArrowUpRight size={16} />
          </button>
          <div className="demo-note">
            <ShieldCheck size={15} /> Demo mode · API authentication boundary is
            ready to connect
          </div>
        </div>
      </div>
      <div className="login-footer">
        Northstar LOS <span>·</span> Secure workspace <span>·</span> v0.1 MVP
      </div>
    </div>
  );
}
