"use client";
import { useEffect, useState } from "react";

/* =========================
   Mode config
========================= */

const MODE_CONFIG = {
  create: {
    title: "Lookup Type Management",
    subtitle: "Create a new lookup type",
    submitLabel: "Submit",
  },
  edit: {
    title: "Lookup Type Management",
    subtitle: "Update lookup type details",
    submitLabel: "Update",
  },
  view: {
    title: "Lookup Type Management",
    subtitle: "View lookup type details",
    submitLabel: null,
  },
};

/* =========================
   Inline Styles
========================= */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23, 32, 51, 0.4)",
    padding: "24px 16px",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    boxSizing: "border-box",
  },

  modal: {
    position: "relative",
    width: "100%",
    maxWidth: "620px",
    maxHeight: "100%",
    overflowY: "auto",
    borderRadius: "16px",
    border: "1px solid #E2E6EE",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 20px 50px rgba(23, 32, 51, 0.16)",
  },

  header: {
    display: "flex",
    minHeight: "64px",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #E2E6EE",
    backgroundColor: "#FFFFFF",
    padding: "16px 24px",
    boxSizing: "border-box",
  },

  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "24px",
    color: "#172033",
  },

  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "#667085",
  },

  closeButton: {
    display: "flex",
    height: "36px",
    width: "36px",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "transparent",
    fontSize: "20px",
    lineHeight: 1,
    color: "#667085",
    cursor: "pointer",
    transition: "all 150ms ease",
    outline: "none",
  },

  closeButtonHover: {
    backgroundColor: "#F7F9FC",
    color: "#172033",
  },

  closeButtonFocus: {
    boxShadow: "0 0 0 2px rgba(33, 59, 122, 0.2)",
  },

  body: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "24px 28px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "#667085",
  },

  field: {
    fontFamily: "inherit",
    height: "44px",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#E2E6EE",
    backgroundColor: "#FFFFFF",
    padding: "0 12px",
    fontSize: "14px",
    color: "#172033",
    outline: "none",
    transition: "all 150ms ease",
  },

  fieldViewMode: {
    backgroundColor: "#F7F9FC",
    color: "#172033",
    cursor: "default",
  },

  fieldHover: {
    borderColor: "#C8CED9",
  },

  fieldFocus: {
    borderColor: "#213B7A",
    boxShadow: "0 0 0 2px rgba(33, 59, 122, 0.1)",
  },

  errorText: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 500,
    color: "#D92D20",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "12px",
    borderTop: "1px solid #E2E6EE",
    backgroundColor: "#F7F9FC",
    padding: "16px 28px",
  },

  buttonBase: {
    fontFamily: "inherit",
    display: "inline-flex",
    height: "40px",
    minWidth: "92px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    padding: "0 16px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 150ms ease",
    outline: "none",
  },

  cancelButton: {
    border: "1px solid #E2E6EE",
    backgroundColor: "#FFFFFF",
    color: "#667085",
  },

  cancelButtonHover: {
    backgroundColor: "#F7F9FC",
    color: "#172033",
  },

  submitButton: {
    border: "none",
    backgroundColor: "#213B7A",
    color: "#FFFFFF",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },

  submitButtonHover: {
    backgroundColor: "#1B3269",
  },

  submitButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  buttonFocus: {
    boxShadow: "0 0 0 2px rgba(33, 59, 122, 0.2)",
  },
};

/* =========================
   Dummy API
========================= */

async function dummyLookupTypeApi(data, mode) {
  const isEdit = mode === "edit";

  console.log("=================================");
  console.log("DUMMY API HIT");
  console.log("=================================");

  console.log("API URL:");
  console.log("/api/v1/administration/lookup-types");

  console.log("Method:");
  console.log(isEdit ? "PUT" : "POST");

  console.log("Request Payload:");
  console.log(data);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const dummyResponse = {
    success: true,
    message: isEdit
      ? "Lookup type updated successfully"
      : "Lookup type created successfully",
    data: data,
  };

  console.log("Dummy API Response:");
  console.log(dummyResponse);

  console.log("=================================");

  return dummyResponse;
}

/**
 * Reusable popup.
 *
 * Props:
 *  - open: boolean
 *  - mode: "create" | "view" | "edit"   (default "create")
 *  - initialData: { lookupCode, lookupName } | null
 *  - onClose: () => void
 *  - onSubmit: (data) => void           (called on create + update)
 */
