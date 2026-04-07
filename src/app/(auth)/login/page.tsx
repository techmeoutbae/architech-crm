"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("lillian@architechdesigns.net")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [debug, setDebug] = useState("")

  useEffect(() => {
    // Check if already logged in
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
    setDebug("Starting...")

    const supabase = createClient()
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setDebug("Error: " + signInError.message)
      } else if (data.user) {
        setDebug("Success! Redirecting...")
        router.push("/admin/dashboard")
      } else {
        setError("Login failed - no user returned")
      }
    } catch (err: any) {
      setError("Exception: " + err.message)
      setDebug("Exception: " + err.message)
    }
    
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0A2540, #1E3A5F, #0A2540)", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "4rem", height: "4rem", background: "#3B82F6", borderRadius: "0.75rem", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>AD</span>
          </div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "white" }}>Architech Designs</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "0.5rem" }}>Client Portal & CRM</p>
        </div>

        <div style={{ background: "white", borderRadius: "0.75rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", padding: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Welcome back</h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && (
              <div style={{ padding: "0.75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", color: "#dc2626", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}
            
            {debug && !error && (
              <div style={{ padding: "0.5rem", background: "#eff6ff", borderRadius: "0.375rem", color: "#2563eb", fontSize: "0.75rem", fontFamily: "monospace" }}>
                {debug}
              </div>
            )}
          
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="email" style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ height: "2.75rem", padding: "0 0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
              />
            </div>
          
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="password" style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ height: "2.75rem", padding: "0 0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ height: "2.75rem", background: loading ? "#1e40af" : "#0A2540", color: "white", borderRadius: "0.5rem", fontWeight: "500", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite", width: "1rem", height: "1rem" }} viewBox="0 0 24 24" fill="none">
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

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
            Don&apos;t have an account? Contact the administrator.
          </p>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginTop: "1.5rem" }}>
          &copy; {new Date().getFullYear()} Architech Designs LLC
        </p>
      </div>
    </div>
  )
}