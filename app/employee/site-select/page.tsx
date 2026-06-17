"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, MapPin, Loader2 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import type { Site } from "@/lib/types"

function SiteSelectContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const employeeId   = searchParams.get("id")   ?? ""
  const employeeName = searchParams.get("name") ?? ""
  const dept         = searchParams.get("dept") ?? ""

  const [sites, setSites]       = useState<Site[]>([])
  const [loading, setLoading]   = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then(({ sites }) => setSites(sites ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (site: Site) => {
    setSelecting(site.id)
    router.push(
      `/employee/menu?id=${encodeURIComponent(employeeId)}&name=${encodeURIComponent(employeeName)}&dept=${encodeURIComponent(dept)}&site_id=${encodeURIComponent(site.id)}&site_name=${encodeURIComponent(site.name)}`
    )
  }

  return (
    <main className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-primary/5 to-background">
      <Link
        href="/employee/login"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة لتسجيل الدخول</span>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <MapPin className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-primary mb-1">اختر موقع الطلب</h1>
        <p className="text-muted-foreground mb-2">Select your location</p>
        {employeeName && (
          <p className="text-sm text-muted-foreground mb-8">
            مرحباً <span className="font-semibold text-foreground">{employeeName}</span>
          </p>
        )}

        {/* Sites list */}
        <div className="w-full max-w-md space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="w-8 h-8 text-primary" />
            </div>
          ) : sites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>لا توجد مواقع متاحة حالياً</p>
              <p className="text-xs mt-1">No locations available</p>
            </div>
          ) : (
            sites.map((site) => (
              <button
                key={site.id}
                onClick={() => handleSelect(site)}
                disabled={selecting !== null}
                className="flex items-center justify-between w-full p-5 bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                    {selecting === site.id ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <MapPin className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{site.name}</p>
                    <p className="text-sm opacity-75">{site.nameEn}</p>
                  </div>
                </div>
                <span className="text-xl opacity-60" aria-hidden="true">←</span>
              </button>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

export default function EmployeeSiteSelectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    }>
      <SiteSelectContent />
    </Suspense>
  )
}
