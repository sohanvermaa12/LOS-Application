"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { requestPasswordReset } from "../services/forget_password";

export default function ForgotPasswordRequest({ onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({ email });
      setResult(response.data);
    } catch (requestError) {
      setError(requestError.message || "Unable to send the password reset request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
        {result ? (
          <div>
            <h2 style={{ margin: "0 0 10px", color: "#202938", fontSize: "24px" }}>
              Check your email
            </h2>
            <p style={{ margin: "0 0 20px", color: "#4b5563", lineHeight: "1.5" }}>
              {result.message || "A password reset link has been sent to your email address."}
            </p>
            {result.expiresInSeconds && (
              <p style={{ margin: "0 0 22px", color: "#687386", fontSize: "14px" }}>
                This link expires in {Math.floor(result.expiresInSeconds / 60)} minutes.
              </p>
            )}
            <button
              type="button"
              onClick={onBack}
              style={{
                width: "100%",
                height: "48px",
                border: "none",
                borderRadius: "8px",
                background: "#2864e6",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Back to login
            </button>
          </div>
        ) : (
          <div>
            <label style={{ display: "block", color: "#111827", fontSize: "14px", fontWeight: "600" }}>
              Email address
              <div style={{ height: "52px", marginTop: "8px", display: "flex", alignItems: "center", padding: "0 14px", border: "1px solid #ccd3dd", borderRadius: "8px", background: "#ffffff" }}>
                <Mail size={18} color="#727d8f" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSubmit(event);
                  }}
                  placeholder="Enter your email address"
                  autoFocus
                  required
                  style={{ width: "100%", height: "100%", border: "none", outline: "none", padding: "0 12px", background: "transparent", fontSize: "14px", color: "#202938", boxSizing: "border-box" }}
                />
              </div>
            </label>
            {error && <p role="alert" style={{ margin: "14px 0 0", color: "#c62828", fontSize: "14px" }}>{error}</p>}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ width: "100%", height: "48px", marginTop: "24px", border: "none", borderRadius: "8px", background: "#2864e6", color: "#ffffff", fontSize: "15px", fontWeight: "600", cursor: isSubmitting ? "wait" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{
                display: "block",
                margin: "18px auto 0",
                border: "none",
                background: "transparent",
                color: "#2864e6",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </div>
        )}
    </div>
  );
}
