"use client";
import { useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AppShell from "../../components/AppShell";
import {
  LookupTypePopup,
  ROLE_OPTIONS,
  DESIGNATION_OPTIONS,
  STATUS_OPTIONS,
} from "../../components/LookupPopup";
import { initialLookupData } from "../../lib/lookup-data";

/* ---------- Constants ---------- */

const FONT =
  "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif";
const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');";

const PAGE_SIZE = 5;

const SEARCH_BY_OPTIONS = [
  { key: "All lookup fields", value: "all" },
  { key: "Lookup Code", value: "lookupCode" },
  { key: "Lookup Description", value: "lookupDescription" },
];

/* ---------- Helpers ---------- */

// Raw value (number OR label text) -> label to display
function getLabel(options, raw) {
  if (raw === undefined || raw === null || raw === "") return "";
  const found = options.find(
    (o) => String(o.value) === String(raw) || o.key === raw,
  );
  return found ? found.key : raw;
}

// Raw value (number OR label text) -> numeric value for dropdown
function getValue(options, raw) {
  if (raw === undefined || raw === null || raw === "") return "";
  const found = options.find(
    (o) => String(o.value) === String(raw) || o.key === raw,
  );
  return found ? found.value : "";
}

function getPageNumbers(current, total) {
  let end = Math.min(total, Math.max(1, current - 2) + 4);
  let start = Math.max(1, end - 4);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

/* ---------- Inline style objects ---------- */

const C = {
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E3E7EF",
  rowBorder: "#EDF0F5",
  inputBorder: "#D9DEE8",
  navy: "#1D3F9A",
  blue: "#1F5EFF",
  panelBg: "#F8FAFC",
  headBg: "#F8F9FB",
  hover: "#F7F9FC",
};

const styles = {
  root: {
    fontFamily: FONT,
    color: C.text,
  },

  pageWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  /* Top bar */
  topBar: {
    display: "flex",
    justifyContent: "flex-end",
  },

  addButton: {
    display: "inline-flex",
    height: "40px",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: C.navy,
    padding: "0 20px",
    fontFamily: "inherit",
    fontSize: "15px",
    fontWeight: 600,
    color: "#FFFFFF",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(29, 63, 154, 0.25)",
    transition: "all 150ms ease",
    outline: "none",
  },

  addButtonHover: {
    backgroundColor: "#173383",
  },

  addButtonFocus: {
    boxShadow: "0 0 0 3px rgba(29, 63, 154, 0.25)",
  },

  plusIcon: {
    width: "16px",
    height: "16px",
  },

  /* Filter panel */
  filterPanel: {
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    backgroundColor: C.panelBg,
    padding: "16px 20px",
  },

  filterForm: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  },

  control: {
    height: "40px",
    boxSizing: "border-box",
    width: "100%",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: C.inputBorder,
    borderRadius: "6px",
    backgroundColor: "#FFFFFF",
    padding: "0 12px",
    fontFamily: "inherit",
    fontSize: "14px",
    color: C.text,
    outline: "none",
    transition: "all 150ms ease",
  },

  controlHover: {
    borderColor: "#C2C9D6",
  },

  controlFocus: {
    borderColor: C.blue,
    boxShadow: "0 0 0 3px rgba(31, 94, 255, 0.12)",
  },

  searchInputWrap: {
    position: "relative",
  },

  searchInputIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "16px",
    height: "16px",
    color: C.muted,
    pointerEvents: "none",
  },

  searchButton: {
    display: "inline-flex",
    height: "40px",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: C.blue,
    padding: "0 22px",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: 600,
    color: "#FFFFFF",
    cursor: "pointer",
    transition: "all 150ms ease",
    outline: "none",
  },

  searchButtonHover: {
    backgroundColor: "#1A50D9",
  },

  /* Table */
  tableCard: {
    overflow: "hidden",
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    backgroundColor: "#FFFFFF",
  },

  tableScroll: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "separate",
    borderSpacing: 0,
  },

  th: {
    backgroundColor: C.headBg,
    borderBottom: `1px solid ${C.border}`,
    padding: "16px",
    textAlign: "left",
    fontSize: "12.5px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#374151",
    whiteSpace: "nowrap",
  },

  thSr: {
    width: "70px",
    textAlign: "center",
  },

  thSticky: {
    position: "sticky",
    right: 0,
    zIndex: 2,
    boxShadow: `-1px 0 0 ${C.border}`,
  },

  row: {
    height: "61px",
    transition: "background-color 150ms ease",
  },

  td: {
    borderBottom: `1px solid ${C.rowBorder}`,
    padding: "0 16px",
    fontSize: "13.5px",
    color: C.text,
    whiteSpace: "nowrap",
  },

  tdSr: {
    textAlign: "center",
    color: C.muted,
  },

  tdCode: {
    fontWeight: 600,
  },

  tdMuted: {
    color: "#4B5563",
  },

  tdSticky: {
    position: "sticky",
    right: 0,
    zIndex: 1,
    boxShadow: `-1px 0 0 ${C.border}`,
  },

  emptyCell: {
    padding: "40px 16px",
    textAlign: "center",
    fontSize: "14px",
    color: C.muted,
  },

  /* Row actions */
  actionWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  actionButton: {
    display: "inline-flex",
    height: "32px",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: C.inputBorder,
    borderRadius: "6px",
    backgroundColor: "#FFFFFF",
    padding: "0 12px",
    fontFamily: "inherit",
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
    transition: "all 150ms ease",
    outline: "none",
  },

  actionButtonHover: {
    backgroundColor: "#F3F5F9",
    borderColor: "#C2C9D6",
  },

  actionButtonDeleteHover: {
    backgroundColor: "#FEF3F2",
    borderColor: "#F5B5B0",
    color: "#D92D20",
  },

  actionIcon: {
    width: "14px",
    height: "14px",
  },

  /* Footer */
  footer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "0 4px",
  },

  footerText: {
    fontSize: "13.5px",
    color: C.muted,
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  pageButton: {
    display: "inline-flex",
    height: "32px",
    minWidth: "32px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    border: `1px solid ${C.inputBorder}`,
    backgroundColor: "#FFFFFF",
    padding: "0 8px",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
    transition: "all 150ms ease",
    outline: "none",
  },

  pageButtonActive: {
    borderColor: C.text,
    color: C.text,
  },

  pageButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  pageIcon: {
    width: "16px",
    height: "16px",
  },
};

