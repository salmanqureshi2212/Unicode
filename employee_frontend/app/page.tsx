import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, UserPlus, Building2, Shield } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d2673]">
      {/* Header */}
      <header className="w-full bg-[#0d2673] border-b border-white/20 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              <Building2 className="h-8 w-8 text-[#0d2673]" />
            </div>
            <div className="text-white">
              <h1 className="text-lg md:text-xl font-bold tracking-tight">BMC</h1>
              <p className="text-xs md:text-sm text-white/80">बृहन्मुंबई महानगरपालिका</p>
            </div>
          </div>
          <Shield className="h-8 w-8 text-white/80 hidden md:block" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center bg-[#0d2673] text-white rounded-t-lg py-8">
            <div className="mx-auto bg-white rounded-full p-3 mb-4 w-fit">
              <Building2 className="h-10 w-10 text-[#0d2673]" />
            </div>
            <CardTitle className="text-2xl font-bold text-balance">BMC Employee Portal</CardTitle>
            <CardDescription className="text-white/90">
              कर्मचारी पोर्टल में आपका स्वागत है
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6 bg-white rounded-b-lg">
            <p className="text-center text-muted-foreground text-sm mb-2">
              Please login or create a new account to access the portal
            </p>
            <Link href="/login" className="w-full">
              <Button className="w-full bg-[#0d2673] hover:bg-[#1a3a8f] text-white" size="lg">
                <LogIn className="mr-2 h-4 w-4" />
                Employee Login
              </Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button variant="outline" className="w-full border-[#0d2673] text-[#0d2673] hover:bg-[#0d2673] hover:text-white bg-transparent" size="lg">
                <UserPlus className="mr-2 h-4 w-4" />
                New Registration
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      
    </div>
  )
}
