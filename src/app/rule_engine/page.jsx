"use client";
import { useMemo, useState } from "react";
import "./rule.css";

import AppShell from "../../components/AppShell";

/* ---------- Config: add new parameters here ---------- */
const PARAMS = {
  "CIBIL Score": { unit: "" },
  "Debt to Income (DTI)": { unit: "%" },
  FOIR: { unit: "%" },
  "Loan-to-Value (LTV)": { unit: "%" },
  "EMI Bounce": { unit: "" },
  Age: { unit: "" },
  "Employment Stability (years)": { unit: "" },
  "Firm Registration": { options: ["Registered", "Not Registered"] },
};
const OPS = { lt: "Below", between: "Between", gt: "Above", eq: "Is" };
const DECISIONS = {
  Allow: "Application passes this check.",
  Override: "Application continues, with extra rate added.",
  Reject: "Application is declined.",
};

let uid = 100;
const R = (param, op, a, b, decision, offset = 0) => ({
  id: ++uid,
  param,
  op,
  a,
  b,
  decision,
  offset,
  active: true,
});
const SEED = [
  R("CIBIL Score", "lt", 400, "", "Reject"),
  R("CIBIL Score", "between", 401, 500, "Override", 4),
  R("CIBIL Score", "between", 501, 600, "Override", 3),
  R("CIBIL Score", "between", 601, 700, "Override", 2),
  R("CIBIL Score", "gt", 701, "", "Allow"),
  R("Firm Registration", "eq", "Not Registered", "", "Override", 1),
  R("Firm Registration", "eq", "Registered", "", "Allow"),
  R("Age", "lt", 21, "", "Reject"),
  R("Age", "gt", 65, "", "Reject"),
  R("Debt to Income (DTI)", "lt", 36, "", "Allow"),
  R("Debt to Income (DTI)", "between", 36, 50, "Override", 2),
  R("Debt to Income (DTI)", "gt", 50, "", "Reject"),
  R("FOIR", "lt", 40, "", "Allow"),
  R("FOIR", "between", 40, 50, "Override", 2),
  R("FOIR", "gt", 50, "", "Reject"),
  R("Loan-to-Value (LTV)", "lt", 80, "", "Allow"),
  R("Loan-to-Value (LTV)", "gt", 80, "", "Override", 2),
  R("EMI Bounce", "gt", 3, "", "Reject"),
  R("EMI Bounce", "lt", 3, "", "Override"),
];

/* ---------- Helpers ---------- */
const unit = (p) => PARAMS[p]?.unit || "";
const label = (r) => {
  const u = unit(r.param);
  if (r.op === "lt") return `Below ${r.a}${u}`;
  if (r.op === "gt") return `Above ${r.a}${u}`;
  if (r.op === "between") return `Between ${r.a}${u} - ${r.b}${u}`;
  return String(r.a);
};
const sentence = (r) => {
  if (r.a === "" || (r.op === "between" && r.b === ""))
    return "Fill in the values to preview your rule.";
  const when =
    r.op === "eq"
      ? `${r.param} is ${r.a}`
      : `${r.param} is ${label(r).toLowerCase()}`;
  const then =
    r.decision === "Reject"
      ? "reject the application"
      : r.decision === "Allow"
        ? "allow the application"
        : `allow it and add ${r.offset === "" ? "?" : "+" + r.offset}% to the interest rate`;
  return `If ${when}, ${then}.`;
};
const matches = (r, v) => {
  if (r.op === "eq") return v === r.a;
  const n = Number(v),
    a = Number(r.a),
    b = Number(r.b);
  return r.op === "lt" ? n < a : r.op === "gt" ? n > a : n >= a && n <= b;
};
function evaluate(rules, inputs) {
  const hits = [];
  Object.entries(inputs).forEach(([p, v]) => {
    if (v === "" || v == null) return;
    const rule = rules.find((r) => r.active && r.param === p && matches(r, v));
    if (rule) hits.push(rule);
  });
  const rejected = hits.some((h) => h.decision === "Reject");
  const offset = rejected
    ? 0
    : hits.reduce(
        (s, h) => s + (h.decision === "Override" ? Number(h.offset) || 0 : 0),
        0,
      );
  const outcome = rejected
    ? "Reject"
    : hits.some((h) => h.decision === "Override")
      ? "Override"
      : "Allow";
  return { hits, outcome, offset };
}

