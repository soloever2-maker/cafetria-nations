"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ArrowRight, Plus, Trash2, ToggleLeft, ToggleRight, MapPin, Settings } from "lucide-react"
import type { Site } from "@/lib/types"

export default function AdminPage() {
  const [sites, setSites]       = useState<Site[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState<string | null>(null)

  // New site form
  const [newName,   setNewName]   = useState("")
  const [newNameEn, setNewNameEn] = useState("")
  const [adding, setAdding]       = useState(false)
  const [formError, setFormError] = useState("")

  const loadSites = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/sites?all=1")
      const data = await res.json()
      setSites(data.sites ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSites() }, [])

  const toggleActive = async (site: Site) => {
    setSaving(site.id)
    try {
      await fetch(`/api/sites/${site.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !site.isActive }),
      })
      await loadSites()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  const deleteSite = async (site: Site) => {
    if (!confirm(`هتحذف "${site.name}"؟\nDelete "${site.nameEn}"?`)) return
    setSaving(site.id)
    try {
      await fetch(`/api/sites/${site.id}`, { method: "DELETE" })
      await loadSites()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  const addSite = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    const name   = newName.trim()
    const nameEn = newNameEn.trim()
    if (!name || !nameEn) {
      setFormError("الاسمين مطلوبين — Both names are required")
      return
    }

    setAdding(true)
    try {
      const res = await fetch("/api/sites", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, nameEn }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        setFormError(error ?? "حدث خطأ")
        return
      }
      setNewName("")
      setNewNameEn("")
      await loadSites()
    } catch (e) {
      setFormError("حدث خطأ في الاتصال")
      console.error(e)
    } finally {
      setAdding(false)
    }
  }

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-muted/30 to-background" dir="rtl">
      {/* Header */}
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">إدارة المواقع</h1>
              <p className="text-sm text-muted-foreground">Sites Management</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-4 h-4" />
            الرئيسية
          </Link>
        </div>

        {/* ── Sites list ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6 shadow-sm">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">المواقع الحالية</span>
            </div>
            <span className="text-xs text-muted-foreground">{sites.length} موقع</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="w-6 h-6 text-primary" />
            </div>
          ) : sites.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              لا توجد مواقع — No sites yet
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {sites.map((site) => (
                <li key={site.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{site.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{site.nameEn}</p>
                  </div>

                  {/* Status badge */}
                  <Badge
                    variant="outline"
                    className={site.isActive
                      ? "border-green-500/30 text-green-600 bg-green-500/10"
                      : "border-muted text-muted-foreground bg-muted/30"}
                  >
                    {site.isActive ? "نشط" : "موقوف"}
                  </Badge>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleActive(site)}
                      disabled={saving === site.id}
                      title={site.isActive ? "إيقاف" : "تفعيل"}
                    >
                      {saving === site.id ? (
                        <Spinner className="w-4 h-4" />
                      ) : site.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteSite(site)}
                      disabled={saving === site.id}
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Add new site form ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Plus className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">إضافة موقع جديد</span>
          </div>
          <form onSubmit={addSite} className="p-4 space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                الاسم بالعربي
              </label>
              <Input
                placeholder="مثال: الدور الخامس"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setFormError("") }}
                disabled={adding}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                الاسم بالإنجليزي
              </label>
              <Input
                placeholder="e.g. Floor 5"
                value={newNameEn}
                onChange={(e) => { setNewNameEn(e.target.value); setFormError("") }}
                disabled={adding}
                dir="ltr"
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
            <Button type="submit" className="w-full gap-2" disabled={adding}>
              {adding ? (
                <><Spinner className="w-4 h-4" /> جاري الإضافة...</>
              ) : (
                <><Plus className="w-4 h-4" /> إضافة الموقع</>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          المواقع الموقوفة لا تظهر للموظفين والهيروز عند الدخول
        </p>
      </div>
    </main>
  )
}
