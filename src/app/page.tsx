import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#0A2540] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">AD</span>
            </div>
            <span className="font-semibold text-lg">Architech Designs</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">
                Client Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0A2540] via-[#1E3A5F] to-[#0A2540]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#3B82F6] rounded-2xl mb-8">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Architech Designs CRM
          </h1>
          
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Manage your projects, track progress, and collaborate seamlessly. 
            Professional client portal for web design and growth services.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-[#3B82F6] hover:bg-[#2563EB] px-8">
                Sign In <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#0A2540] text-white/60 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Architech Designs LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}