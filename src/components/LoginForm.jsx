"use client";

import { useRef, useState } from "react";
import {
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import loginImage from "../public/asset/login page12.png";
import { login, verifyOtp } from "../services/login";
import ForgotPasswordRequest from "./ForgotPasswordRequest";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [tempSessionToken, setTempSessionToken] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otp, setOtp] = useState("");
  const otpInputRefs = useRef([]);

  function updateOtpFromPaste(pastedValue, startIndex = 0) {
    const pastedDigits = pastedValue.replace(/\D/g, "");
    const targetIndex = pastedDigits.length >= 6 ? 0 : startIndex;
    const digits = pastedDigits.slice(0, 6 - targetIndex);
    const nextOtp = otp.padEnd(6, " ").split("");

    digits.split("").forEach((digit, offset) => {
      nextOtp[targetIndex + offset] = digit;
    });

    setOtp(nextOtp.join(""));
    otpInputRefs.current[Math.min(targetIndex + digits.length, 5)]?.focus();
  }

  function handleOtpChange(event, index) {
    const digits = event.target.value.replace(/\D/g, "");

    if (digits.length > 1) {
      updateOtpFromPaste(digits, index);
      return;
    }

    const nextOtp = otp.padEnd(6, " ").split("");
    nextOtp[index] = digits || " ";
    setOtp(nextOtp.join(""));

    if (digits && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(event, index) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (otpStep) {
        const response = await verifyOtp({ tempSessionToken, otp: otp.replace(/\D/g, "") });
        window.localStorage.setItem("authData", JSON.stringify(response.data));
      } else {
        const response = await login({ email, password });
        if (response.data?.otpRequired) {
          if (!response.data.tempSessionToken) {
            throw new Error("The login response did not include a temporary session token");
          }

          setTempSessionToken(response.data.tempSessionToken);
          setDevOtp(response.data.devOtp || "");
          setOtpStep(true);
          return;
        }

        window.localStorage.setItem("authData", JSON.stringify(response.data));
      }

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
                {showForgotPassword
                  ? "Forgot Password?"
                  : otpStep
                    ? "Verify your identity"
                    : "Welcome Back"}
            </h2>

            <p
              style={{
                margin: "2px 0 0",
                color: "#263244",
                fontSize: "15px",
                lineHeight: "1.5",
              }}
            >
              {showForgotPassword
                ? "Enter your email address and we will send you a password reset link."
                  : otpStep
                    ? `Enter the OTP to continue${email ? `, ${email}` : ""}.`
                    : "Login to your account to continue with your loan application."}
            </p>
          </div>

          {showForgotPassword ? (
            <ForgotPasswordRequest onBack={() => setShowForgotPassword(false)} />
            ) : otpStep ? (
              <>
                <div
                  style={{
                    marginBottom: "24px",
                    color: "#111827",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <span id="otp-label">One-time password</span>
                  <div className="otp-inputs" role="group" aria-labelledby="otp-label">
                    {Array.from({ length: 6 }, (_, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          otpInputRefs.current[index] = element;
                        }}
                        className="otp-input"
                        type="text"
                        value={otp[index]?.trim() || ""}
                        onChange={(event) => handleOtpChange(event, index)}
                        onKeyDown={(event) => handleOtpKeyDown(event, index)}
                        onPaste={(event) => {
                          event.preventDefault();
                          updateOtpFromPaste(event.clipboardData.getData("text"), index);
                        }}
                        aria-label={`OTP digit ${index + 1}`}
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={6}
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        required
                      />
                    ))}
                  </div>
                </div>

                {devOtp && (
                  <p
                    style={{
                      margin: "0 0 20px",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: "#eef4ff",
                      color: "#202938",
                      fontSize: "14px",
                    }}
                  >
                    Development OTP: <strong>{devOtp}</strong>
                  </p>
                )}

                {error && (
                  <p
                    role="alert"
                    style={{
                      margin: "0 0 20px",
                      color: "#c62828",
                      fontSize: "14px",
                    }}
                  >
                    {error}
                  </p>
                )}

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
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setTempSessionToken("");
                    setDevOtp("");
                    setOtp("");
                    setError("");
                  }}
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
                  Back to login
                </button>
              </>
          ) : (
            <>
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

              <input
                type={showPassword ? "text" : "password"}
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
              />

              <button
                type="button"
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
              onClick={() => setShowForgotPassword(true)}
              style={{
                border: "none",
                background: "transparent",
                color: "#2864e6",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Forgot Password?
            </button>
          </div>

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
            </>
          )}

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
      </div>

    </div>
  );
}