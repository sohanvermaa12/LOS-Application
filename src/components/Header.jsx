'use client';

import { useEffect, useState } from 'react';
import { Bell, LogOut, Menu, CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import { logout, LOGOUT_PENDING_KEY } from '../services/login';
import { getBankProfile } from '../services/bankProfile';
import { getUserProfile } from '../services/user_profile';

let headerDetailsCache = null;

export default function Header({ menuOpen, onMenu }) {
  const [details, setDetails] = useState(getInitialHeaderDetails);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    loadHeaderDetails().then((headerDetails) => {
      if (isCurrent) setDetails(headerDetails);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleLogout = async () => {
    window.sessionStorage.setItem(LOGOUT_PENDING_KEY, 'true');
    try {
      await logout();
    } catch {
      console.error('Unable to complete server logout; completing local sign-out.');
    } finally {
      window.localStorage.removeItem('authData');
      headerDetailsCache = null;
      window.location.replace('/login');
    }
  };

  const { profile, bank, profileError, bankError, profileLoaded, bankLoaded } = details;
  const bankName = firstText(
    bank?.bank_name,
    bank?.name,
    bank?.legal_name,
    profile?.organization_name,
    profile?.bank_name,
  ) || (bankLoaded ? 'Bank information unavailable' : 'Loading bank...');
  const logo = firstText(bank?.logo_url, bank?.bank_logo, bank?.logo);
  const initials = bankName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'B';
  const branch = firstText(
    profile?.login_branch,
    profile?.login_branch_name,
    profile?.loginBranch,
    profile?.branch_name,
    profile?.branch,
  ) || getUnavailableValue(profileLoaded, profileError);
  const role = firstText(profile?.user_role, profile?.role, profile?.role_name)
    || getUnavailableValue(profileLoaded, profileError);
  const designation = firstText(profile?.designation_name)
    || getUnavailableValue(profileLoaded, profileError);

  return (
    <header className="topbar">
      <button
        className="icon-button menu-trigger"
        type="button"
        onClick={onMenu}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-controls="app-sidebar"
        aria-expanded={menuOpen}
      >
        <Menu size={20} />
      </button>
      <div className="header-identity">
        <div className="header-bank-mark" title={bankError || undefined}>
          {logo && !logoFailed ? (
            <img src={logo} alt={`${bankName} logo`} onError={() => setLogoFailed(true)} />
          ) : (
            <span aria-label={`${bankName} initials`}>{initials}</span>
          )}
        </div>
        <strong className="header-bank-name" title={bankName}>{bankName}</strong>
      </div>
      <div className="header-user-details">
        <HeaderDetail label="Login Branch" value={branch} error={profileError} />
        <HeaderDetail label="User Role" value={role} error={profileError} />
        <HeaderDetail label="Designation" value={designation} error={profileError} />
      </div>
      <div className="top-actions">
        <Link className="icon-button profile-button" href="/profile" aria-label="User profile" title="User profile">
          <CircleUserRound size={19} />
        </Link>
        <button className="icon-button logout-button" type="button" onClick={handleLogout} aria-label="Logout" title="Logout">
          <LogOut size={19} />
        </button>
        <button className="icon-button notification" type="button" aria-label="Notifications">
          <Bell size={19} /><i />
        </button>
      </div>
    </header>
  );
}

function HeaderDetail({ label, value, error }) {
  return (
    <div className="header-detail" title={error || undefined}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function firstText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim();
}

function getUnavailableValue(loaded, error) {
  if (!loaded) return 'Loading...';
  return error ? 'Unavailable' : '—';
}

function getInitialHeaderDetails() {
  if (typeof window === 'undefined') return emptyHeaderDetails();

  const authData = window.localStorage.getItem('authData') || '';
  return headerDetailsCache?.authData === authData
    ? headerDetailsCache.details || emptyHeaderDetails()
    : emptyHeaderDetails();
}

function emptyHeaderDetails() {
  return {
    profile: null,
    bank: null,
    profileError: '',
    bankError: '',
    profileLoaded: false,
    bankLoaded: false,
  };
}

function loadHeaderDetails() {
  const authData = window.localStorage.getItem('authData') || '';

  if (headerDetailsCache?.authData === authData) {
    if (headerDetailsCache.details) return Promise.resolve(headerDetailsCache.details);
    if (headerDetailsCache.promise) return headerDetailsCache.promise;
  }

  const cache = { authData, details: null, promise: null };
  headerDetailsCache = cache;
  cache.promise = Promise.allSettled([getUserProfile(), getBankProfile()]).then(
    ([profileResult, bankResult]) => {
      const details = {
        profile: profileResult.status === 'fulfilled' ? profileResult.value : null,
        bank: bankResult.status === 'fulfilled'
          ? bankResult.value?.data || bankResult.value || null
          : null,
        profileError: profileResult.status === 'rejected'
          ? profileResult.reason?.message || 'Unable to load user details.'
          : '',
        bankError: bankResult.status === 'rejected'
          ? bankResult.reason?.message || 'Unable to load bank details.'
          : '',
        profileLoaded: true,
        bankLoaded: true,
      };

      if (headerDetailsCache === cache) {
        cache.details = details;
        cache.promise = null;
      }

      return details;
    },
  );

  return cache.promise;
}