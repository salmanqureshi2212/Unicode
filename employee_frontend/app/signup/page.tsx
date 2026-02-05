"use client"

import React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Building2, ArrowLeft, Eye, EyeOff, Upload, UserPlus, X, Loader2 } from "lucide-react"
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    phoneNumber: "",
    photo: null as File | null,
    employee:true,
    aadhaarNumber: "",
    departmentName: "",
    organizationId: "",
    password: "",
    confirmPassword: "",
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setFormData({ ...formData, photo: null })
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatAadhaar = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    const truncated = numbers.slice(0, 12)
    const parts = []
    for (let i = 0; i < truncated.length; i += 4) {
      parts.push(truncated.slice(i, i + 4))
    }
    return parts.join(" ")
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.slice(0, 10)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    if (formData.aadhaarNumber.replace(/\s/g, "").length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number")
      return
    }

    setIsLoading(true)
    const  reqData = {
      name: formData.name,
      surname: formData.surname,
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      aadhaarNumber: formData.aadhaarNumber.replace(/\s/g, ""),
      departmentName: formData.departmentName,
      organizationId: formData.organizationId,
      password: formData.password,
      employee: formData.employee,
    }
    // Simulate signup - in production, this would be an API call
    const res = await fetch(`${apiUrl}/api/auth/signup`, {
      method: "POST",
      body: JSON.stringify(reqData),
    })
    const data = await res.json()
    if (res.ok) {
      router.push("/home")
      await localStorage.setItem("employeeToken", data.token)
    } else {
      const data = await res.json()
      setError(data.message || "An error occurred during registration")
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
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-2xl border-0 shadow-2xl">
          <CardHeader className="text-center bg-[#0d2673] text-white rounded-t-lg py-6">
            <div className="mx-auto bg-white rounded-full p-3 mb-3 w-fit">
              <Building2 className="h-8 w-8 text-[#0d2673]" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold">Employee Registration</CardTitle>
            <CardDescription className="text-white/90">
              नवीन कर्मचारी नोंदणी
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-white rounded-b-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-[#0d2673] font-medium">Profile Photo <span className="text-red-500">*</span></Label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {photoPreview ? (
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#0d2673]">
                        <Image
                          src={photoPreview || "/placeholder.svg"}
                          alt="Profile preview"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                        onClick={removePhoto}
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-[#0d2673]/30">
                      <Upload className="h-6 w-6 text-[#0d2673]/50" />
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <input
                      ref={fileInputRef}
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto border-[#0d2673] text-[#0d2673] hover:bg-[#0d2673]/10 bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center sm:text-left">
                      Upload a passport size photo (JPG, PNG)
                    </p>
                  </div>
                </div>
              </div>

              {/* Name and Surname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#0d2673] font-medium">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter first name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname" className="text-[#0d2673] font-medium">Surname <span className="text-red-500">*</span></Label>
                  <Input
                    id="surname"
                    type="text"
                    placeholder="Enter surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                    required
                  />
                </div>
              </div>

              {/* Username and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#0d2673] font-medium">Username <span className="text-red-500">*</span></Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#0d2673] font-medium">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-[#0d2673] font-medium">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: formatPhoneNumber(e.target.value) })}
                  className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                  maxLength={10}
                  required
                />
              </div>

              {/* Aadhaar Number */}
              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber" className="text-[#0d2673] font-medium">Aadhaar Number <span className="text-red-500">*</span></Label>
                <Input
                  id="aadhaarNumber"
                  type="text"
                  placeholder="XXXX XXXX XXXX"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: formatAadhaar(e.target.value) })}
                  className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                  maxLength={14}
                  required
                />
                <p className="text-xs text-muted-foreground">12-digit Aadhaar number</p>
              </div>

              {/* Department Name and ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentName" className="text-[#0d2673] font-medium">Department Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="departmentName"
                    type="text"
                    placeholder="Enter department name"
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizationId" className="text-[#0d2673] font-medium">Organization ID <span className="text-red-500">*</span></Label>
                  <Input
                    id="organizationId"
                    type="text"
                    placeholder="Enter organization ID"
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#0d2673] font-medium">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673] pr-10"
                      required
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#0d2673] font-medium">Confirm Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="border-gray-300 focus:border-[#0d2673] focus:ring-[#0d2673]"
                    required
                  />
                </div>
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-[#0d2673] hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      
    </div>
  )
}
