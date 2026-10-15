"use client";
import { useEffect, useState } from "react";

/* =========================
   Lookup Options
========================= */

export const ROLE_OPTIONS = [
  { key: "Admin", value: 1 },
  { key: "Maker", value: 2 },
  { key: "Checker", value: 3 },
  { key: "Viewer", value: 4 },
];

export const DESIGNATION_OPTIONS = [
  { key: "Manager", value: 1 },
  { key: "Officer", value: 2 },
  { key: "Clerk", value: 3 },
  { key: "Executive", value: 4 },
];

export const STATUS_OPTIONS = [
  { key: "Active", value: 1 },
  { key: "Inactive", value: 2 },
  { key: "Locked", value: 3 },
];

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

  fieldReadonlyBg: {
    backgroundColor: "#F7F9FC",
  },

  // Applied to disabled / view-mode fields
  fieldDisabled: {
    backgroundColor: "#F7F9FC",
    color: "#98A2B3",
    cursor: "not-allowed",
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

  /* ----- Selection section (Role / Designation / Status) ----- */

  selectionBox: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    borderRadius: "12px",
    border: "1px solid #E2E6EE",
    backgroundColor: "#FBFCFE",
    padding: "16px",
  },

  selectionHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  selectionTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    color: "#172033",
  },

  selectionHint: {
    margin: 0,
    fontSize: "12px",
    color: "#667085",
  },

  optionRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderRadius: "10px",
    border: "1px solid #E2E6EE",
    backgroundColor: "#FFFFFF",
    padding: "12px",
    transition: "all 150ms ease",
  },

  optionRowActive: {
    borderColor: "#213B7A",
    boxShadow: "0 0 0 2px rgba(33, 59, 122, 0.08)",
  },

  optionRowDisabled: {
    backgroundColor: "#F7F9FC",
  },

  optionTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  checkLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#172033",
    cursor: "pointer",
    userSelect: "none",
  },

  checkLabelDisabled: {
    cursor: "default",
  },

  checkbox: {
    width: "16px",
    height: "16px",
    margin: 0,
    accentColor: "#213B7A",
    cursor: "inherit",
  },

  optionState: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#98A2B3",
  },

  optionStateActive: {
    color: "#213B7A",
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
 *  - initialData: { lookupCode, lookupName, role, designation, status } | null
 *  - onClose: () => void
 *  - onSubmit: (data) => void           (called on create + update)
 *
 * Role / Designation / Status are optional individually, but at least
 * one of them must be ticked and selected. Unticked ones are sent as null.
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

  const [role, setRole] = useState("");
  const [designation, setDesignation] = useState("");
  const [status, setStatus] = useState("");

  // Which of the three are switched on
  const [enabled, setEnabled] = useState({
    role: false,
    designation: false,
    status: false,
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Hover / focus tracking (inline styles can't use :hover / :focus)
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);

  const isView = mode === "view";
  const config = MODE_CONFIG[mode] || MODE_CONFIG.create;

  const hasValue = (v) => v !== "" && v !== null && v !== undefined;

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
      setRole(initialData.role ?? "");
      setDesignation(initialData.designation ?? "");
      setStatus(initialData.status ?? "");

      // Tick only the ones that already have a value
      setEnabled({
        role: hasValue(initialData.role),
        designation: hasValue(initialData.designation),
        status: hasValue(initialData.status),
      });
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
    setRole("");
    setDesignation("");
    setStatus("");
    setEnabled({ role: false, designation: false, status: false });
    setError("");
  }

  /* Tick / untick one of the three */
  function toggleOption(name, setter) {
    if (isView) return;

    setEnabled((current) => {
      const next = !current[name];
      // Unticking clears the chosen value so it is never sent
      if (!next) setter("");
      return { ...current, [name]: next };
    });

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

  function fieldStyle(id, extra = {}) {
    return {
      ...styles.field,
      ...extra,
      ...(isView ? styles.fieldViewMode : {}),
      ...(!isView && hovered === id ? styles.fieldHover : {}),
      ...(!isView && focused === id ? styles.fieldFocus : {}),
    };
  }

  // Select style: greyed out when the option is not ticked
  function selectStyle(id, isOn) {
    return {
      ...fieldStyle(id),
      ...(!isOn && !isView ? styles.fieldDisabled : {}),
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

    // At least one of the three must be ticked
    if (!enabled.role && !enabled.designation && !enabled.status) {
      setError("Please select at least one of Role, Designation or Status");
      return;
    }

    // Every ticked one must have a value chosen
    if (enabled.role && !hasValue(role)) {
      setError("Please choose a Role or untick it");
      return;
    }

    if (enabled.designation && !hasValue(designation)) {
      setError("Please choose a Designation or untick it");
      return;
    }

    if (enabled.status && !hasValue(status)) {
      setError("Please choose a Status or untick it");
      return;
    }

    setError("");

    /* =========================
       Final Payload

       Dropdown displays key
       Payload sends numeric value
       Unticked options are sent as null
    ========================= */

    const data = {
      lookupCode: trimmedLookupCode,
      lookupName: trimmedLookupName,

      role: enabled.role ? Number(role) : null,
      designation: enabled.designation ? Number(designation) : null,
      status: enabled.status ? Number(status) : null,
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

  /* =========================
     One selectable option block
     (checkbox + dropdown)
  ========================= */

  function renderOption({ name, label, value, setValue, options }) {
    const isOn = enabled[name];
    const inputId = `popup-${name}`;

    return (
      <div
        style={{
          ...styles.optionRow,
          ...(isOn ? styles.optionRowActive : {}),
          ...(!isOn && !isView ? styles.optionRowDisabled : {}),
        }}
      >
        <div style={styles.optionTop}>
          <label
            htmlFor={`${inputId}-check`}
            style={{
              ...styles.checkLabel,
              ...(isView ? styles.checkLabelDisabled : {}),
            }}
          >
            <input
              id={`${inputId}-check`}
              type="checkbox"
              checked={isOn}
              disabled={isView}
              onChange={() => toggleOption(name, setValue)}
              style={styles.checkbox}
            />
            {label}
          </label>

          <span
            style={{
              ...styles.optionState,
              ...(isOn ? styles.optionStateActive : {}),
            }}
          >
            {isOn ? "Selected" : "Not used"}
          </span>
        </div>

        <select
          id={inputId}
          value={value}
          disabled={isView || !isOn}
          onChange={(event) => {
            setValue(
              event.target.value === "" ? "" : Number(event.target.value),
            );
            setError("");
          }}
          {...interactionProps(name)}
          style={selectStyle(name, isOn)}
        >
          <option value="">{`Select ${label}`}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.key}
            </option>
          ))}
        </select>
      </div>
    );
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
                onFocus={() => setFocused("code")}
                onBlur={() => setFocused(null)}
                style={{
                  ...styles.field,
                  ...styles.fieldReadonlyBg,
                  ...(!isView && focused === "code" ? styles.fieldFocus : {}),
                  ...(isView ? { cursor: "default" } : {}),
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

            {/* =========================
                Role / Designation / Status
                (tick what you want to use)
            ========================= */}

            <div style={styles.selectionBox}>
              <div style={styles.selectionHeader}>
                <p style={styles.selectionTitle}>Select what applies</p>
                <p style={styles.selectionHint}>
                  {isView
                    ? "Options used by this lookup"
                    : "Tick one or more. Unticked options stay disabled and are not sent."}
                </p>
              </div>

              {renderOption({
                name: "role",
                label: "Role",
                value: role,
                setValue: setRole,
                options: ROLE_OPTIONS,
              })}

              {renderOption({
                name: "designation",
                label: "Designation",
                value: designation,
                setValue: setDesignation,
                options: DESIGNATION_OPTIONS,
              })}

              {renderOption({
                name: "status",
                label: "Status",
                value: status,
                setValue: setStatus,
                options: STATUS_OPTIONS,
              })}

              {error && <p style={styles.errorText}>{error}</p>}
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
