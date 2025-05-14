"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import { supabase } from "@/lib/supabase"

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

export async function login(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Validate input
    loginSchema.parse({ email, password })

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return { error: authError.message }
    }

    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (userError) {
      return { error: "Failed to retrieve user data" }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session", authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })

    // Return success
    return { success: true, redirectTo: "/game" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "An unexpected error occurred" }
  }
}

export async function register(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const password = formData.get("password") as string

    // Validate input
    registerSchema.parse({ email, firstName, lastName, password })

    // Register with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return { error: authError.message }
    }

    if (!authData.user) {
      console.log(authError)
      return { error: "Failed to create user" }
    }

    // Create user profile in the users table
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
    })

    if (profileError) {
      console.log(profileError)
      return { error: "Failed to create user profile. Duplicate email found." }
    }

    // Set session cookie
    const cookieStore = await cookies()
    if (authData.session) {
      cookieStore.set("session", authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
      })
    }

    // Return success
    return { success: true, redirectTo: "/game" }
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "An unexpected error occurred" }
  }
}

export async function logout() {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut()

    // Delete the session cookie
    const cookieStore = await cookies()
    cookieStore.delete("session")

    // Return success
    return { success: true, redirectTo: "/" }
  } catch (error) {
    console.error("Logout error:", error)
    return { error: "An error occurred during logout" }
  }
}

export async function checkAuth() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) return { user: null }

    const { data: sessionData, error: sessionError } = await supabase.auth.getUser(sessionToken)

    if (sessionError || !sessionData.user) {
      return { user: null, shouldDeleteCookie: true }
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", sessionData.user.id)
      .single()

    if (userError || !userData) return { user: null }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
      },
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return { user: null }
  }
}

