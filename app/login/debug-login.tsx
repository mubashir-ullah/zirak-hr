'use client'

import { useState } from 'react'

export default function DebugLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleTestLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/login/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()
      setResult({
        status: response.status,
        statusText: response.statusText,
        data,
      })
    } catch (error) {
      console.error('Error testing login:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow-lg">
      <h1 className="text-xl font-bold mb-4">Debug Login</h1>
      <p className="text-sm text-gray-500 mb-4">
        This tool helps troubleshoot login issues by testing your credentials against the API.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          onClick={handleTestLogin}
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}
        
        {result && (
          <div className="mt-4">
            <h2 className="font-bold text-lg">Result:</h2>
            <div className="p-3 bg-gray-100 rounded overflow-auto max-h-80">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 