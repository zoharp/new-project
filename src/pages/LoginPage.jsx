import { useState } from 'react'
import { LoginForm } from '../components/Auth/LoginForm'
import { SignupForm } from '../components/Auth/SignupForm'

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cold Call Guide</h1>
          <p className="text-gray-600">Master the founder cold call script</p>
        </div>

        <div className="space-y-4">
          {isSignUp ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Account</h2>
              <SignupForm />
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Sign In
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign In</h2>
              <LoginForm />
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
