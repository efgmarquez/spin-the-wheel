import { checkAuth } from "@/app/actions/auth"
import { getPrizes } from "@/app/actions/prizes"
import { PrizeWheel } from "@/components/prize-wheel"
import { PrizeHistory } from "@/components/prize-history"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { getUserPrizes } from "@/app/actions/prizes"

// // Add a cache directive to prevent excessive revalidation
// export const dynamic = "force-dynamic"
// export const revalidate = 0

export default async function GamePage() {
  // Get user data
  const user = await checkAuth()

  // If no user is found, redirect to login
  if (!user) {
    console.log("no user is found, redirecting to /")
    redirect("/")
  }

  // Get prizes from the database
  const prizes = await getPrizes()

  // useEffect(() => {
  //     async function loadPrizes() {
  //       setLoading(true)
  const userPrizes = await getUserPrizes(user.id)
  // console.log(userPrizes)
  //       setPrizes(userPrizes)
  //       setLoading(false)
  //     }
  
  //     loadPrizes()
  //   }, [userId])

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 flex flex-col">
      <header className="bg-black/20 backdrop-blur-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Spin the Wheel Game</h1>
          <div className="flex items-center gap-4">
            <div className="text-white">
              Welcome, {user.firstName} {user.lastName}
            </div>
            <form
              action={async () => {
                "use server"
                const { logout } = await import("@/app/actions/auth")
                const result = await logout()
                if (result.success) {
                  redirect(result.redirectTo)
                }
              }}
            >
              <Button variant="outline" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-8">Spin the Wheel to Win a Prize!</h2>
            <PrizeWheel userId={user.id} prizes={prizes} />
          </div>

          <div className="flex flex-col">
            <PrizeHistory userId={user.id} prizes={userPrizes} />
          </div>
        </div>
      </main>

      <footer className="bg-black/20 backdrop-blur-sm p-4 text-center text-white">
        <p>© {new Date().getFullYear()} Spin the Wheel Game for Giftaway.</p>
      </footer>
    </div>
  )
}
