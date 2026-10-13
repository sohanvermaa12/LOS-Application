"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import AppShell from "../../components/AppShell";
import { LookupTypePopup } from "../../components/LookupPopup";
import { initialLookupData } from "../../lib/lookup-data";

/* ---------- Inline style objects ---------- */

const styles = {
  pageWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  card: {
    borderRadius: "16px",
    border: "1px solid #E2E6EE",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 10px rgba(23, 32, 51, 0.04)",
  },

  cardHeader: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    borderBottom: "1px solid #E2E6EE",
    padding: "20px 28px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "24px",
    color: "#172033",
  },

  cardSubtitle: {
    margin: "4px 0 0 0",
    fontSize: "14px",
    color: "#667085",
  },

  addButton: {
    display: "inline-flex",
    height: "40px",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "8px",
    border: "1px solid #E2E6EE",
    // Tailwind "bg-accent" is a theme token; override via --accent if needed
    backgroundColor: "var(--accent, #EEF2FB)",
    padding: "0 16px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#213B7A",
    cursor: "pointer",
    transition: "all 150ms ease",
    outline: "none",
  },

  addButtonFocus: {
    boxShadow: "0 0 0 2px rgba(33, 59, 122, 0.2)",
  },

  plusIcon: {
    width: "16px",
    height: "16px",
  },

  formSection: {
    padding: "24px 28px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
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

  input: {
    height: "44px",
    width: "1200px",
    maxWidth: "100%",
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

  inputHover: {
    borderColor: "#C8CED9",
  },

  inputFocus: {
    borderColor: "#213B7A",
    boxShadow: "0 0 0 2px rgba(33, 59, 122, 0.1)",
  },

  tableWrapper: {
    marginTop: "28px",
    overflow: "hidden",
    borderRadius: "12px",
    border: "1px solid #E2E6EE",
  },

  tableScroll: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "600px",
    borderCollapse: "collapse",
  },

  theadRow: {
    backgroundColor: "#F7F9FC",
  },

  thBase: {
    borderBottom: "1px solid #E2E6EE",
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#667085",
  },

  thSr: {
    width: "80px",
    textAlign: "center",
  },

  thCode: {
    width: "220px",
    textAlign: "left",
  },

  thDescription: {
    textAlign: "left",
  },

  tbody: {
    backgroundColor: "#FFFFFF",
  },

  row: {
    height: "58px",
    transition: "background-color 150ms ease",
  },

  rowHover: {
    backgroundColor: "#F7F9FC",
  },

  tdBase: {
    borderBottom: "1px solid #E2E6EE",
    padding: "0 16px",
    fontSize: "14px",
  },

  tdSr: {
    textAlign: "center",
    color: "#667085",
  },

  tdCode: {
    fontWeight: 500,
    color: "#172033",
  },

  tdDescription: {
    color: "#667085",
  },

  emptyRow: {
    height: "58px",
  },

  emptyCell: {
    borderBottom: "1px solid #E2E6EE",
    padding: "0 16px",
  },
};

