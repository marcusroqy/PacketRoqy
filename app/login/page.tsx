'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TopologyLogo } from '@/components/icons/DeviceIcons'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const router   = useRouter()
  const [mode, setMode]       = useState<Mode>('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const sb = createClient()

    if (mode === 'register') {
      const { error: err } = await sb.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      })
      if (err) { setError(err.message); setLoading(false); return }
      setDone(true)
    } else {
      const { error: err } = await sb.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="auth-root">
      {/* background grid */}
      <div className="auth-grid" aria-hidden />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <TopologyLogo className="w-7 h-7 auth-logo-icon" />
          <span className="auth-logo-text">PacketRoqy</span>
        </div>

        {done ? (
          <div className="auth-done">
            <div className="auth-done-title">Confirme seu e-mail</div>
            <div className="auth-done-sub">
              Enviamos um link de confirmação para <strong>{email}</strong>.
              Verifique sua caixa de entrada e clique no link para ativar sua conta.
            </div>
            <button className="auth-btn" onClick={() => { setDone(false); setMode('login') }}>
              Voltar ao login
            </button>
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <button className={`auth-tab${mode === 'login' ? ' active' : ''}`} onClick={() => { setMode('login'); setError('') }}>
                Entrar
              </button>
              <button className={`auth-tab${mode === 'register' ? ' active' : ''}`} onClick={() => { setMode('register'); setError('') }}>
                Criar conta
              </button>
            </div>

            <form onSubmit={submit} className="auth-form">
              {mode === 'register' && (
                <div className="auth-field">
                  <label className="auth-label">Nome</label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Seu nome" className="auth-input"
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="auth-field">
                <label className="auth-label">E-mail</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="voce@email.com" className="auth-input"
                  autoComplete="email"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Senha</label>
                <input
                  type="password" required value={password} onChange={e => setPass(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  className="auth-input" autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  minLength={6}
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
