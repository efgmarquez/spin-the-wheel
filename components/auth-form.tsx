"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { login, register } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AuthForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, loginAction, isPendingLogin] = useActionState(login, {error: ""})
  const [registerState, registerAction, isPendingRegister] = useActionState(register, {error: ""})
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showConfirmationNotif, setShowConfirmationNotif] = useState(false)

  // Handle redirects from server actions
  useEffect(() => {
    if (isRedirecting) return

    if (loginState?.success && loginState?.redirectTo) {
      setIsRedirecting(true)
      router.push(loginState.redirectTo)
    }
    if (registerState?.success && registerState?.redirectTo) {
      // setIsRedirecting(true)
      setShowConfirmationNotif(true)
      // router.push(registerState.redirectTo)
    }
  }, [loginState, registerState, router, isRedirecting])

  // Form validation states
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  })

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) return "Email is required"
    if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format"
    return ""
  }

  // Password validation
  const validatePassword = (value: string) => {
    if (!value) return "Password is required"
    if (value.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter"
    if (!/[a-z]/.test(value)) return "Password must contain a lowercase letter"
    if (!/[0-9]/.test(value)) return "Password must contain a number"
    if (!/[^A-Za-z0-9]/.test(value)) return "Password must contain a special character"
    return ""
  }

  // Name validation
  const validateName = (value: string, field: string) => {
    if (!value) return `${field} is required`
    if (value.length < 2) return `${field} must be at least 2 characters`
    return ""
  }

  // Check if login form is valid
  const isLoginValid = !validateEmail(email) && !validatePassword(password)

  // Check if register form is valid
  const isRegisterValid =
    !validateEmail(email) &&
    !validateName(firstName, "First name") &&
    !validateName(lastName, "Last name") &&
    !validatePassword(password)

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form action={loginAction}>
            <CardContent className="space-y-4">
              {loginState?.error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{loginState.error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors({ ...errors, email: validateEmail(e.target.value) })
                  }}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors({ ...errors, password: validatePassword(e.target.value) })
                    }}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={!isLoginValid || isPendingLogin || isRedirecting}>
                {isPendingLogin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="register">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <form action={registerAction}>
            <CardContent className="space-y-4">
              {registerState?.error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{registerState.error}</div>
              )}
              {showConfirmationNotif && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">{"Account created successfully! Confirm your email before logging in."}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    name="firstName"
                    placeholder="Gift"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value)
                      setShowConfirmationNotif(false)
                      setErrors({ ...errors, firstName: validateName(e.target.value, "First name") })
                    }}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    name="lastName"
                    placeholder="Away"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value)
                      setShowConfirmationNotif(false)
                      setErrors({ ...errors, lastName: validateName(e.target.value, "Last name") })
                    }}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setShowConfirmationNotif(false)
                    setErrors({ ...errors, email: validateEmail(e.target.value) })
                  }}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setShowConfirmationNotif(false)
                      setErrors({ ...errors, password: validatePassword(e.target.value) })
                    }}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={!isRegisterValid || isPendingRegister || isRedirecting}
              >
                {isPendingRegister ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
