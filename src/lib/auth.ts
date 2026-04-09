import type { UserRole } from "@/types"

export function normalizeUserRole(role?: string | null): UserRole {
  if (role === "client" || role === "team") {
    return role
  }

  return "admin"
}

export function getDashboardPath(role?: string | null): string {
  return normalizeUserRole(role) === "client" ? "/portal/dashboard" : "/admin/dashboard"
}

export function getFriendlyAuthError(message?: string): string {
  const normalizedMessage = message?.toLowerCase() ?? ""

  if (normalizedMessage.includes("invalid login credentials")) {
    return "We couldn't sign you in with those credentials. Double-check your email and password and try again."
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Your account needs to be confirmed before you can sign in. Please check your inbox or contact support."
  }

  if (normalizedMessage.includes("too many requests")) {
    return "Too many sign-in attempts were detected. Please wait a moment and try again."
  }

  if (normalizedMessage.includes("network")) {
    return "We couldn't reach the secure sign-in service. Check your connection and try again."
  }

  return "We couldn't complete sign-in right now. Please try again or contact support if the issue continues."
}