const EMPTY = {
  param: "CIBIL Score",
  op: "lt",
  a: "",
  b: "",
  decision: "Allow",
  offset: "",
};
const Plus = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default function RuleEngine() {
  const [rules, setRules] = useState(SEED);
  const [tab, setTab] = useState("create");
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [q, setQ] = useState("");
  const [fParam, setFParam] = useState("All");
  const [fDecision, setFDecision] = useState("All");
  const [inputs, setInputs] = useState({});

  const isChoice = !!PARAMS[form.param].options;
  const say = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2500);
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const changeParam = (param) => {
    const choice = !!PARAMS[param].options;
    setForm({
      ...EMPTY,
      param,
      op: choice ? "eq" : "lt",
      a: choice ? PARAMS[param].options[0] : "",
    });
  };

  const save = () => {
    if (form.a === "" || (form.op === "between" && form.b === ""))
      return setError("Enter the value for this rule.");
    if (form.op === "between" && Number(form.a) >= Number(form.b))
      return setError("'From' must be lower than 'To'.");
    if (form.decision === "Override" && form.offset === "")
      return setError("Enter the extra rate to add for Override.");
    setError("");
    const rule = {
      ...form,
      offset: form.decision === "Override" ? Number(form.offset) : 0,
    };
    setRules((rs) =>
      editId
        ? rs.map((r) => (r.id === editId ? { ...r, ...rule } : r))
        : [...rs, { ...rule, id: ++uid, active: true }],
    );
    say(editId ? "Rule updated" : "Rule created");
    setForm(EMPTY);
    setEditId(null);
  };
  const edit = (r) => {
    setForm({ ...r });
    setEditId(r.id);
    setTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = (id) => {
    setRules((rs) => rs.filter((r) => r.id !== id));
    say("Rule deleted");
  };
  const toggle = (id) =>
    setRules((rs) =>
      rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  const saveAll = () => {
    const payload = rules.map(
      ({ id, param, op, a, b, decision, offset, active }) => ({
        id,
        param,
        op,
        a,
        b,
        decision,
        offset,
        active,
      }),
    );
    console.log(payload); // TODO: await fetch("/api/rules", { method: "POST", body: JSON.stringify(payload) });
    say("Rules saved");
  };

  const visible = useMemo(
    () =>
      rules.filter(
        (r) =>
          (fParam === "All" || r.param === fParam) &&
          (fDecision === "All" || r.decision === fDecision) &&
          `${r.param} ${label(r)} ${r.decision}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [rules, q, fParam, fDecision],
  );
  const result = useMemo(() => evaluate(rules, inputs), [rules, inputs]);

  return (
    <AppShell>
      <div className="rl-page">
        <header className="rl-head">
          <div style={{ marginTop: "-15px", marginBottom: "26px" }}>
            <h1
              style={{ margin: 0, color: "#23474C", font: "700 23px Manrope" }}
            >
              Rule Engine
            </h1>
          </div>
          <span className="rl-badge big">{rules.length} rules</span>
        </header>

        <section className="rl-card">
          <h2>{editId ? "Edit rule" : "Create a rule"}</h2>
          <p className="rl-sub">
            Pick what to check, set the range, then choose what happens.
          </p>
          <div className="rl-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "create"}
              className={tab === "create" ? "on" : ""}
              onClick={() => setTab("create")}
            >
              Rule
            </button>
            <button
              role="tab"
              aria-selected={tab === "test"}
              className={tab === "test" ? "on" : ""}
              onClick={() => setTab("test")}
            >
              Test rules
            </button>
          </div>

          {tab === "create" ? (
            <>
              <div className="rl-grid">
                <label className="span2">
                  Check *
                  <select
                    value={form.param}
                    onChange={(e) => changeParam(e.target.value)}
                  >
                    {Object.keys(PARAMS).map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
                {!isChoice && (
                  <label>
                    When value is *
                    <select
                      value={form.op}
                      onChange={(e) => set("op", e.target.value)}
                    >
                      {["lt", "between", "gt"].map((o) => (
                        <option key={o} value={o}>
                          {OPS[o]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  {isChoice
                    ? "Result"
                    : form.op === "between"
                      ? "From"
                      : "Value"}{" "}
                  *
                  {isChoice ? (
                    <select
                      value={form.a}
                      onChange={(e) => set("a", e.target.value)}
                    >
                      {PARAMS[form.param].options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      placeholder={`e.g. 400${unit(form.param)}`}
                      value={form.a}
                      onChange={(e) => set("a", e.target.value)}
                    />
                  )}
                </label>
                {form.op === "between" && !isChoice && (
                  <label>
                    To <i>*</i>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={form.b}
                      onChange={(e) => set("b", e.target.value)}
                    />
                  </label>
                )}
                <label>
                  Then *
                  <select
                    value={form.decision}
                    onChange={(e) => set("decision", e.target.value)}
                  >
                    {Object.keys(DECISIONS).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <small>{DECISIONS[form.decision]}</small>
                </label>
                {form.decision === "Override" && (
                  <label>
                    Add to rate (%) *
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 2"
                      value={form.offset}
                      onChange={(e) => set("offset", e.target.value)}
                    />
                    <small>Added to the base interest rate.</small>
                  </label>
                )}
              </div>
              <p className="rl-preview">
                <b>Preview</b>
                {sentence(form)}
              </p>
              {error && (
                <p className="rl-error" role="alert">
                  {error}
                </p>
              )}
              <div className="rl-actions">
                {editId && (
                  <button
                    className="btn ghost"
                    onClick={() => {
                      setForm(EMPTY);
                      setEditId(null);
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button className="btn primary" onClick={save}>
                  <Plus />
                  {editId ? "Update rule" : "Create rule"}
                </button>
              </div>
            </>
          ) : (
            <div className="rl-test">
              <div className="rl-grid">
                {Object.entries(PARAMS).map(([p, cfg]) => (
                  <label key={p}>
                    {p}
                    {cfg.options ? (
                      <select
                        value={inputs[p] || ""}
                        onChange={(e) =>
                          setInputs({ ...inputs, [p]: e.target.value })
                        }
                      >
                        <option value="">Not provided</option>
                        {cfg.options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={inputs[p] ?? ""}
                        onChange={(e) =>
                          setInputs({ ...inputs, [p]: e.target.value })
                        }
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className={`rl-result ${result.outcome.toLowerCase()}`}>
                <strong>
                  {result.outcome === "Reject"
                    ? "Application rejected"
                    : result.outcome === "Override"
                      ? `Approved with +${result.offset}% added to the rate`
                      : "Application allowed"}
                </strong>
                {result.hits.length === 0 ? (
                  <span>Enter values above to see which rules apply.</span>
                ) : (
                  <ul>
                    {result.hits.map((h) => (
                      <li key={h.id}>
                        {h.param}: {label(h)} - {h.decision}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="rl-card flush">
          <div className="rl-listhead">
            <div>
              <h2>Rule list</h2>
              <p className="rl-sub">Browse, edit or switch off rules.</p>
            </div>
            <span className="rl-badge">{visible.length} records</span>
          </div>
          <div className="rl-toolbar">
            <input
              className="search"
              placeholder="Search check, value or rule"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <label className="inline">
              Check
              <select
                value={fParam}
                onChange={(e) => setFParam(e.target.value)}
              >
                <option>All</option>
                {Object.keys(PARAMS).map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="inline">
              Rule
              <select
                value={fDecision}
                onChange={(e) => setFDecision(e.target.value)}
              >
                <option>All</option>
                {Object.keys(DECISIONS).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="rl-scroll">
            <table className="rl-table">
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Check</th>
                  <th>Result</th>
                  <th>Rule</th>
                  <th>Rate offset</th>
                  <th>Active</th>
                  <th className="r">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className={r.active ? "" : "off"}>
                    <td>{rules.indexOf(r) + 1}</td>
                    <td className="strong">{r.param}</td>
                    <td>{label(r)}</td>
                    <td>
                      <span className={`pill ${r.decision.toLowerCase()}`}>
                        {r.decision}
                      </span>
                    </td>
                    <td>{r.decision === "Override" ? `+${r.offset}%` : "-"}</td>
                    <td>
                      <button
                        className={`switch ${r.active ? "on" : ""}`}
                        role="switch"
                        aria-checked={r.active}
                        aria-label={`Toggle ${r.param} rule`}
                        onClick={() => toggle(r.id)}
                      />
                    </td>
                    <td className="r">
                      <button className="link" onClick={() => edit(r)}>
                        Edit
                      </button>
                      <button
                        className="link danger"
                        onClick={() => remove(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty">
                      No rules match. Clear the search or create a new rule.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* <div className="rl-foot">
            <button
              className="btn ghost"
              onClick={() => {
                setRules(SEED);
                say("Changes discarded");
              }}
            >
              Discard changes
            </button>
            <button className="btn primary" onClick={saveAll}>
              Save rules
            </button>
          </div> */}
        </section>

        {toast && (
          <div className="rl-toast" role="status">
            {toast}
          </div>
        )}
      </div>
    </AppShell>
  );
}
