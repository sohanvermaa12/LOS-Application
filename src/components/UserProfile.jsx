"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  ContactRound,
  Check,
  KeyRound,
  Pencil,
  ShieldCheck,
  X,
  UserRound,
} from "lucide-react";
import { getUserProfile, updateUserProfile } from "../services/user_profile";

const profileSections = [
  {
    title: "Personal information",
    icon: UserRound,
    className: "personal",
    fields: [
      { label: "Full name", keys: ["fullName", "name"] },
      { label: "First name", keys: ["first_name"] },
      { label: "Middle name", keys: ["middle_name"] },
      { label: "Last name", keys: ["last_name"] },
      { label: "Date of birth", keys: ["dob", "date_of_birth"], date: true },
      { label: "Gender", keys: ["gender"] },
      { label: "Designation", keys: ["designation"] },
    ],
  },
  {
    title: "Contact",
    icon: ContactRound,
    className: "contact",
    fields: [
      { label: "Email", keys: ["email"], link: "mailto:", editable: true },
      { label: "Mobile", keys: ["mobile"], link: "tel:", editable: true },
    ],
  },
  {
    title: "Organization",
    icon: Building2,
    className: "organization",
    fields: [
      { label: "Organization name", keys: ["organization_name"] },
      { label: "Organization code", keys: ["organization_code"] },
      { label: "Employee no.", keys: ["employee_id", "emp_no"] },
    ],
  },
  {
    title: "Account and access",
    icon: ShieldCheck,
    className: "access",
    fields: [
      { label: "Username", keys: ["username"] },
      { label: "Role", keys: ["role", "role_name"] },
    ],
  },
  {
    title: "Login details",
    icon: KeyRound,
    className: "login",
    fields: [
      {
        label: "Login branch",
        keys: ["login_branch", "login_branch_name"],
      },
      { label: "Branch ID", keys: ["login_branch_id"] },
      { label: "Login time", keys: ["login_time"] },
      { label: "Logout time", keys: ["logout_time"] },
      {
        label: "Last login date",
        keys: ["last_login_date", "lastlogindate"],
        date: true,
      },
      { label: "Last login time", keys: ["last_login_time"] },
      {
        label: "Login on holidays",
        keys: ["login_on_holidays", "holiday_login", "allow_login_in_holidays"],
        boolean: true,
      },
      {
        label: "Session timeout (seconds)",
        keys: ["inactive_session_timeout"],
      },
    ],
  },
];

function getFieldValue(profile, keys) {
  const availableKeys = keys.filter((candidate) =>
    Object.prototype.hasOwnProperty.call(profile, candidate),
  );
  const key =
    availableKeys.find(
      (candidate) =>
        profile[candidate] !== null &&
        profile[candidate] !== undefined &&
        profile[candidate] !== "",
    ) || availableKeys[0];

  return key ? { key, value: profile[key] } : null;
}

function formatDate(value, includeTime) {
  if (!value) return "Not added";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : {}),
  });
}

