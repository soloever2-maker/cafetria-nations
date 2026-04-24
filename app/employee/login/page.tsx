"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { ArrowRight, User } from "lucide-react"

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [employeeId, setEmployeeId] = useState("")
  const [employeeName, setEmployeeName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!employeeId.trim() || !employeeName.trim()) {
      setError("الرجاء إدخال جميع البيانات")
      return
    }

    setIsLoading(true)
    
    // Simulate login (in real app, validate against database)
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    // Navigate to menu with employee info
    router.push(`/employee/menu?id=${encodeURIComponent(employeeId)}&name=${encodeURIComponent(employeeName)}`)
  }

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
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <User className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-primary mb-2">تسجيل دخول الموظف</h1>
        <p className="text-muted-foreground mb-8">Employee Login</p>
        
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="p-6 bg-card rounded-xl shadow-lg border border-border">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>رقم الموظف</FieldLabel>
                <Input
                  type="text"
                  placeholder="مثال: EMP001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="text-center text-lg"
                  dir="ltr"
                />
              </Field>
              <Field>
                <FieldLabel>اسم الموظف</FieldLabel>
                <Input
                  type="text"
                  placeholder="أدخل اسمك"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="text-center text-lg"
                />
                {error && (
                  <p className="text-sm text-destructive mt-1">{error}</p>
                )}
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  <span>جاري الدخول...</span>
                </>
              ) : (
                <span>دخول</span>
              )}
            </Button>
          </div>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          أدخل رقم الموظف الخاص بك للوصول إلى القائمة
        </p>
      </div>
    </main>
  )
}
