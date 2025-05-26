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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp"
import { useSignUp } from '@clerk/clerk-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import {REGEXP_ONLY_DIGITS} from "input-otp"

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.userId) {
      throw redirect({
        to: "/"
      })
    }
  }
})

function RouteComponent() {
  const { signUp, isLoaded: isSignUpLoaded, setActive } = useSignUp()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isSignUpLoaded) return

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    setIsLoading(true)
    setError(null)

    try {
      await signUp.create({
        emailAddress: email,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setPendingVerification(true)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isSignUpLoaded) return

    setVerifying(true)
    setError(null)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })
      if (completeSignUp.status !== "complete") {
        throw new Error("Unable to verify email change")
      }
      await setActive({ session: completeSignUp.createdSessionId })
      navigate({ to: "/" })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            {!pendingVerification 
              ? "Enter your email below to create your account"
              : "Enter the verification code sent to your email"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
              <div className="text-sm text-center">
                Already have an account?{" "}
                <Link to="/login" className='underline underline-offset-4'>
                  Sign in
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <InputOTP
                  value={code}
                  onChange={setCode}
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  autoFocus
                
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={verifying || code.length < 6}
              >
                {verifying ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
