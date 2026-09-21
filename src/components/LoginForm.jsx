"use client";

import { useState } from "react";
import {
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import loginImage from "../public/asset/login page12.png";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

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
        <div
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
                placeholder="Enter your username or email"
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
                placeholder="Enter your password"
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

          {/* LOGIN BUTTON */}
          <button
            onClick={() =>
              window.location.assign("/dashboard")
            }
            style={{
              width: "100%",
              height: "63px",
              border: "none",
              borderRadius: "9px",
              background: "#2864e6",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Login
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
        </div>
      </div>
    </div>
  );
}