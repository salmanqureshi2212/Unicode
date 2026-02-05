"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Building2,
  CreditCard,
  Star,
  CheckCircle2,
  Calendar,
  LogOut,
  Clock,
  History,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CompletedTask {
  id: string;
  title: string;
  completedDate: string;
  rating: number;
}

const completedTasks: CompletedTask[] = [
  {
    id: "1",
    title: "Pothole Repair - Dadar",
    completedDate: "2024-02-02",
    rating: 5,
  },
  {
    id: "2",
    title: "Road Surface Repair - Kurla",
    completedDate: "2024-01-28",
    rating: 5,
  },
  {
    id: "3",
    title: "Drainage Cleaning - Andheri",
    completedDate: "2024-01-25",
    rating: 4,
  },
  {
    id: "4",
    title: "Street Light Fix - Bandra",
    completedDate: "2024-01-20",
    rating: 5,
  },
  {
    id: "5",
    title: "Footpath Repair - Santacruz",
    completedDate: "2024-01-15",
    rating: 4,
  },
];

// const employeeProfile = {
//   name: "Rajesh Kumar",
//   department: "Road Maintenance - BMC",
//   employeeId: "EMP-2024-0847",
//   email: "rajesh.kumar@mcgm.gov.in",
//   rating: 4.5,
//   tasksCompleted: 127,
//   status: "On Duty",
// };

export default function ProfilePage() {
  const router = useRouter();
  const [employeeProfile, setEmployeeProfile] = useState({} as any);
  const [activeTab, setActiveTab] = useState<"profile" | "history">("profile");
  useEffect(() => {
    const handle = async () => {
      
      const res = await fetch("http://localhost:8080/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("employeeToken")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployeeProfile(data);
      } else {
        router.push("/login");
      }
    };
    handle();
  }, []);
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
        />,
      );
    }
    return stars;
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full bg-[#0d2673] py-3 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push("/home")}
            className="text-white p-1"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Profile</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Profile Card */}
          <Card className="p-6 bg-white border-0 shadow-md rounded-2xl">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full border-2 border-[#0d2673] bg-[#0d2673]/10 flex items-center justify-center mb-3">
                <div className="w-20 h-20 rounded-full bg-[#0d2673]/20 flex items-center justify-center">
                  <span className="text-[#0d2673] text-2xl font-bold">RK</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#0d2673]">
                {employeeProfile.username}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-green-500 font-medium text-sm">
                  {employeeProfile.status}
                </span>
              </div>
            </div>

            {/* Info Cards */}
            <div className="space-y-3">
              <Card className="p-4 bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-[#0d2673]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-semibold text-[#0d2673]">
                      {employeeProfile.department||"Electricty Maintenance - BMC"}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-[#0d2673]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Employee ID</p>
                    <p className="font-semibold text-[#0d2673]">
                      {employeeProfile.employeeId||"6983a53ddc77a8e4db2710bc"}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-[#0d2673]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-[#0d2673]">
                      {employeeProfile.email}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Card className="p-4 bg-amber-50 border-0 rounded-xl text-center">
                <div className="flex justify-center mb-1">
                  {renderStars(Math.floor(employeeProfile.rating))}
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {employeeProfile.rating}
                </p>
                <p className="text-xs text-amber-700">Rating</p>
              </Card>
              <Card className="p-4 bg-green-50 border-0 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-600">
                  {employeeProfile.tasksCompleted}
                </p>
                <p className="text-xs text-green-700">Tasks Completed</p>
              </Card>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full mt-4 border-red-500 text-red-500 hover:bg-red-50 rounded-full bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </Card>

          {/* Task History Section */}
          <div>
            <h3 className="text-lg font-bold text-[#0d2673] mb-4">
              Task History
            </h3>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="p-4 bg-white border-0 shadow-sm rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#0d2673] text-sm truncate pr-2">
                          {task.title}
                        </h4>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                          Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>{task.completedDate}</span>
                      </div>
                      <div className="flex">{renderStars(task.rating)}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <button
            onClick={() => router.push("/home")}
            className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400 hover:text-[#0d2673]"
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs">Tasks</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-4 text-[#0d2673]">
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
