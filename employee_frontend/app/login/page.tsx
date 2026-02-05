"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }
    setIsLoading(true)

   const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })    
    // Simulate login - in production, this would be an API call
    var res =  await response.json();
    if (res&&response.ok) {
     await localStorage.setItem("employeeToken", res.token)
      setIsLoading(false)
      router.push("/home")
    }
    else{
      setError(res.message || "Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d2673]">
      {/* Header */}
      <header className="w-full bg-[#0d2673] border-b border-white/20 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-[#0d2673]" />
            </div>
            <div className="text-white">
              <h1 className="text-base md:text-xl font-bold tracking-tight">BMC Employee Portal</h1>
              <p className="text-xs text-white/80 hidden sm:block">बृहन्मुंबई महानगरपालिका</p>
            </div>
          </div>
          <Link href="/" className="text-white hover:text-white/80 flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center bg-[#0d2673] text-white rounded-t-lg py-6">
            <div className="mx-auto bg-white rounded-full p-3 mb-3 w-fit">
              <Building2 className="h-8 w-8 text-[#0d2673]" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold">Employee Login</CardTitle>
            <CardDescription className="text-white/90">
              कर्मचारी लॉगिन
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-white rounded-b-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#0d2673] font-medium">
                  Username / Employee ID
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0d2673] font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0d2673]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end text-sm">
                <Link href="#" className="text-[#0d2673] hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0d2673] hover:bg-[#1a3a8f] text-white"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/signup" className="text-[#0d2673] hover:underline font-medium">
                  Register here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      
    </div>
  )
}
