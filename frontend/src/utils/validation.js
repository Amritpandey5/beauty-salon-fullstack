export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone) {
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone)
}

export function validateRequired(value) {
  return value && value.trim().length > 0
}

export function validateMinLength(value, min) {
  return value && value.length >= min
}

export function getFieldError(field, value, rules = {}) {
  if (rules.required && !validateRequired(value)) {
    return `${field} is required`
  }
  if (rules.email && !validateEmail(value)) {
    return 'Please enter a valid email address'
  }
  if (rules.phone && !validatePhone(value)) {
    return 'Please enter a valid phone number'
  }
  if (rules.minLength && !validateMinLength(value, rules.minLength)) {
    return `${field} must be at least ${rules.minLength} characters`
  }
  return null
}
