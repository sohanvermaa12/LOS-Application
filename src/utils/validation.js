export function isRequired(value) {
  return String(value ?? '').trim().length > 0;
}

const inputPatterns = {
  empNo: /[^a-zA-Z0-9_-]/g,
  firstName: /[^\p{L}\p{M} .'-]/gu,
  middleName: /[^\p{L}\p{M} .'-]/gu,
  lastName: /[^\p{L}\p{M} .'-]/gu,
  userName: /[^a-zA-Z0-9._-]/g,
  email: /[^a-zA-Z0-9._%@+-]/g,
  mobile: /[^0-9]/g,
  idleTimeout: /[^0-9]/g,
  badLogins: /[^0-9]/g,
};

const inputMaxLengths = {
  empNo: 20,
  firstName: 100,
  middleName: 100,
  lastName: 100,
  userName: 30,
  email: 254,
  mobile: 10,
  idleTimeout: 5,
  badLogins: 2,
};

export function filterUserInput(field, value) {
  const pattern = inputPatterns[field];
  if (!pattern) return value;
  return value.replace(pattern, '').slice(0, inputMaxLengths[field]);
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
 * Validates 10-digit Indian mobile number starting with 7, 8, or 9.
 */
export function isValidMobile(mobile) {
  if (!mobile) return false;
  return /^[789]\d{9}$/.test(String(mobile).trim());
}

/**
 * Validates standard email address format.
 */
export function isValidEmail(email) {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email).trim());
}

/**
 * Validates password complexity:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special symbol
 */
export function validatePasswordStrength(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must contain at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&* etc.).';
  }
  return '';
}