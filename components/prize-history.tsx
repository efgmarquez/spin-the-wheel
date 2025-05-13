"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UserPrize } from "@/types/database"
import { getUserPrizes, claimPrize } from "@/app/actions/prizes"
import { formatDistanceToNow } from "date-fns"

interface PrizeHistoryProps {
  userId: string,
  prizes: UserPrize[]
}

export function PrizeHistory({ userId, prizes }: PrizeHistoryProps) {
  const router = useRouter()
  // const [prizes, setPrizes] = useState<UserPrize[]>([])
  // const [loading, setLoading] = useState(true)

  // Load prize history
  // useEffect(() => {
  //   async function loadPrizes() {
  //     setLoading(true)
  //     const userPrizes = await getUserPrizes(userId)
  //     setPrizes(userPrizes)
  //     setLoading(false)
  //   }

  //   loadPrizes()
  // }, [userId])

  // Handle claiming a prize
  const handleClaim = async (prizeId: string) => {
    console.log("handle claim")
    const success = await claimPrize(prizeId)
    if (success) {
      prizes = prizes.map((prize) => (prize.id === prizeId ? { ...prize, claimed: true } : prize))
    }
  }

  // if (loading) {
  //   return (
  //     <Card>
  //       <CardHeader>
  //         <CardTitle>Your Prize History</CardTitle>
  //         <CardDescription>Loading your prizes...</CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="space-y-4">
  //           {[1, 2, 3].map((i) => (
  //             <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
  //           ))}
  //         </div>
  //       </CardContent>
  //     </Card>
  //   )
  // }

  if (prizes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Prize History</CardTitle>
          <CardDescription>You haven't won any prizes yet. Spin the wheel to win!</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Prize History</CardTitle>
        <CardDescription>View all the prizes you've won</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prizes.map((prize) => (
            <div key={prize.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{prize.prize_name}</div>
                <div className="text-sm text-gray-500">
                  Won {formatDistanceToNow(new Date(prize.created_at), { addSuffix: true })}
                </div>
                <div className="text-sm font-mono mt-1">Code: {prize.code}</div>
              </div>
              <div className="flex items-center gap-2">
                {prize.claimed ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Claimed
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => {handleClaim(prize.id); router.refresh()}}>
                    Claim
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
