import { AuthForm } from "@/components/auth-form"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Prize Wheel Game</h1>
          <p className="text-white/80">Sign in to spin the wheel and win amazing prizes!</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
