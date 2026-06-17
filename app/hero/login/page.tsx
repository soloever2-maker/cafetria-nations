"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, KeyRound, LogIn, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export default function HeroLoginPage() {
  const router = useRouter()
  const [pin, setPin]             = useState("")
  const [error, setError]         = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (pin.length < 4) { setError("الرجاء إدخال الباسورد"); return }

    setIsLoading(true)
    try {
      // Fetch hero password from settings
      const res  = await fetch("/api/settings?key=hero_password")
      const data = await res.json()

      if (!res.ok || !data.value) {
        setError("حدث خطأ، حاول مرة أخرى")
        return
      }

      if (pin !== data.value) {
        setError("الباسورد غلط، حاول تاني")
        return
      }

      router.push("/hero/site-select")
    } catch {
      setError("حدث خطأ في الاتصال")
    } finally {
      setIsLoading(false)
    }
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
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-accent" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
            <Star className="w-3 h-3 text-accent-foreground fill-current" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">Nations Hero</h1>
        <p className="text-muted-foreground mb-8">Hero Login</p>

        <Card className="w-full max-w-sm">
          <CardHeader className="pb-4">
            <p className="text-sm text-muted-foreground text-center">
              أدخل الباسورد للدخول
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="pin">الباسورد</FieldLabel>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    placeholder="••••••"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                      setError("")
                    }}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    autoComplete="off"
                    autoFocus
                  />
                  {error && (
                    <p className="text-sm text-destructive mt-1 text-center">{error}</p>
                  )}
                </Field>

                <Button
                  type="submit"
                  className="w-full gap-2 mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                  size="lg"
                  disabled={isLoading || pin.length < 4}
                >
                  {isLoading ? (
                    <><Spinner className="w-4 h-4" /><span>جاري التحقق...</span></>
                  ) : (
                    <><LogIn className="w-5 h-5" />دخول</>
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
