'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Invalid password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray">
      <div className="bg-brand-white p-10 w-full max-w-sm space-y-8">
        <div>
          <h1 className="font-serif text-2xl text-brand-black tracking-widest">Legacy</h1>
          <p className="text-xs font-sans text-brand-muted mt-1 tracking-widest uppercase">
            Admin Panel
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            autoFocus
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
