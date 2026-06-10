import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export function VerifyEmail() {
  const { verifiyEmail ,resendVerification} = useAuth()
  const { addToast } = useToast()

  const [status, setStatus] = useState('Verifying...')
  const [loading, setLoading] = useState(true)

  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const token = params.get('token')

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        if (!id || !token) {
          throw new Error('Invalid verification link')
        }

        await verifiyEmail(id, token)

        setStatus('Email verified successfully! Redirecting...')
        addToast('Email verified successfully!', 'success')

        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } catch (err) {
        setStatus(err.message || 'Verification failed')
        addToast(err.message || 'Email verification failed', 'error')
      } finally {
        setLoading(false)
      }
    }

    verifyUserEmail()
  }, [id, token, verifiyEmail, addToast])

  const handleResend = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await resendVerification(id)
        addToast('Verification email resent! Please check your inbox.', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to resend verification email', 'error')
    }   
    finally {
      setLoading(false)
    }   
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md text-center w-[90%] max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Email Verification
        </h2>

        <p className="mb-6 text-gray-600 dark:text-gray-300">
          {status}
        </p>

        {!loading && !status.includes('successfully') && (
          <button
            onClick={handleResend}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Resend Verification Email
          </button>
        )}

      </div>
    </div>
  )
}