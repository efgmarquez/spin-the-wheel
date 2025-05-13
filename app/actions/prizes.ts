"use server"

import { supabase } from "@/lib/supabase"
import type { Prize, UserPrize } from "@/types/database"

// Get all available prizes
export async function getPrizes(): Promise<Prize[]> {
  const { data, error } = await supabase.from("prizes").select("*").order("id")

  if (error) {
    console.error("Error fetching prizes:", error)
    return []
  }

  return data || []
}

// Save a user's prize win
export async function savePrizeWin(userId: string, prizeId: string, prizeName: string): Promise<UserPrize | null> {
  // Generate a random code
  const code = `WIN${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

  const { data, error } = await supabase
    .from("user_prizes")
    .insert({
      user_id: userId,
      prize_id: prizeId,
      prize_name: prizeName,
      code,
      claimed: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving prize win:", error)
    return null
  }

  return data
}

// Get user's prize history
export async function getUserPrizes(userId: string): Promise<UserPrize[]> {
  const { data, error } = await supabase
    .from("user_prizes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user prizes:", error)
    return []
  }

  return data || []
}

// Claim a prize
export async function claimPrize(prizeId: string): Promise<boolean> {
  const { error } = await supabase.from("user_prizes").update({ claimed: true }).eq("id", prizeId)

  if (error) {
    console.error("Error claiming prize:", error)
    return false
  }

  return true
}
