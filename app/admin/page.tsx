"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowRight, Plus, Trash2, ToggleLeft, ToggleRight,
  MapPin, Settings, Lock, Pencil, Check, X, KeyRound,
} from "lucide-react"
import type { Site } from "@/lib/types"

// ── Password Gate ─────────────────────────────────────────────────────────────
function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [pass, setPass]       = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res  = await fetch("/api/settings?key=admin_password")
      const data = await res.json()
      if (pass === data.value) {
        onSuccess()
      } else {
        setError("الباسورد غلط")
      }
    } catch {
      setError("حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-muted/30 to-background">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-primary mb-1">Admin Panel</h1>
      <p className="text-muted-foreground mb-8">إدارة المواقع والإعدادات</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="p-6 bg-card rounded-xl shadow-lg border border-border">
          <Input
            type="password"
            placeholder="ادخل الباسورد..."
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError("") }}
            className="text-center text-xl tracking-[0.4em] font-mono mb-4"
            autoComplete="off"
            autoFocus
          />
          {error && <p className="text-sm text-destructive text-center mb-3">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading || !pass}>
            {loading ? <><Spinner className="w-4 h-4" /> جاري التحقق...</> : "دخول"}
          </Button>
        </div>
      </form>

      <Link href="/" className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowRight className="w-4 h-4" />
        الرئيسية
      </Link>
    </main>
  )
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────
function AdminPanel() {
  const [sites, setSites]     = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)

  // New site form
  const [newName, setNewName]     = useState("")
  const [newNameEn, setNewNameEn] = useState("")
  const [adding, setAdding]       = useState(false)
  const [formError, setFormError] = useState("")

  // Inline edit state
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editName, setEditName]           = useState("")
  const [editNameEn, setEditNameEn]       = useState("")

  // Password change
  const [heroPass, setHeroPass]           = useState("")
  const [adminPass, setAdminPass]         = useState("")
  const [savingHeroPass, setSavingHeroPass]   = useState(false)
  const [savingAdminPass, setSavingAdminPass] = useState(false)
  const [heroPassMsg, setHeroPassMsg]     = useState("")
  const [adminPassMsg, setAdminPassMsg]   = useState("")

  const loadSites = async () => {
    setLoading(true)
    const res  = await fetch("/api/sites?all=1")
    const data = await res.json()
    setSites(data.sites ?? [])
    setLoading(false)
  }

  useEffect(() => { loadSites() }, [])

  // ── Site actions ────────────────────────────────────────────────────────────
  const toggleActive = async (site: Site) => {
    setSaving(site.id)
    await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !site.isActive }),
    })
    await loadSites()
    setSaving(null)
  }

  const deleteSite = async (site: Site) => {
    if (!confirm(`هتحذف "${site.name}"؟`)) return
    setSaving(site.id)
    await fetch(`/api/sites/${site.id}`, { method: "DELETE" })
    await loadSites()
    setSaving(null)
  }

  const startEdit = (site: Site) => {
    setEditingId(site.id)
    setEditName(site.name)
    setEditNameEn(site.nameEn)
  }

  const saveEdit = async (site: Site) => {
    if (!editName.trim() || !editNameEn.trim()) return
    setSaving(site.id)
    await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), nameEn: editNameEn.trim() }),
    })
    setEditingId(null)
    await loadSites()
    setSaving(null)
  }

  const addSite = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!newName.trim() || !newNameEn.trim()) { setFormError("الاسمين مطلوبين"); return }
    setAdding(true)
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), nameEn: newNameEn.trim() }),
    })
    if (!res.ok) { const d = await res.json(); setFormError(d.error ?? "حدث خطأ") }
    else { setNewName(""); setNewNameEn(""); await loadSites() }
    setAdding(false)
  }

  // ── Password actions ────────────────────────────────────────────────────────
  const savePassword = async (
    key: string, value: string,
    setSaving: (v: boolean) => void,
    setMsg: (v: string) => void
  ) => {
    if (!value.trim()) return
    setSaving(true)
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: value.trim() }),
    })
    setMsg(res.ok ? "✅ تم الحفظ" : "❌ حدث خطأ")
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-muted/30 to-background" dir="rtl">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">إدارة الكافتيريا</p>
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
              <span className="font-medium text-sm">المواقع</span>
            </div>
            <span className="text-xs text-muted-foreground">{sites.length} موقع</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Spinner className="w-6 h-6 text-primary" /></div>
          ) : sites.length === 0 ? (
            <p className="text-center py-10 text-sm text-muted-foreground">لا توجد مواقع</p>
          ) : (
            <ul className="divide-y divide-border">
              {sites.map((site) => (
                <li key={site.id} className="px-4 py-3">
                  {editingId === site.id ? (
                    // ── Inline edit mode ──
                    <div className="space-y-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="الاسم بالعربي"
                        dir="rtl"
                        className="text-sm"
                      />
                      <Input
                        value={editNameEn}
                        onChange={(e) => setEditNameEn(e.target.value)}
                        placeholder="English name"
                        dir="ltr"
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gap-1" onClick={() => saveEdit(site)} disabled={saving === site.id}>
                          {saving === site.id ? <Spinner className="w-3 h-3" /> : <Check className="w-4 h-4" />}
                          حفظ
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // ── Display mode ──
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{site.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{site.nameEn}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={site.isActive
                          ? "border-green-500/30 text-green-600 bg-green-500/10"
                          : "border-muted text-muted-foreground bg-muted/30"}
                      >
                        {site.isActive ? "نشط" : "موقوف"}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(site)} title="تعديل">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(site)} disabled={saving === site.id} title={site.isActive ? "إيقاف" : "تفعيل"}>
                          {saving === site.id ? <Spinner className="w-4 h-4" /> : site.isActive ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteSite(site)} disabled={saving === site.id} title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Add new site ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6 shadow-sm">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Plus className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">إضافة موقع جديد</span>
          </div>
          <form onSubmit={addSite} className="p-4 space-y-3">
            <Input placeholder="الاسم بالعربي — مثال: الدور الخامس" value={newName} onChange={(e) => { setNewName(e.target.value); setFormError("") }} disabled={adding} dir="rtl" />
            <Input placeholder="English name — e.g. Floor 5" value={newNameEn} onChange={(e) => { setNewNameEn(e.target.value); setFormError("") }} disabled={adding} dir="ltr" />
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <Button type="submit" className="w-full gap-2" disabled={adding}>
              {adding ? <><Spinner className="w-4 h-4" />جاري الإضافة...</> : <><Plus className="w-4 h-4" />إضافة الموقع</>}
            </Button>
          </form>
        </div>

        {/* ── Passwords section ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">تغيير الباسوردات</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Hero password */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">باسورد Nations Hero</p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="الباسورد الجديد للهيرو"
                  value={heroPass}
                  onChange={(e) => setHeroPass(e.target.value)}
                  dir="ltr"
                  className="font-mono tracking-widest"
                />
                <Button
                  onClick={() => savePassword("hero_password", heroPass, setSavingHeroPass, setHeroPassMsg)}
                  disabled={savingHeroPass || !heroPass}
                  className="shrink-0"
                >
                  {savingHeroPass ? <Spinner className="w-4 h-4" /> : "حفظ"}
                </Button>
              </div>
              {heroPassMsg && <p className="text-xs mt-1 text-muted-foreground">{heroPassMsg}</p>}
            </div>

            {/* Admin password */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">باسورد Admin Panel</p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="الباسورد الجديد للأدمن"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  dir="ltr"
                  className="font-mono tracking-widest"
                />
                <Button
                  onClick={() => savePassword("admin_password", adminPass, setSavingAdminPass, setAdminPassMsg)}
                  disabled={savingAdminPass || !adminPass}
                  className="shrink-0"
                >
                  {savingAdminPass ? <Spinner className="w-4 h-4" /> : "حفظ"}
                </Button>
              </div>
              {adminPassMsg && <p className="text-xs mt-1 text-muted-foreground">{adminPassMsg}</p>}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          الباسورد الابتدائي للهيرو: 1234 · للأدمن: admin123
        </p>
      </div>
    </main>
  )
}

// ── Page entry ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  return authed
    ? <AdminPanel />
    : <PasswordGate onSuccess={() => setAuthed(true)} />
}
