import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value
  const { pathname } = request.nextUrl

  // Only redirect if we're sure about the authentication state
  if (pathname.startsWith("/game")) {
    if (!sessionToken) {
      console.log("pathname starts with /game with no wsession token")
      // Redirect to login if no session when accessing game
      const loginUrl = new URL("/", request.url)
      return NextResponse.redirect(loginUrl)
    }
  } else if (pathname === "/") {
    if (sessionToken) {
      console.log("pathname starts with / with session token")
      // Redirect to game if session exists when accessing login
      const gameUrl = new URL("/game", request.url)
      return NextResponse.redirect(gameUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/game/:path*"],
}
