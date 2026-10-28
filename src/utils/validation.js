export function isRequired(value) {
  return String(value ?? '').trim().length > 0;
}

const inputPatterns = {
  empNo: /[^a-zA-Z0-9_-]/g,
  firstName: /[^\p{L}\p{M} .'-]/gu,
  middleName: /[^\p{L}\p{M} .'-]/gu,
  lastName: /[^\p{L}\p{M} .'-]/gu,
  userName: /[^a-zA-Z0-9._-]/g,
  email: /[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~@%-]/g,
  idleTimeout: /[^0-9]/g,
  badLogins: /[^0-9]/g,
};

const inputMaxLengths = {
  empNo: 20,
  firstName: 50,
  middleName: 50,
  lastName: 50,
  userName: 30,
  password: 128,
  email: 254,
  idleTimeout: 5,
  badLogins: 2,
};

export function filterUserInput(field, value) {
  const pattern = inputPatterns[field];
  const filteredValue = pattern ? value.replace(pattern, '') : value;

  const maxLength = inputMaxLengths[field];
  return maxLength ? filteredValue.slice(0, maxLength) : filteredValue;
}

export function filterMobileInput(value) {
  if (/^\d{0,10}$/.test(value) || /^0\d{0,10}$/.test(value)) {
    return value;
  }

  if (/^\+(?:9(?:1\d{0,10})?)?$/.test(value)) {
    return value;
  }

  return null;
}

export function normalizeIndianMobile(value) {
  const mobile = String(value ?? '');
  if (mobile.startsWith('+91')) return mobile.slice(3);
  if (mobile.startsWith('0')) return mobile.slice(1);
  return mobile;
}

export function isValidEmployeeName(value) {
  return /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u.test(String(value ?? '').trim());
}

/**
 * Returns dynamic YYYY-MM-DD date representing exactly 18 years before today.
 * Adapts automatically to future years without needing any code changes.
 */
export function getMaxDateFor18YearsOld() {
  const today = new Date();
  const year = today.getFullYear() - 18;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates accurate age based on today's current date.
 */
export function calculateAge(dobString) {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return 0;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Validates if the given DOB has completed at least 18 years as of today.
 */
export function isAtLeast18YearsOld(dobString) {
  if (!dobString) return false;
  const maxDate = getMaxDateFor18YearsOld();
  return dobString <= maxDate;
}

/**
 * Validates a normalized 10-digit Indian mobile number starting with 6-9.
 */
export function isValidMobile(mobile) {
  if (!mobile) return false;
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(mobile));
}

/**
 * Validates a conventional RFC 5322 dot-atom email address and DNS-style domain.
 * This checks syntax only; it does not verify that a domain or mailbox exists.
 */
export function isValidEmail(email) {
  const address = String(email ?? '').trim();
  if (!address || address.length > 254) return false;

  const atIndex = address.indexOf('@');
  if (atIndex <= 0 || atIndex !== address.lastIndexOf('@')) return false;

  const local = address.slice(0, atIndex);
  const domain = address.slice(atIndex + 1);
  const atom = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";

  if (local.length > 64 || !new RegExp(`^${atom}(?:\\.${atom})*$`).test(local)) {
    return false;
  }

  if (domain.length > 253) return false;
  const labels = domain.split('.');
  if (labels.length < 2 || labels.some((label) => label.length > 63)) return false;

  const validLabel = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;
  if (labels.some((label) => !validLabel.test(label))) return false;

  const topLevelDomain = labels[labels.length - 1];
  return /^[A-Za-z]{2,63}$/.test(topLevelDomain) ||
    /^xn--[A-Za-z0-9-]{2,59}$/i.test(topLevelDomain);
}

/**
 * Validates password complexity:
 * - At least 8 characters
 * - At most 128 characters
 * - At least 3 of 4 character groups
 */
export function validatePasswordStrength(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must contain at least 8 characters.';
  if (password.length > 128) return 'Password must not exceed 128 characters.';

  const groups = [
    { label: 'uppercase letters', pattern: /[A-Z]/ },
    { label: 'lowercase letters', pattern: /[a-z]/ },
    { label: 'numbers', pattern: /[0-9]/ },
    { label: 'special characters', pattern: /[^A-Za-z0-9\s]/ },
  ];
  const includedGroups = groups.filter(({ pattern }) => pattern.test(password));

  if (includedGroups.length < 3) {
    const missingGroups = groups
      .filter(({ pattern }) => !pattern.test(password))
      .map(({ label }) => label);
    return `Password must include at least 3 of these 4 groups: uppercase letters, lowercase letters, numbers, and special characters. Add at least one of: ${missingGroups.join(', ')}.`;
  }

  return '';
}