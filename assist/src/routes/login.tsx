import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {  useSignIn } from '@clerk/clerk-react'
import {  useState } from 'react'
import type { FormEvent } from 'react'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  beforeLoad: async ({context}) => {
    if(context.userId){
      throw redirect({
        to: "/"
      })
    }
  }
})

function RouteComponent() {
  const { signIn, isLoaded: isSignInLoaded, setActive } = useSignIn()

  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)



  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isSignInLoaded) return

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate({ to: '/', search: {} })
      } else {
        console.error('Sign in result incomplete:', result)
        setError('Something went wrong during login. Please try again.')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.errors?.[0]?.message || 'Failed to log in. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isSignInLoaded) return

    try {
      setIsLoading(true)
      setError(null)
      
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/",
        redirectUrlComplete: "/"
      })
    } catch (err: any) {
      console.error('Google login error:', err)
      setError(err.errors?.[0]?.message || 'Failed to initialize Google login')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 h-screen justify-center items-center">
      <Card className='max-w-sm mx-auto w-full'>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button" 
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                >
                  Login with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
