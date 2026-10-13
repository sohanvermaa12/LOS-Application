import { useState } from "react";

/* =========================
   Lookup Options
========================= */

const ROLE_OPTIONS = [
  { key: "Admin", value: 1 },
  { key: "Maker", value: 2 },
  { key: "Checker", value: 3 },
  { key: "Viewer", value: 4 },
];

const DESIGNATION_OPTIONS = [
  { key: "Manager", value: 1 },
  { key: "Officer", value: 2 },
  { key: "Clerk", value: 3 },
  { key: "Executive", value: 4 },
];

const STATUS_OPTIONS = [
  { key: "Active", value: 1 },
  { key: "Inactive", value: 2 },
  { key: "Locked", value: 3 },
];

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
    overflow: "hidden",
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

  fieldReadonlyBg: {
    backgroundColor: "#F7F9FC",
  },

  fieldHover: {
    borderColor: "#C8CED9",
  },

  fieldFocus: {
    borderColor: "#213B7A",
    boxShadow: "0 0 0 2px rgba(33, 59, 122, 0.1)",
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

  buttonFocus: {
    boxShadow: "0 0 0 2px rgba(33, 59, 122, 0.2)",
  },
};

/* =========================
   Dummy API
========================= */

async function dummyCreateLookupTypeApi(data) {
  console.log("=================================");
  console.log("DUMMY API HIT");
  console.log("=================================");

  console.log("API URL:");
  console.log("/api/v1/administration/lookup-types");

  console.log("Method:");
  console.log("POST");

  console.log("Request Payload:");
  console.log(data);

  console.log("Role sent as number:", data.role);
  console.log("Designation sent as number:", data.designation);
  console.log("Status sent as number:", data.status);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const dummyResponse = {
    success: true,
    message: "Lookup type created successfully",
    data: data,
  };

  console.log("Dummy API Response:");
  console.log(dummyResponse);

  console.log("=================================");

  return dummyResponse;
}

export function LookupTypePopup({ open, onClose, onSubmit }) {
  const [lookupCode, setLookupCode] = useState("");
  const [lookupName, setLookupName] = useState("");

  const [role, setRole] = useState("");
  const [designation, setDesignation] = useState("");
  const [status, setStatus] = useState("");

  // Hover / focus tracking (inline styles can't use :hover / :focus)
  // Holds the id of the element currently hovered / focused, or null
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);

  if (!open) {
    return null;
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

  function fieldStyle(id, extra = {}) {
    return {
      ...styles.field,
      ...extra,
      ...(hovered === id ? styles.fieldHover : {}),
      ...(focused === id ? styles.fieldFocus : {}),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    /* =========================
       Validation
    ========================= */

    const trimmedLookupCode = lookupCode.trim();
    const trimmedLookupName = lookupName.trim();

    if (!trimmedLookupCode) {
      console.log("Lookup Code is required");
      return;
    }

    if (!trimmedLookupName) {
      console.log("Lookup Name is required");
      return;
    }

    if (role === "") {
      console.log("Role is required");
      return;
    }

    if (designation === "") {
      console.log("Designation is required");
      return;
    }

    if (status === "") {
      console.log("Status is required");
      return;
    }

    /* =========================
       Final Payload

       IMPORTANT:
       Dropdown displays key
       Payload sends numeric value
    ========================= */

    const data = {
      lookupCode: trimmedLookupCode,
      lookupName: trimmedLookupName,

      role: Number(role),
      designation: Number(designation),
      status: Number(status),
    };

    /* =========================
       Console Payload
    ========================= */

    console.log("=================================");
    console.log("LOOKUP TYPE FORM SUBMITTED");
    console.log("=================================");

    console.log("Lookup Code:", data.lookupCode);
    console.log("Lookup Name:", data.lookupName);

    console.log("Role Number:", data.role);
    console.log("Designation Number:", data.designation);
    console.log("Status Number:", data.status);

    console.log("Complete Payload:");
    console.log(JSON.stringify(data, null, 2));

    /* =========================
       Dummy API Hit
    ========================= */

    await dummyCreateLookupTypeApi(data);

    /* =========================
       Parent Callback
    ========================= */

    onSubmit(data);

    /* =========================
       Reset Form
    ========================= */

    setLookupCode("");
    setLookupName("");
    setRole("");
    setDesignation("");
    setStatus("");
  }

  function handleCancel() {
    setLookupCode("");
    setLookupName("");
    setRole("");
    setDesignation("");
    setStatus("");

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
            <h2 style={styles.title}>Lookup Type Management</h2>

            <p style={styles.subtitle}>Create a new lookup type</p>
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
                onChange={(event) => setLookupCode(event.target.value)}
                placeholder="Enter lookup code"
                // readOnly
                onFocus={() => setFocused("code")}
                onBlur={() => setFocused(null)}
                style={{
                  ...styles.field,
                  ...styles.fieldReadonlyBg,
                  ...(focused === "code" ? styles.fieldFocus : {}),
                }}
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
                onChange={(event) => setLookupName(event.target.value)}
                placeholder="Enter lookup name"
                {...interactionProps("name")}
                style={fieldStyle("name")}
              />
            </div>

            {/* =========================
                Role
            ========================= */}

            <div style={styles.fieldGroup}>
              <label htmlFor="popupRole" style={styles.label}>
                Role
              </label>

              <select
                id="popupRole"
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
                {...interactionProps("role")}
                style={fieldStyle("role")}
              >
                <option value="">Select Role</option>

                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.key}
                  </option>
                ))}
              </select>
            </div>

            {/* =========================
                Designation
            ========================= */}

            <div style={styles.fieldGroup}>
              <label htmlFor="popupDesignation" style={styles.label}>
                Designation
              </label>

              <select
                id="popupDesignation"
                value={designation}
                onChange={(event) =>
                  setDesignation(
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
                {...interactionProps("designation")}
                style={fieldStyle("designation")}
              >
                <option value="">Select Designation</option>

                {DESIGNATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.key}
                  </option>
                ))}
              </select>
            </div>

            {/* =========================
                Status
            ========================= */}

            <div style={styles.fieldGroup}>
              <label htmlFor="popupStatus" style={styles.label}>
                Status
              </label>

              <select
                id="popupStatus"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
                {...interactionProps("status")}
                style={fieldStyle("status")}
              >
                <option value="">Select Status</option>

                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.key}
                  </option>
                ))}
              </select>
            </div>
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
              Cancel
            </button>

            <button
              type="submit"
              {...interactionProps("submit")}
              style={{
                ...styles.buttonBase,
                ...styles.submitButton,
                ...(hovered === "submit" ? styles.submitButtonHover : {}),
                ...(focused === "submit" ? styles.buttonFocus : {}),
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
