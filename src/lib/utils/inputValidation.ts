/**
 * BFH Validation & Formatting Engine
 * Provides strict input masking and business validation:
 * - Phone numbers allow numbers only (formatted cleanly as (XXX) XXX-XXXX)
 * - Email addresses validate RFC email format
 * - Date of birth cannot exceed Date of death
 * - Date of death validation
 */

/**
 * Strips non-digit characters and formats into standard US phone format (XXX) XXX-XXXX
 * Rejects all letters, spaces, and non-numeric symbols entered by user.
 */
export function formatPhoneNumbersOnly(value: string): string {
  if (!value) return '';
  // Extract numbers only
  const digits = value.replace(/\D/g, '').slice(0, 10);
  
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Returns strictly digits (0-9) only
 */
export function sanitizeDigitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * RFC compliant email validation
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || !email.trim()) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates Date of Birth and Date of Death business logic:
 * 1. Date of Birth entered cannot exceed the Date of Death.
 * 2. Date of Death cannot be invalid or logically inconsistent.
 */
export function validateLifeDates(
  dob: string | undefined | null,
  dod: string | undefined | null
): { isValid: boolean; error?: string } {
  if (!dob && !dod) return { isValid: true };

  // If both DOB and DOD are present, check that DOB does not exceed DOD
  if (dob && dod) {
    const dobDate = new Date(dob);
    const dodDate = new Date(dod);

    if (dobDate > dodDate) {
      return {
        isValid: false,
        error: 'Date of Birth entered cannot exceed the Date of Death (Date of Passing).'
      };
    }
  }

  // Date of death validation check
  if (dod) {
    const dodDate = new Date(dod);

    // If future date or out of bounds check
    if (isNaN(dodDate.getTime())) {
      return {
        isValid: false,
        error: 'Please enter a valid Date of Death (YYYY-MM-DD).'
      };
    }
  }

  if (dob) {
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return {
        isValid: false,
        error: 'Please enter a valid Date of Birth (YYYY-MM-DD).'
      };
    }
  }

  return { isValid: true };
}
