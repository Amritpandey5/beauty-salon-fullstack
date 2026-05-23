import { useState, useCallback } from 'react'
import { getFieldError } from '../utils/validation'

export function useForm(initialValues, validationRules = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setValues(prev => ({ ...prev, [name]: newValue }))
    if (touched[name] && validationRules[name]) {
      const err = getFieldError(name, newValue, validationRules[name])
      setErrors(prev => ({ ...prev, [name]: err }))
    }
  }, [touched, validationRules])

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    if (validationRules[name]) {
      const err = getFieldError(name, value, validationRules[name])
      setErrors(prev => ({ ...prev, [name]: err }))
    }
  }, [validationRules])

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const validate = useCallback(() => {
    const newErrors = {}
    const allTouched = {}
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true
      const err = getFieldError(field, values[field], validationRules[field])
      if (err) newErrors[field] = err
    })
    setTouched(allTouched)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values, validationRules])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e?.preventDefault()
    const isValid = validate()
    if (!isValid) return
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [validate, values])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    reset,
  }
}
