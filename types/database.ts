export type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  created_at: string
}

export type Prize = {
  id: string
  name: string
  color: string
  text_color: string
  probability: number
}

export type UserPrize = {
  id: string
  user_id: string
  prize_id: string
  prize_name: string
  created_at: string
  claimed: boolean
  code: string
}
