import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useApi — fetches data from any async function on mount.
 *
 * @param {Function} fetcher  — async fn that returns data (called on mount)
 * @param {any[]}    deps     — re-fetch when these change
 * @param {object}   options  — { immediate: bool, initialData }
 */
// import { useState, useEffect, useCallback, useRef } from 'react'

export function useApi(fetcher, deps = [], options = {}) {
  const { immediate = true, initialData = [] } = options

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mountedRef = useRef(true)
  const calledRef = useRef(false)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = async (...args) => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetcher(...args)

      if (mountedRef.current) {
        setData(result || [])
      }

    } catch (err) {
      if (mountedRef.current) {
        setError(err?.message || "Something went wrong")
        setData([])
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (immediate && !calledRef.current) {
      calledRef.current = true
      execute()
    }
  }, deps)

  return { data, loading, error, refetch: execute }
}
/**
 * useMutation — fires on demand (form submit, button click).
 * Returns [mutate, { loading, error }]
 */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutationFn(...args)
      return result
    } catch (err) {
      const msg = err?.message || 'Something went wrong'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [mutationFn])

  return [mutate, { loading, error }]
}
