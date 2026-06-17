"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { ArrowRight, User, Lock, KeyRound } from "lucide-react"

type Step = "id" | "create-password" | "enter-password"

interface EmployeeInfo {
  id: string
  name: string
  department: string
}

export default function EmployeeLoginPage() {
  const router = useRouter()

  const [step, setStep]                 = useState<Step>("id")
  const [employeeId, setEmployeeId]     = useState("")
  const [employee, setEmployee]         = useState<EmployeeInfo | null>(null)
  const [password, setPassword]         = useState("")
  const [confirmPass, setConfirmPass]   = useState("")
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState("")

  // ── Step 1: Validate employee ID ──────────────────────────────────────────
  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const id = employeeId.trim().toUpperCase()
    if (!id) { setError("الرجاء إدخال رقم الموظف"); return }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(id)}`)
      if (res.status === 404) { setError("رقم الموظف غير صحيح"); return }
      if (!res.ok)             { setError("حدث خطأ، حاول مرة أخرى"); return }

      const { employee, hasPassword } = await res.json()
      setEmployee(employee)
      setStep(hasPassword ? "enter-password" : "create-password")
    } catch {
      setError("حدث خطأ في الاتصال")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2A: Create password (first time) ─────────────────────────────────
  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 4)        { setError("الباسورد لازم يكون 4 أرقام على الأقل"); return }
    if (password !== confirmPass)    { setError("الباسوردين مش متطابقين"); return }
    if (!employee)                   return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(employee.id)}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "set", password }),
      })
      if (!res.ok) { setError("حدث خطأ في الحفظ"); return }
      goToSiteSelect()
    } catch {
      setError("حدث خطأ في الاتصال")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2B: Verify password ───────────────────────────────────────────────
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!password) { setError("ادخل الباسورد"); return }
    if (!employee)  return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(employee.id)}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "verify", password }),
      })
      const { valid } = await res.json()
      if (!valid) { setError("الباسورد غلط، حاول تاني"); return }
      goToSiteSelect()
    } catch {
      setError("حدث خطأ في الاتصال")
    } finally {
      setIsLoading(false)
    }
  }

  const goToSiteSelect = () => {
    if (!employee) return
    router.push(
      `/employee/site-select?id=${encodeURIComponent(employee.id)}&name=${encodeURIComponent(employee.name)}&dept=${encodeURIComponent(employee.department ?? "")}`
    )
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-primary/5 to-background">
      <Link
        href="/"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة للرئيسية</span>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">

        {/* ── Step 1: Employee ID ── */}
        {step === "id" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Employee Login</h1>
            <p className="text-muted-foreground mb-8">تسجيل دخول الموظف</p>

            <form onSubmit={handleIdSubmit} className="w-full max-w-sm">
              <div className="p-6 bg-card rounded-xl shadow-lg border border-border">
                <FieldGroup>
                  <Field>
                    <FieldLabel>رقم الموظف</FieldLabel>
                    <Input
                      type="text"
                      placeholder="مثال: EMP001"
                      value={employeeId}
                      onChange={(e) => { setEmployeeId(e.target.value); setError("") }}
                      className="text-center text-lg tracking-widest"
                      dir="ltr"
                      autoComplete="off"
                      autoFocus
                    />
                    {error && <p className="text-sm text-destructive mt-2 text-center">{error}</p>}
                  </Field>
                </FieldGroup>
                <Button type="submit" size="lg" className="w-full mt-6" disabled={isLoading}>
                  {isLoading ? <><Spinner className="w-4 h-4" /><span>جاري التحقق...</span></> : "متابعة"}
                </Button>
              </div>
            </form>
          </>
        )}

        {/* ── Step 2A: Create password ── */}
        {step === "create-password" && employee && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-1">مرحباً {employee.name} 👋</h1>
            <p className="text-muted-foreground mb-2">أول مرة تدخل — اختار باسورد</p>
            <p className="text-xs text-muted-foreground mb-8 bg-primary/5 px-3 py-1 rounded-full">
              هتستخدمه كل مرة بتدخل بعد كده
            </p>

            <form onSubmit={handleCreatePassword} className="w-full max-w-sm">
              <div className="p-6 bg-card rounded-xl shadow-lg border border-border space-y-4">
                <Field>
                  <FieldLabel>الباسورد الجديد</FieldLabel>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    className="text-center text-xl tracking-[0.5em] font-mono"
                    autoComplete="new-password"
                    autoFocus
                  />
                </Field>
                <Field>
                  <FieldLabel>تأكيد الباسورد</FieldLabel>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={confirmPass}
                    onChange={(e) => { setConfirmPass(e.target.value); setError("") }}
                    className="text-center text-xl tracking-[0.5em] font-mono"
                    autoComplete="new-password"
                  />
                </Field>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Spinner className="w-4 h-4" /><span>جاري الحفظ...</span></> : "حفظ وتسجيل الدخول"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep("id"); setPassword(""); setConfirmPass(""); setError("") }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  رجوع
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Step 2B: Enter password ── */}
        {step === "enter-password" && employee && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-1">أهلاً {employee.name} 👋</h1>
            <p className="text-muted-foreground mb-8">ادخل الباسورد بتاعك</p>

            <form onSubmit={handleVerifyPassword} className="w-full max-w-sm">
              <div className="p-6 bg-card rounded-xl shadow-lg border border-border">
                <Field>
                  <FieldLabel>الباسورد</FieldLabel>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    className="text-center text-xl tracking-[0.5em] font-mono"
                    autoComplete="current-password"
                    autoFocus
                  />
                  {error && <p className="text-sm text-destructive mt-2 text-center">{error}</p>}
                </Field>
                <Button type="submit" size="lg" className="w-full mt-6" disabled={isLoading}>
                  {isLoading ? <><Spinner className="w-4 h-4" /><span>جاري التحقق...</span></> : "دخول"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep("id"); setPassword(""); setError("") }}
                  className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  رجوع
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </main>
  )
}