export default function LookupManagementPage() {
  const [lookupData, setLookupData] = useState(initialLookupData);

  /* Filters: "draft" = what user is typing, "applied" = used for filtering */
  const [searchBy, setSearchBy] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [applied, setApplied] = useState({
    searchBy: "all",
    searchText: "",
    role: "",
    status: "",
  });

  const [page, setPage] = useState(1);

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState("create"); // "create" | "view" | "edit"
  const [selectedLookup, setSelectedLookup] = useState(null);

  // UI states for hover / focus (inline styles can't use :hover / :focus)
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null); // e.g. "view-3"
  const [hoveredCtl, setHoveredCtl] = useState(null);
  const [focusedCtl, setFocusedCtl] = useState(null);

  /* ---------- Filtering + pagination ---------- */

  const filteredData = lookupData.filter((item) => {
    const q = applied.searchText.trim().toLowerCase();

    if (q) {
      let haystack = "";
      if (applied.searchBy === "lookupCode") {
        haystack = String(item.lookupCode ?? "");
      } else if (applied.searchBy === "lookupDescription") {
        haystack = String(item.lookupDescription ?? "");
      } else {
        haystack = [
          item.lookupCode,
          item.lookupDescription,
          getLabel(ROLE_OPTIONS, item.role),
          getLabel(DESIGNATION_OPTIONS, item.designation),
          getLabel(STATUS_OPTIONS, item.status),
        ].join(" ");
      }
      if (!haystack.toLowerCase().includes(q)) return false;
    }

    if (
      applied.role !== "" &&
      Number(getValue(ROLE_OPTIONS, item.role)) !== Number(applied.role)
    ) {
      return false;
    }

    if (
      applied.status !== "" &&
      Number(getValue(STATUS_OPTIONS, item.status)) !== Number(applied.status)
    ) {
      return false;
    }

    return true;
  });

  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

  const showingFrom = totalRecords === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + PAGE_SIZE, totalRecords);

  function handleSearch(event) {
    event.preventDefault();
    setApplied({
      searchBy,
      searchText,
      role: roleFilter,
      status: statusFilter,
    });
    setPage(1);
  }

  /* ---------- Popup openers ---------- */

  function openCreate() {
    setSelectedLookup(null);
    setPopupMode("create");
    setPopupOpen(true);
  }

  function openView(item) {
    setSelectedLookup(item);
    setPopupMode("view");
    setPopupOpen(true);
  }

  function openEdit(item) {
    setSelectedLookup(item);
    setPopupMode("edit");
    setPopupOpen(true);
  }

  function closePopup() {
    setPopupOpen(false);
    setSelectedLookup(null);
    setPopupMode("create");
  }

  /* ---------- Delete ---------- */

  function handleDelete(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.lookupCode}"?`,
    );

    if (!confirmed) return;

    console.log("Deleted Lookup:", item);

    setLookupData((currentData) =>
      currentData.filter((row) => row.id !== item.id),
    );
  }

  /* ---------- Popup submit (create + update) ---------- */

  function handlePopupSubmit(data) {
    console.log("Popup Submitted:", data, "Mode:", popupMode);

    if (popupMode === "edit" && selectedLookup) {
      // UPDATE existing row
      setLookupData((currentData) =>
        currentData.map((row) =>
          row.id === selectedLookup.id
            ? {
                ...row,
                lookupCode: data.lookupCode,
                lookupDescription: data.lookupName,
                status: data.status,
                role: data.role,
                designation: data.designation,
              }
            : row,
        ),
      );
    } else {
      // CREATE new row
      const nextId =
        lookupData.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) +
        1;

      const newLookup = {
        id: nextId,
        lookupCode: data.lookupCode,
        lookupDescription: data.lookupName,
        status: data.status,
        role: data.role,
        designation: data.designation,
      };

      setLookupData((currentData) => [...currentData, newLookup]);
    }

    closePopup();
  }

  // Convert table row -> popup form shape
  const popupInitialData = selectedLookup
    ? {
        lookupCode: selectedLookup.lookupCode,
        lookupName: selectedLookup.lookupDescription,
        role: getValue(ROLE_OPTIONS, selectedLookup.role),
        designation: getValue(DESIGNATION_OPTIONS, selectedLookup.designation),
        status: getValue(STATUS_OPTIONS, selectedLookup.status),
      }
    : null;

  /* ---------- Style helpers ---------- */

  function ctlProps(id) {
    return {
      onMouseEnter: () => setHoveredCtl(id),
      onMouseLeave: () => setHoveredCtl(null),
      onFocus: () => setFocusedCtl(id),
      onBlur: () => setFocusedCtl(null),
    };
  }

  function ctlStyle(id, extra = {}) {
    return {
      ...styles.control,
      ...extra,
      ...(hoveredCtl === id ? styles.controlHover : {}),
      ...(focusedCtl === id ? styles.controlFocus : {}),
    };
  }

  function actionStyle(type, id) {
    const isHovered = hoveredAction === `${type}-${id}`;
    return {
      ...styles.actionButton,
      ...(isHovered
        ? type === "delete"
          ? styles.actionButtonDeleteHover
          : styles.actionButtonHover
        : {}),
    };
  }

  function actionHandlers(type, id) {
    return {
      onMouseEnter: () => setHoveredAction(`${type}-${id}`),
      onMouseLeave: () => setHoveredAction(null),
    };
  }

  function pageBtnStyle(disabled, active) {
    return {
      ...styles.pageButton,
      ...(active ? styles.pageButtonActive : {}),
      ...(disabled ? styles.pageButtonDisabled : {}),
    };
  }

  return (
    <AppShell title="Lookup Management">
      <style>{FONT_IMPORT}</style>

      <div style={styles.root}>
        <div style={styles.pageWrapper}>
          {/* Top action */}
          <div style={styles.topBar}>
            <button
              type="button"
              onClick={openCreate}
              {...ctlProps("add")}
              style={{
                ...styles.addButton,
                ...(hoveredCtl === "add" ? styles.addButtonHover : {}),
                ...(focusedCtl === "add" ? styles.addButtonFocus : {}),
              }}
            >
              <Plus style={styles.plusIcon} />
              Add Lookup
            </button>
          </div>

          {/* Filter panel */}
          <section style={styles.filterPanel}>
            <form onSubmit={handleSearch} style={styles.filterForm}>
              {/* Search by */}
              <div style={{ ...styles.fieldGroup, width: "190px" }}>
                <label htmlFor="searchBy" style={styles.label}>
                  Search by
                </label>
                <select
                  id="searchBy"
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  {...ctlProps("searchBy")}
                  style={ctlStyle("searchBy")}
                >
                  {SEARCH_BY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.key}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div style={{ ...styles.fieldGroup, flex: "1 1 260px" }}>
                <label htmlFor="lookupSearch" style={styles.label}>
                  Search
                </label>
                <div style={styles.searchInputWrap}>
                  <Search style={styles.searchInputIcon} />
                  <input
                    id="lookupSearch"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search all lookup fields"
                    {...ctlProps("search")}
                    style={ctlStyle("search", { paddingLeft: "36px" })}
                  />
                </div>
              </div>

              {/* Role */}
              <div style={{ ...styles.fieldGroup, width: "160px" }}>
                <label htmlFor="roleFilter" style={styles.label}>
                  Role
                </label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  {...ctlProps("role")}
                  style={ctlStyle("role")}
                >
                  <option value="">All</option>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.key}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div style={{ ...styles.fieldGroup, width: "160px" }}>
                <label htmlFor="statusFilter" style={styles.label}>
                  Status
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  {...ctlProps("status")}
                  style={ctlStyle("status")}
                >
                  <option value="">All</option>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.key}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search button */}
              <button
                type="submit"
                {...ctlProps("searchBtn")}
                style={{
                  ...styles.searchButton,
                  ...(hoveredCtl === "searchBtn"
                    ? styles.searchButtonHover
                    : {}),
                }}
              >
                <Search style={{ width: "15px", height: "15px" }} />
                Search
              </button>
            </form>
          </section>

          {/* Table */}
          <section style={styles.tableCard}>
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, ...styles.thSr }}>Sr</th>
                    <th style={{ ...styles.th, width: "200px" }}>
                      Lookup Code
                    </th>
                    <th style={styles.th}>Lookup Description</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Designation</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, ...styles.thSticky }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pageRows.map((item, index) => {
                    const isHovered = hoveredRowId === item.id;
                    const rowBg = isHovered ? C.hover : "#FFFFFF";

                    return (
                      <tr
                        key={item.id}
                        onMouseEnter={() => setHoveredRowId(item.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        style={{ ...styles.row, backgroundColor: rowBg }}
                      >
                        <td style={{ ...styles.td, ...styles.tdSr }}>
                          {startIndex + index + 1}
                        </td>

                        <td style={{ ...styles.td, ...styles.tdCode }}>
                          {item.lookupCode}
                        </td>

                        <td style={{ ...styles.td, ...styles.tdMuted }}>
                          {item.lookupDescription}
                        </td>

                        <td style={{ ...styles.td, ...styles.tdMuted }}>
                          {getLabel(ROLE_OPTIONS, item.role) || "—"}
                        </td>

                        <td style={{ ...styles.td, ...styles.tdMuted }}>
                          {getLabel(DESIGNATION_OPTIONS, item.designation) ||
                            "—"}
                        </td>

                        <td style={{ ...styles.td, ...styles.tdMuted }}>
                          {getLabel(STATUS_OPTIONS, item.status) || "—"}
                        </td>

                        {/* Actions (sticky right) */}
                        <td
                          style={{
                            ...styles.td,
                            ...styles.tdSticky,
                            backgroundColor: rowBg,
                          }}
                        >
                          <div style={styles.actionWrap}>
                            <button
                              type="button"
                              onClick={() => openView(item)}
                              {...actionHandlers("view", item.id)}
                              style={actionStyle("view", item.id)}
                            >
                              <Eye style={styles.actionIcon} />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              {...actionHandlers("edit", item.id)}
                              style={actionStyle("edit", item.id)}
                            >
                              <Pencil style={styles.actionIcon} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              {...actionHandlers("delete", item.id)}
                              style={actionStyle("delete", item.id)}
                            >
                              <Trash2 style={styles.actionIcon} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={7} style={styles.emptyCell}>
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer: count + pagination */}
          <div style={styles.footer}>
            <span style={styles.footerText}>
              Showing {showingFrom} to {showingTo} of {totalRecords} records
            </span>

            <div style={styles.pagination}>
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                style={pageBtnStyle(currentPage === 1, false)}
              >
                <ChevronLeft style={styles.pageIcon} />
              </button>

              {getPageNumbers(currentPage, totalPages).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  style={pageBtnStyle(false, p === currentPage)}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                style={pageBtnStyle(currentPage === totalPages, false)}
              >
                <ChevronRight style={styles.pageIcon} />
              </button>
            </div>
          </div>
        </div>

        {/* Reusable Popup: create / view / edit (inside root so it inherits the font) */}
        <LookupTypePopup
          open={popupOpen}
          mode={popupMode}
          initialData={popupInitialData}
          onClose={closePopup}
          onSubmit={handlePopupSubmit}
        />
      </div>
    </AppShell>
  );
}
