"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
    } else if (data.user) {
      router.push("/admin/dashboard")
    }
    
    setLoading(false)
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0A2540 0%, #1E3A5F 50%, #0A2540 100%)", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, #3B82F6, #60A5FA)", borderRadius: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "0 8px 32px rgba(59, 130, 246, 0.4)" }}>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "white", letterSpacing: "-1px" }}>AD</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "8px", letterSpacing: "-0.5px" }}>Architech Designs</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px" }}>Client Portal & Operations CRM</p>
        </div>

        {/* Login Card */}
        <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)", padding: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#0F172A", marginBottom: "24px", textAlign: "center" }}>Sign in to your account</h2>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {error && (
              <div style={{ padding: "12px 16px", background: "#FEF2F2", borderRadius: "8px", color: "#DC2626", fontSize: "14px", border: "1px solid #FECACA" }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{ padding: "12px 16px", background: "#ECFDF5", borderRadius: "8px", color: "#059669", fontSize: "14px", border: "1px solid #A7F3D0" }}>
                {success}
              </div>
            )}
          
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "15px", transition: "all 0.2s" }}
              />
            </div>
          
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "15px", transition: "all 0.2s" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: "14px", 
                background: loading ? "#1E3A5F" : "#0A2540", 
                color: "white", 
                borderRadius: "10px", 
                fontWeight: "600", 
                fontSize: "15px", 
                cursor: loading ? "not-allowed" : "pointer", 
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "8px"
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite", width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none">
                    <circle style={{ opacity: "0.25" }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: "0.75" }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #E2E8F0" }}>
            <p style={{ textAlign: "center", fontSize: "13px", color: "#64748B" }}>
              Don&apos;t have an account?{" "}
              <button 
                onClick={handleSignUp}
                disabled={loading}
                style={{ background: "none", border: "none", color: "#3B82F6", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
              >
                Create account
              </button>
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px", marginTop: "24px" }}>
          © {new Date().getFullYear()} Architech Designs LLC. All rights reserved.
        </p>
      </div>
    </div>
  )
}