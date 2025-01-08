export function validatePassword(password: FormDataEntryValue | null) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password as string);
  const hasLowercase = /[a-z]/.test(password as string);
  const hasNumber = /[0-9]/.test(password as string);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password as string);

  if ((password as string).length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  if (!hasUppercase) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!hasLowercase) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!hasNumber) {
    return 'Password must contain at least one number.';
  }
  if (!hasSpecialChar) {
    return 'Password must contain at least one special character.';
  }
  return null;
};