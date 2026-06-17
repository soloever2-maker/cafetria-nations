"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, MapPin, Loader2, Star } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import type { Site } from "@/lib/types"

export default function HeroSiteSelectPage() {
  const router = useRouter()
  const [sites, setSites]         = useState<Site[]>([])
  const [loading, setLoading]     = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)

  // Clear any previous site on every visit (hero selects fresh each time)
  useEffect(() => {
    sessionStorage.removeItem("hero_selected_site")

    fetch("/api/sites")
      .then((r) => r.json())
      .then(({ sites }) => setSites(sites ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (site: Site) => {
    setSelecting(site.id)
    // Store in sessionStorage — clears when browser/tab is closed
    sessionStorage.setItem(
      "hero_selected_site",
      JSON.stringify({ id: site.id, name: site.name, nameEn: site.nameEn })
    )
    router.push("/hero/dashboard")
  }

  return (
    <main className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-accent/10 to-background">
      <Link
        href="/hero/login"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة لتسجيل الدخول</span>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-accent" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
            <Star className="w-3 h-3 text-accent-foreground fill-current" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">اختر سايدك النهارده</h1>
        <p className="text-muted-foreground mb-2">Select your site for today</p>
        <p className="text-xs text-muted-foreground mb-8 bg-accent/10 px-3 py-1 rounded-full">
          Nations Hero · الطلبات هتيجي على السايد اللي تختاره فقط
        </p>

        {/* Sites list */}
        <div className="w-full max-w-md space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="w-8 h-8 text-accent" />
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
                className="flex items-center justify-between w-full p-5 bg-accent text-accent-foreground rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-foreground/20 flex items-center justify-center shrink-0">
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
