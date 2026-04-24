"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, KeyRound, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export default function WorkerLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (pin.length < 4) {
      setError("الرجاء إدخال رمز PIN صالح")
      return
    }

    setIsLoading(true)
    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // For demo purposes, accept any 4+ digit PIN
    router.push("/worker/dashboard")
  }

  const handlePinChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, "").slice(0, 6)
    setPin(digits)
    if (error) setError("")
  }

  return (
    <main className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-accent/10 to-background">
      <Link 
        href="/" 
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة للرئيسية</span>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <KeyRound className="w-8 h-8 text-accent" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-1">تسجيل دخول العامل</h1>
        <p className="text-muted-foreground mb-8">Worker Login</p>
        
        <Card className="w-full max-w-sm">
          <CardHeader className="pb-4">
            <p className="text-sm text-muted-foreground text-center">
              أدخل رمز PIN الخاص بك للدخول
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="pin">رمز PIN</FieldLabel>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="••••••"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    autoComplete="off"
                  />
                  {error && (
                    <p className="text-sm text-destructive mt-1">{error}</p>
                  )}
                </Field>

                <Button
                  type="submit"
                  className="w-full gap-2 mt-4"
                  size="lg"
                  disabled={isLoading || pin.length < 4}
                >
                  {isLoading ? (
                    <span className="animate-pulse">جاري الدخول...</span>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      دخول
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              للتجربة: أدخل أي رمز من 4 أرقام
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