export function LookupTypePopup({
  open,
  mode = "create",
  initialData = null,
  onClose,
  onSubmit,
}) {
  const [lookupCode, setLookupCode] = useState("");
  const [lookupName, setLookupName] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Hover / focus tracking (inline styles can't use :hover / :focus)
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);

  const isView = mode === "view";
  const config = MODE_CONFIG[mode] || MODE_CONFIG.create;

  /* =========================
     Prefill when opened
     (must run before the early return below)
  ========================= */

  useEffect(() => {
    if (!open) return;

    setError("");

    if (initialData) {
      setLookupCode(initialData.lookupCode ?? "");
      setLookupName(initialData.lookupName ?? "");
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialData]);

  if (!open) {
    return null;
  }

  function resetForm() {
    setLookupCode("");
    setLookupName("");
    setError("");
  }

  /* Helpers to attach hover/focus handlers and merge styles */

  function interactionProps(id) {
    return {
      onMouseEnter: () => setHovered(id),
      onMouseLeave: () => setHovered(null),
      onFocus: () => setFocused(id),
      onBlur: () => setFocused(null),
    };
  }

  function fieldStyle(id) {
    return {
      ...styles.field,
      ...(isView ? styles.fieldViewMode : {}),
      ...(!isView && hovered === id ? styles.fieldHover : {}),
      ...(!isView && focused === id ? styles.fieldFocus : {}),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // No submit in view mode
    if (isView || submitting) return;

    /* =========================
       Validation
    ========================= */

    const trimmedLookupCode = lookupCode.trim();
    const trimmedLookupName = lookupName.trim();

    if (!trimmedLookupCode) {
      setError("Lookup Code is required");
      return;
    }

    if (!trimmedLookupName) {
      setError("Lookup Name is required");
      return;
    }

    setError("");

    /* =========================
       Final Payload
    ========================= */

    const data = {
      lookupCode: trimmedLookupCode,
      lookupName: trimmedLookupName,
    };

    console.log("=================================");
    console.log(
      mode === "edit"
        ? "LOOKUP TYPE FORM UPDATED"
        : "LOOKUP TYPE FORM SUBMITTED",
    );
    console.log("=================================");

    console.log("Complete Payload:");
    console.log(JSON.stringify(data, null, 2));

    /* =========================
       Dummy API Hit
    ========================= */

    setSubmitting(true);

    try {
      await dummyLookupTypeApi(data, mode);

      /* Parent Callback */
      onSubmit(data);

      /* Reset Form */
      resetForm();
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    resetForm();
    onClose();
  }

  return (
    <div
      style={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div style={styles.modal}>
        {/* =========================
            Header
        ========================= */}

        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>{config.title}</h2>

            <p style={styles.subtitle}>{config.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close"
            {...interactionProps("close")}
            style={{
              ...styles.closeButton,
              ...(hovered === "close" ? styles.closeButtonHover : {}),
              ...(focused === "close" ? styles.closeButtonFocus : {}),
            }}
          >
            ×
          </button>
        </div>

        {/* =========================
            Form
        ========================= */}

        <form onSubmit={handleSubmit}>
          <div style={styles.body}>
            {/* Lookup Code */}

            <div style={styles.fieldGroup}>
              <label htmlFor="popupLookupCode" style={styles.label}>
                Lookup Code
              </label>

              <input
                id="popupLookupCode"
                type="text"
                value={lookupCode}
                onChange={(event) => {
                  setLookupCode(event.target.value);
                  setError("");
                }}
                placeholder="Enter lookup code"
                readOnly={isView}
                {...interactionProps("code")}
                style={fieldStyle("code")}
              />
            </div>

            {/* Lookup Name */}

            <div style={styles.fieldGroup}>
              <label htmlFor="popupLookupName" style={styles.label}>
                Lookup Name
              </label>

              <input
                id="popupLookupName"
                type="text"
                value={lookupName}
                onChange={(event) => {
                  setLookupName(event.target.value);
                  setError("");
                }}
                placeholder="Enter lookup name"
                readOnly={isView}
                {...interactionProps("name")}
                style={fieldStyle("name")}
              />
            </div>

            {error && <p style={styles.errorText}>{error}</p>}
          </div>

          {/* =========================
              Footer
          ========================= */}

          <div style={styles.footer}>
            <button
              type="button"
              onClick={handleCancel}
              {...interactionProps("cancel")}
              style={{
                ...styles.buttonBase,
                ...styles.cancelButton,
                ...(hovered === "cancel" ? styles.cancelButtonHover : {}),
                ...(focused === "cancel" ? styles.buttonFocus : {}),
              }}
            >
              {isView ? "Close" : "Cancel"}
            </button>

            {!isView && (
              <button
                type="submit"
                disabled={submitting}
                {...interactionProps("submit")}
                style={{
                  ...styles.buttonBase,
                  ...styles.submitButton,
                  ...(hovered === "submit" ? styles.submitButtonHover : {}),
                  ...(focused === "submit" ? styles.buttonFocus : {}),
                  ...(submitting ? styles.submitButtonDisabled : {}),
                }}
              >
                {config.submitLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