export default function LookupManagementPage() {
  // function LookupManagementPage() {
  const [lookupCode, setLookupCode] = useState("");
  const [lookupName, setLookupName] = useState("");

  const [lookupData, setLookupData] = useState(initialLookupData);

  const [popupOpen, setPopupOpen] = useState(false);

  // UI states for hover / focus (needed because inline styles can't use :hover / :focus)
  const [buttonFocused, setButtonFocused] = useState(false);
  const [inputHovered, setInputHovered] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();

    const data = {
      lookupCode: lookupCode.trim(),
      lookupName: lookupName.trim(),
    };

    if (!data.lookupCode) {
      console.log("Lookup Code is required");
      return;
    }

    if (!data.lookupName) {
      console.log("Lookup Name is required");
      return;
    }

    console.log("Main Lookup Data:", data);
  }

  function handleCancel() {
    setLookupCode("");
    setLookupName("");
  }

  function handlePopupSubmit(data) {
    console.log("Popup Submitted:", data);

    /*
     * For now we are only printing the data.
     *
     * Later your API call can be placed here.
     */

    const newLookup = {
      id: lookupData.length + 1,
      lookupCode: data.lookupCode,
      lookupDescription: data.lookupName,
    };

    setLookupData((currentData) => [...currentData, newLookup]);

    setPopupOpen(false);
  }

  return (
    <AppShell
      title="Lookup Management"
      subtitle="Manage lookup types and lookup sub types"
    >
      <div style={styles.pageWrapper}>
        {/* Main Card */}
        <section style={styles.card}>
          {/* Card Header */}
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Lookup Sub Type Management</h2>

              <p style={styles.cardSubtitle}>
                Manage lookup codes and lookup descriptions
              </p>
            </div>

            {/* Existing Lookup Type action */}
            <button
              type="button"
              onClick={() => setPopupOpen(true)}
              onFocus={() => setButtonFocused(true)}
              onBlur={() => setButtonFocused(false)}
              style={{
                ...styles.addButton,
                ...(buttonFocused ? styles.addButtonFocus : {}),
              }}
            >
              Add Lookup
              <Plus style={styles.plusIcon} />
            </button>
          </div>

          {/* Form Section */}
          <div style={styles.formSection}>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                {/* Search Lookup */}
                <div style={styles.fieldGroup}>
                  <label htmlFor="lookupSearch" style={styles.label}>
                    Search Lookup
                  </label>

                  <input
                    id="lookupSearch"
                    type="text"
                    value={lookupCode || lookupName}
                    onChange={(event) => {
                      setLookupCode(event.target.value);
                      setLookupName(event.target.value);
                    }}
                    onMouseEnter={() => setInputHovered(true)}
                    onMouseLeave={() => setInputHovered(false)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Search by lookup code or lookup name..."
                    style={{
                      ...styles.input,
                      ...(inputHovered ? styles.inputHover : {}),
                      ...(inputFocused ? styles.inputFocus : {}),
                    }}
                  />
                </div>
              </div>

              {/* Table */}
              <div style={styles.tableWrapper}>
                <div style={styles.tableScroll}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.theadRow}>
                        <th style={{ ...styles.thBase, ...styles.thSr }}>Sr</th>

                        <th style={{ ...styles.thBase, ...styles.thCode }}>
                          Lookup Code
                        </th>

                        <th
                          style={{ ...styles.thBase, ...styles.thDescription }}
                        >
                          Lookup Description
                        </th>
                      </tr>
                    </thead>

                    <tbody style={styles.tbody}>
                      {lookupData.map((item, index) => (
                        <tr
                          key={item.id}
                          onMouseEnter={() => setHoveredRowId(item.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                          style={{
                            ...styles.row,
                            ...(hoveredRowId === item.id
                              ? styles.rowHover
                              : {}),
                          }}
                        >
                          <td style={{ ...styles.tdBase, ...styles.tdSr }}>
                            {index + 1}
                          </td>

                          <td style={{ ...styles.tdBase, ...styles.tdCode }}>
                            {item.lookupCode}
                          </td>

                          <td
                            style={{
                              ...styles.tdBase,
                              ...styles.tdDescription,
                            }}
                          >
                            {item.lookupDescription}
                          </td>
                        </tr>
                      ))}

                      {/* Preserve existing empty-row behavior */}
                      {lookupData.length < 6 &&
                        Array.from({
                          length: 6 - lookupData.length,
                        }).map((_, index) => (
                          <tr key={`empty-${index}`} style={styles.emptyRow}>
                            <td style={styles.emptyCell} />
                            <td style={styles.emptyCell} />
                            <td style={styles.emptyCell} />
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* Existing Popup */}
      <LookupTypePopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSubmit={handlePopupSubmit}
      />
    </AppShell>
  );
}
