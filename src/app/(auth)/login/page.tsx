"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push("/admin/dashboard")
      }
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const supabase = createClient()
    
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else if (data.user) {
      router.push("/admin/dashboard")
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please enter email and password")
      return
    }
    
    setLoading(true)
    setError("")
    
    const supabase = createClient()
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0],
          role: "admin",
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
    } else if (data.user) {
      setSuccess("Account created! You can now sign in.")
    } else if (data.session) {
      router.push("/admin/dashboard")
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-container">
      {/* Left Side - Brand Section */}
      <div className="auth-brand-section">
        <div className="auth-brand-bg">
          <div className="auth-brand-gradient" />
          <div className="auth-brand-pattern" />
        </div>
        
        <div className="auth-brand-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <span>AD</span>
            </div>
            <span className="auth-logo-text">Architech Designs</span>
          </div>
          
          <div className="auth-brand-text">
            <p className="auth-tagline">Client Portal & CRM</p>
            <h1 className="auth-heading">Manage projects, approvals, invoices, and growth — all in one place.</h1>
            <p className="auth-description">
              Enterprise-grade project management built for high-performance agencies and their clients.
            </p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <CheckCircle className="auth-feature-icon" />
              <span>Real-time project tracking</span>
            </div>
            <div className="auth-feature">
              <CheckCircle className="auth-feature-icon" />
              <span>Seamless approval workflows</span>
            </div>
            <div className="auth-feature">
              <CheckCircle className="auth-feature-icon" />
              <span>Transparent invoicing</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          <p>© {new Date().getFullYear()} Architech Designs LLC</p>
        </div>
      </div>

      {/* Right Side - Login Card */}
      <div className="auth-form-section">
        <div className="auth-card-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <div className="auth-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h2 className="auth-card-title">Welcome back</h2>
              <p className="auth-card-subtitle">Sign in to your Architech Client Portal</p>
            </div>
            
            <form onSubmit={handleLogin} className="auth-form">
              {error && (
                <div className="auth-error">
                  <AlertCircle className="auth-error-icon" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="auth-success">
                  <CheckCircle className="auth-success-icon" />
                  <span>{success}</span>
                </div>
              )}
            
              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="auth-input"
                  autoComplete="email"
                />
              </div>
            
              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  <button type="button" className="auth-forgot">Forgot password?</button>
                </div>
                <div className="auth-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="auth-input auth-input-password"
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-remember">
                <label className="auth-checkbox">
                  <input type="checkbox" />
                  <span className="auth-checkbox-mark" />
                  <span className="auth-checkbox-label">Remember me</span>
                </label>
              </div>
            
              <button 
                type="submit" 
                disabled={loading}
                className="auth-submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="auth-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <p>Don&apos;t have an account?</p>
              <button 
                onClick={handleSignUp}
                disabled={loading}
                className="auth-signup-link"
              >
                Create account
              </button>
            </div>
          </div>

          <p className="auth-support">
            Need access? Contact your account manager or email support@architech.design
          </p>
        </div>
      </div>
    </div>
  )
}