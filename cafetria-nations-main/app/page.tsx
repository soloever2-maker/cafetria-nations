import Link from "next/link"
import { Briefcase, Coffee } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background">
      {/* Logo and Branding */}
      <div className="mb-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Coffee className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          كافتيريا نيشنز
        </h1>
        <p className="text-lg text-muted-foreground">
          Cafeteria Nations
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Nations Of Sky
        </p>
      </div>

      {/* Entry Buttons */}
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/employee/login"
          className="flex items-center justify-between w-full p-6 bg-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold">أنا موظف</p>
              <p className="text-sm opacity-80">{"I'm an Employee"}</p>
            </div>
          </div>
          <span className="text-2xl" aria-hidden="true">←</span>
        </Link>

        <Link
          href="/worker/login"
          className="flex items-center justify-between w-full p-6 bg-accent text-accent-foreground rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent-foreground/20 flex items-center justify-center">
              <Coffee className="w-7 h-7" />
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold">أنا عامل</p>
              <p className="text-sm opacity-80">{"I'm a Worker"}</p>
            </div>
          </div>
          <span className="text-2xl" aria-hidden="true">←</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Nations Of Sky</p>
        <p className="mt-1">نظام طلبات الكافتيريا الداخلي</p>
      </footer>
    </main>
  )
}