function formatValue(value, field) {
  if (value === null || value === undefined || value === "") {
    return "Not added";
  }

  if (field.boolean && typeof value === "boolean") {
    return value ? "Enabled" : "Disabled";
  }

  if (field.date || field.dateTime) {
    return formatDate(value, field.dateTime);
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function toTitleCase(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function ProfileField({ field, profile, isEditing, draftProfile, onDraftChange }) {
  const result =
    getFieldValue(profile, field.keys) ||
    (field.editable ? { key: field.keys[0], value: "" } : null);
  if (!result) return null;

  const { value } = result;
  const draftValue = draftProfile[result.key] ?? "";
  const displayValue = formatValue(
    isEditing && field.editable ? draftValue : value,
    field,
  );
  const isMissing = value === "";
  const isEnabled = field.boolean && value === true;

  return (
    <div className={`user-profile-field${isEditing && field.editable ? " is-editing" : ""}`}>
      <span className="user-profile-field-label">{field.label}</span>
      {isEditing && field.editable ? (
        <div className="user-profile-edit-value">
          <input
            aria-label={field.label}
            className="user-profile-field-input"
            onChange={(event) => onDraftChange(result.key, event.target.value)}
            type={field.label === "Email" ? "email" : "text"}
            value={draftValue}
          />
          <Pencil aria-hidden="true" className="user-profile-edit-pencil" size={13} />
        </div>
      ) : field.link && value ? (
        <a className="user-profile-field-value" href={`${field.link}${value}`}>
          {displayValue}
        </a>
      ) : (
        <strong
          className={[
            "user-profile-field-value",
            field.boolean ? "is-boolean" : "",
            field.boolean && !isEnabled ? "is-disabled" : "",
            isMissing ? "is-missing" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {displayValue}
        </strong>
      )}
    </div>
  );
}

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [draftProfile, setDraftProfile] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      try {
        const userProfile = await getUserProfile();
        if (isCurrent) setProfile(userProfile);
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.message || "Unable to load the user profile.");
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      isCurrent = false;
    };
  }, []);

  const profileName = profile?.fullName || profile?.name || "";
  const initials = profileName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const employeeNumber = getFieldValue(profile || {}, ["employee_id", "emp_no"]);
  const organization = profile?.organization_name;

  function startEditing() {
    const editableFields = profileSections.flatMap((section) => section.fields)
      .filter((field) => field.editable);
    const draft = {};

    editableFields.forEach((field) => {
      const result = getFieldValue(profile || {}, field.keys);
      const key = result?.key || field.keys[0];
      draft[key] = result?.value == null ? "" : String(result.value);
    });

    setDraftProfile(draft);
    setSaveError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftProfile({});
    setSaveError("");
    setIsEditing(false);
  }

  async function saveProfile() {
    setIsSaving(true);
    setSaveError("");

    try {
      const updatedProfile = await updateUserProfile(draftProfile);
      setProfile((currentProfile) => ({
        ...currentProfile,
        ...draftProfile,
        ...(updatedProfile || {}),
      }));
      setDraftProfile({});
      setIsEditing(false);
    } catch (requestError) {
      setSaveError(requestError.message || "Unable to update the user profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="user-profile">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap"
      />
      {isLoading ? (
        <div className="user-profile-message" role="status">
          Loading user profile…
        </div>
      ) : error ? (
        <div className="user-profile-message is-error" role="alert">
          {error}
        </div>
      ) : (
        <>
          <section className="user-profile-summary" aria-label="User summary">
            <div className="user-profile-identity">
              <div className="user-profile-avatar" aria-hidden="true">
                {initials || "U"}
              </div>
              <div className="user-profile-identity-copy">
                <h1>{toTitleCase(profileName) || "User profile"}</h1>
                <p>
                  {employeeNumber
                    ? `Employee ${employeeNumber.value}`
                    : null}
                  {employeeNumber && organization ? " · " : null}
                  {organization || null}
                  {!employeeNumber && !organization ? "Account details" : null}
                </p>
              </div>
            </div>
            <div className="user-profile-actions">
              {isEditing ? (
                <>
                  <button
                    className="user-profile-action is-cancel"
                    disabled={isSaving}
                    onClick={cancelEditing}
                    type="button"
                  >
                    <X aria-hidden="true" size={15} />
                    Cancel
                  </button>
                  <button
                    className="user-profile-action is-save"
                    disabled={isSaving}
                    onClick={saveProfile}
                    type="button"
                  >
                    <Check aria-hidden="true" size={15} />
                    {isSaving ? "Saving…" : "Save"}
                  </button>
                </>
              ) : (
                <button
                  aria-label="Edit profile"
                  className="user-profile-action is-edit"
                  onClick={startEditing}
                  type="button"
                >
                  <Pencil aria-hidden="true" size={15} />
                  Edit
                </button>
              )}
            </div>
          </section>

          {saveError ? (
            <div className="user-profile-message is-error" role="alert">
              {saveError}
            </div>
          ) : null}

          <div className="user-profile-grid">
            {profileSections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <section
                  className={`user-profile-card is-${section.className}`}
                  key={section.title}
                >
                  <h2 className="user-profile-card-heading">
                    <SectionIcon
                      className="user-profile-section-icon"
                      aria-hidden="true"
                      size={17}
                    />
                    {section.title}
                  </h2>
                  <div className="user-profile-fields">
                    {section.fields.map((field) => (
                      <ProfileField
                        key={field.label}
                        field={field}
                        profile={profile}
                        isEditing={isEditing}
                        draftProfile={draftProfile}
                        onDraftChange={(key, value) =>
                          setDraftProfile((current) => ({ ...current, [key]: value }))
                        }
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        .user-profile {
          --profile-ink: #111827;
          --profile-muted: #687386;
          --profile-line: #e2e5e9;
          --profile-green: #188638;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          color: var(--profile-ink);
          font-family: "Google Sans", Arial, sans-serif;
          font-synthesis: none;
        }

        .user-profile-summary,
        .user-profile-card,
        .user-profile-message {
          border: 1px solid var(--profile-line);
          border-radius: 12px;
          background: #fff;
        }

        .user-profile-summary {
          display: flex;
          min-height: 68px;
          align-items: center;
          gap: 16px;
          padding: 9px 16px;
          margin-bottom: 10px;
        }

        .user-profile-actions {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 8px;
        }

        .user-profile-action {
          display: inline-flex;
          min-height: 34px;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 11px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
        }

        .user-profile-action.is-save {
          border-color: #2463bd;
          background: #2463bd;
          color: #fff;
        }

        .user-profile-action.is-edit {
          border-color: #d3e1f4;
          color: #2463bd;
        }

        .user-profile-action.is-edit:hover {
          background: #f1f6ff;
        }

        .user-profile-action.is-save:hover:not(:disabled) {
          border-color: #194f9e;
          background: #194f9e;
        }

        .user-profile-action.is-cancel {
          border-color: #d5d9e0;
          color: #384152;
        }

        .user-profile-action.is-cancel:hover:not(:disabled) {
          background: #f4f6f8;
        }

        .user-profile-action:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .user-profile-identity {
          display: flex;
          min-width: 200px;
          flex: 1 1 auto;
          align-items: center;
          gap: 12px;
        }

        .user-profile-avatar {
          display: grid;
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          place-items: center;
          border-radius: 50%;
          background: #ccebd0;
          color: #087b2b;
          font-size: 15px;
          font-weight: 700;
        }

        .user-profile-identity-copy {
          min-width: 0;
        }

        .user-profile-identity-copy h1 {
          overflow-wrap: anywhere;
          margin: 0 0 2px;
          color: #111827;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.25;
        }

        .user-profile-identity-copy p {
          overflow-wrap: anywhere;
          margin: 0;
          color: #384152;
          font-size: 14px;
          line-height: 1.3;
        }

        .user-profile-badges {
          display: flex;
          flex: 0 1 auto;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 6px;
        }

        .user-profile-badge {
          display: inline-flex;
          min-height: 19px;
          align-items: center;
          justify-content: center;
          padding: 2px 9px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.2;
          white-space: nowrap;
        }

        .user-profile-badge.is-green {
          background: #ccebd0;
          color: #087b2b;
        }

        .user-profile-badge.is-blue {
          background: #d2e3ff;
          color: #1555ad;
        }

        .user-profile-badge.is-muted {
          background: #eef0f3;
          color: #687386;
        }

        .user-profile-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: stretch;
          gap: 10px 12px;
        }

        .user-profile-card {
          min-width: 0;
          padding: 11px 16px 12px;
        }

        .user-profile-card.is-login {
          grid-column: 1 / -1;
        }

        .user-profile-card-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 8px;
          color: #111827;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.3;
        }

        .user-profile-section-icon {
          flex: 0 0 auto;
          color: var(--profile-green);
          stroke-width: 2;
        }

        .user-profile-card.is-contact .user-profile-section-icon,
        .user-profile-card.is-organization .user-profile-section-icon {
          color: #2463bd;
        }

        .user-profile-card.is-access .user-profile-section-icon,
        .user-profile-card.is-login .user-profile-section-icon {
          color: #a66b00;
        }

        .user-profile-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-content: start;
          overflow: hidden;
          border: 1px solid #c9cdd2;
          border-radius: 8px;
          background: #fff;
        }

        .user-profile-card.is-login .user-profile-fields {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .user-profile-field {
          display: grid;
          min-width: 0;
          align-content: start;
          gap: 2px;
          padding: 7px 10px;
          background: #fff;
          border-right: 1px solid #c9cdd2;
          border-bottom: 1px solid #c9cdd2;
        }

        .user-profile-field.is-editing {
          gap: 4px;
        }

        .user-profile-edit-value {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 5px;
          border-bottom: 1px solid #2463bd;
        }

        .user-profile-field-input {
          width: 100%;
          min-width: 0;
          padding: 1px 0 3px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #111827;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.3;
        }

        .user-profile-field-input:focus-visible {
          box-shadow: 0 1px 0 #2463bd;
        }

        .user-profile-edit-pencil {
          flex: 0 0 auto;
          color: #2463bd;
        }

        .user-profile-fields > .user-profile-field:nth-child(2n) {
          border-right: 0;
        }

        .user-profile-fields > .user-profile-field:nth-last-child(-n + 2) {
          border-bottom: 0;
        }

        .user-profile-card.is-login
          .user-profile-fields
          > .user-profile-field:nth-child(2n) {
          border-right: 1px solid #c9cdd2;
        }

        .user-profile-card.is-login
          .user-profile-fields
          > .user-profile-field:nth-child(4n) {
          border-right: 0;
        }

        .user-profile-card.is-login
          .user-profile-fields
          > .user-profile-field:nth-last-child(-n + 4) {
          border-bottom: 0;
        }

        .user-profile-field-label {
          overflow-wrap: anywhere;
          color: #384152;
          font-size: 13px;
          line-height: 1.25;
        }

        .user-profile-field-value {
          overflow-wrap: anywhere;
          color: #111827;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.3;
          text-decoration: none;
        }

        a.user-profile-field-value:hover {
          color: #176a36;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .user-profile-field-value.is-boolean {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          padding: 1px 8px;
          border-radius: 7px;
          background: #ccebd0;
          color: #087b2b;
          font-size: 11px;
          font-weight: 500;
        }

        .user-profile-field-value.is-boolean.is-disabled {
          background: #eef0f3;
          color: #687386;
        }

        .user-profile-field-value.is-missing {
          color: #7b8492;
          font-weight: 400;
        }

        .user-profile-message {
          padding: 18px;
          color: var(--profile-muted);
          font-size: 15px;
        }

        .user-profile-message.is-error {
          border-color: #f1c5c5;
          color: #a12c2c;
        }

        @media (min-width: 761px) and (max-height: 760px) {
          .user-profile-summary {
            min-height: 58px;
            margin-bottom: 8px;
          }

          .user-profile-card {
            padding-top: 8px;
            padding-bottom: 9px;
          }

          .user-profile-fields {
            row-gap: 1px;
          }

          .user-profile-grid {
            gap: 8px 10px;
          }
        }

        @media (max-width: 760px) {
          .user-profile-summary {
            align-items: center;
            padding: 13px;
          }

          .user-profile-identity {
            min-width: 0;
          }

          .user-profile-badges {
            justify-content: flex-start;
            padding-left: 56px;
          }

          .user-profile-card.is-login .user-profile-fields {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .user-profile-card.is-login
            .user-profile-fields
            > .user-profile-field:nth-child(4n) {
            border-right: 1px solid #c9cdd2;
          }

          .user-profile-card.is-login
            .user-profile-fields
            > .user-profile-field:nth-child(2n) {
            border-right: 0;
          }

          .user-profile-card.is-login
            .user-profile-fields
            > .user-profile-field:nth-last-child(-n + 4) {
            border-bottom: 1px solid #c9cdd2;
          }

          .user-profile-card.is-login
            .user-profile-fields
            > .user-profile-field:nth-last-child(-n + 2) {
            border-bottom: 0;
          }
        }

        @media (max-width: 560px) {
          .user-profile-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .user-profile-card.is-login {
            grid-column: auto;
          }
        }

        @media (max-width: 380px) {
          .user-profile-summary {
            padding: 12px;
          }

          .user-profile-action {
            min-height: 32px;
            padding-right: 8px;
            padding-left: 8px;
          }

          .user-profile-identity {
            min-width: 0;
            gap: 10px;
          }

          .user-profile-avatar {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .user-profile-badges {
            padding-left: 50px;
          }

          .user-profile-fields,
          .user-profile-card.is-login .user-profile-fields {
            grid-template-columns: minmax(0, 1fr);
          }

          .user-profile-fields > .user-profile-field,
          .user-profile-card.is-login
            .user-profile-fields
            > .user-profile-field {
            border-right: 0;
            border-bottom: 1px solid #c9cdd2;
          }

          .user-profile-fields > .user-profile-field:last-child,
          .user-profile-card.is-login
            .user-profile-fields
            > .user-profile-field:last-child {
            border-bottom: 0;
          }
        }
      `}</style>
    </main>
  );
}
