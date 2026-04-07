"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState("")
  const [success, setSuccess] = useState("")
  const [debugInfo, setDebugInfo] = useState("")

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/admin/dashboard")
      }
    })
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setDebugInfo("Attempting login...")

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setDebugInfo("Login failed: " + signInError.message)
      } else if (data.user) {
        setDebugInfo("Login successful, redirecting...")
        router.push("/admin/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
      setDebugInfo("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "admin",
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
    } else if (data.user) {
      setSuccess("Account created! Try logging in now.")
      setIsSignUp(false)
    } else if (data.session) {
      router.push("/admin/dashboard")
    } else {
      setSuccess("Account created! Check email to verify, then log in.")
      setIsSignUp(false)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A2540] via-[#1E3A5F] to-[#0A2540] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3B82F6] rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">AD</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Architech Designs</h1>
          <p className="text-white/60 mt-2">Client Portal & CRM</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{isSignUp ? "Create Account" : "Welcome back"}</CardTitle>
            <CardDescription>{isSignUp ? "Sign up to get started" : "Sign in to your account"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                  {success}
                </div>
              )}

              {debugInfo && (
                <div className="p-2 rounded bg-gray-100 text-gray-600 text-xs font-mono">
                  {debugInfo}
                </div>
              )}
              
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                    className="h-11"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Creating..." : "Signing in..."}
                  </>
                ) : (
                  isSignUp ? "Create Account" : "Sign in"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button onClick={() => { setIsSignUp(false); setError(""); setSuccess(""); setDebugInfo("") }} className="text-[#3B82F6] hover:underline font-medium">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => { setIsSignUp(true); setError(""); setSuccess(""); setDebugInfo("") }} className="text-[#3B82F6] hover:underline font-medium">
                    Sign up
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-sm mt-6">
          &copy; {new Date().getFullYear()} Architech Designs LLC
        </p>
      </div>
    </div>
  )
}