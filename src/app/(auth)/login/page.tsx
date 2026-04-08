"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowRight, Shield, Clock, FileText } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #E2E8F0", borderTopColor: "#0A2540", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  return (
    <div className="auth-container">
      {/* Left Side - Brand Section */}
      <div className="auth-brand-section">
        <div className="auth-brand-bg">
          <div className="auth-brand-gradient" />
          <div className="auth-brand-pattern" />
          <div className="auth-brand-glow" />
        </div>
        
        <div className="auth-brand-content">
          <div className="auth-logo">
            <div className="auth-logo-image">
              <Image 
                src="/architech-logo.png" 
                alt="Architech Designs" 
                width={220}
                height={60}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            </div>
            <span className="auth-logo-tagline">Client Portal & CRM</span>
          </div>
          
          <div className="auth-brand-text">
            <h1 className="auth-heading">Manage projects, approvals, invoices, and growth — all in one place.</h1>
            <p className="auth-description">
              Enterprise-grade project management built for high-performance agencies and their premium clients.
            </p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon"><Clock size={18} /></div>
              <div>
                <span className="auth-feature-title">Real-time Updates</span>
                <span className="auth-feature-desc">Track project progress instantly</span>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon"><FileText size={18} /></div>
              <div>
                <span className="auth-feature-title">Transparent Invoicing</span>
                <span className="auth-feature-desc">View and pay invoices online</span>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon"><Shield size={18} /></div>
              <div>
                <span className="auth-feature-title">Secure Access</span>
                <span className="auth-feature-desc">Enterprise-grade security</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          <p>© {new Date().getFullYear()} Architech Designs LLC</p>
          <p className="auth-brand-tagline-footer">Premium Client Experience</p>
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
              <p className="auth-card-subtitle">Sign in to your client portal</p>
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
                <label className="auth-label" htmlFor="email">Email address</label>
                <input
                  id="email"
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
                  <label className="auth-label" htmlFor="password">Password</label>
                </div>
                <div className="auth-input-wrapper">
                  <input
                    id="password"
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-row">
                <div className="auth-remember">
                  <label className="auth-checkbox">
                    <input type="checkbox" />
                    <span className="auth-checkbox-mark" />
                    <span className="auth-checkbox-label">Remember me</span>
                  </label>
                </div>
                <button type="button" className="auth-forgot">Forgot password?</button>
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
                    Sign in to portal
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <p>Need access? Contact your account manager or email</p>
              <a href="mailto:support@architech.design" className="auth-support-link">
                support@architech.design
              </a>
            </div>
          </div>

          <p className="auth-secure-note">
            <Shield size={14} />
            Secure client portal access
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}