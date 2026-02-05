"use client";

import React, { useMemo } from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Camera,
  Lock,
  MapPin,
  Upload,
  Check,
  Clock,
  History,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Task {
  id: string;
  title: string;
  location: string;
  priority: "high" | "medium" | "low";
  status: "current" | "upcoming" | "completed";
  beforePhoto?: string;
  afterPhoto?: string;
  completedDate?: string;
  rating?: number;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Pothole Repair - Andheri West",
    location: "S.V. Road, Near Andheri Station, Andheri West",
    priority: "high",
    status: "current",
  },
  {
    id: "2",
    title: "Pothole Repair - Bandra",
    location: "Linking Road, Near Bandra Talao, Bandra West",
    priority: "medium",
    status: "upcoming",
  },
  {
    id: "3",
    title: "Road Crack Repair - Western Express",
    location: "Western Express Highway, Near Goregaon",
    priority: "high",
    status: "upcoming",
  },
  {
    id: "4",
    title: "Road Surface Repair - Kurla",
    location: "LBS Marg, Near Kurla Station, Kurla West",
    priority: "low",
    status: "upcoming",
  },
  {
    id: "5",
    title: "Pothole Repair - Dadar",
    location: "Dadar TT Circle, Near Plaza Cinema",
    priority: "medium",
    status: "upcoming",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any>(initialTasks);
  const [beforePhoto, setBeforePhoto] = useState<String | null>(null);
  const [beforePhotoBlob, setBeforePhotoBlob] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<String | null>(null);
  const [afterPhotoBlob, setAfterPhotoBlob] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "history">("tasks");
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const verifyImage = async (file: any) => {
    const formData = new FormData();
    formData.append("media", file);
    formData.append("models", "genai");
    formData.append("api_user", "1161527463");
    formData.append("api_secret", "wVnwV3YU4YuAH3ZvjyBpuzew8cnP4HpA");

    const res = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: formData,
    });
    if (res && res.ok) {
      var data = await res.json();
      console.log(data);
      return data; // 👈 only return data
    } else {
      return null;
    }
  };

  // Load tasks from localStorage on mount
  useEffect(() => {
    const handle = async () => {
      const token = localStorage.getItem("employeeToken");
      if (!token) {
        alert("No employee token found");
        return;
      }

      const response = await fetch("http://localhost:8080/api/employees/job", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setTasks(data);
      } else {
        // If token is invalid or expired, redirect to login
        localStorage.removeItem("employeeToken");
        router.push("/login");
      }
    };
    handle();
  }, []);

  // Save tasks to localStorage when they change
  // useEffect(() => {
  //   localStorage.setItem("bmcTasks", JSON.stringify(tasks))
  // }, [tasks])
  const { currentTask, upcomingTasks, completedTasks } = useMemo(() => {
    const list = tasks?.assignedIssues || [];

    const uncompleted = list.filter((t: any) => t.status !== "completed");

    return {
      currentTask: uncompleted[0] || null,
      upcomingTasks: uncompleted.slice(1),
      completedTasks: list.filter((t: any) => t.status === "completed"),
    };
  }, [tasks?.assignedIssues]);

  const handlePhotoUpload = async (
    type: "before" | "after",
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ✅ SAVE FILE (for backend / multer)
    if (type === "before") {
      setBeforePhotoBlob(file);
    } else {
      setAfterPhotoBlob(file);
    }

    // ✅ OPTIONAL: base64 preview (UI only)
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "before") {
        setBeforePhoto(reader.result as string); // preview
      } else {
        setAfterPhoto(reader.result as string); // preview
      }
    };

    reader.readAsDataURL(file); // 👈 MUST be outside onloadend

    // const result = await verifyImage(file);
    // const aiScore = result?.type?.ai_generated ?? 0;
    const aiScore = 0.5; // Mock score for testing
    if (aiScore && aiScore >= 0.7) {
      // 🚨 AI generated
      // block / reject / warn
      alert("AI-generated images are not allowed. Please upload a real photo.");
      if (type === "before") {
        setBeforePhoto(null);
        setBeforePhotoBlob(null);
      } else {
        setAfterPhoto(null);
        setAfterPhotoBlob(null);
      }
    } else {
      // ✅ Real image
      console.log("Real image detected");
      // allow / continue
    }
  };
  const canCompleteTask = beforePhoto && afterPhoto;

  const handleCompleteTask = async () => {
    if (!beforePhoto || !afterPhoto || !currentTask) return;

    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) return;

      const formData = new FormData();
      formData.append("proofImage", beforePhotoBlob!); // File / Blob
      formData.append("proofImage", afterPhotoBlob!); // File / Blob
      formData.append("description", "Issue resolved successfully");
      console.log(formData);
      const res = await fetch(
        `http://localhost:8080/api/issues/${currentTask._id}/resolve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            ContentType: "multipart/form-data",
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to resolve issue");
        return;
      }

      console.log("Resolved:", data);

      // Optional: refresh tasks from backend
      // await refetchTasks();

      setBeforePhoto(null);
      setAfterPhoto(null);
    } catch (err) {
      console.error("Resolve submit error:", err);
    }
  };
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-amber-400 text-amber-900";
      case "medium":
        return "bg-blue-400 text-blue-900";
      case "low":
        return "bg-green-400 text-green-900";
    }
  };

  const getStatusDotColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-blue-500";
      case "low":
        return "bg-yellow-500";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300 fill-gray-300"}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full bg-[#0d2673] py-3 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1.5">
              <Building2 className="h-5 w-5 text-[#0d2673]" />
            </div>
            <h1 className="text-white text-lg font-bold">BMC</h1>
          </div>

          <button
            onClick={() => router.push("/profile")}
            className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white overflow-hidden"
          >
            <div className="w-full h-full bg-[#0d2673]/20 flex items-center justify-center">
              <span className="text-[#0d2673] text-sm font-medium">RK</span>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        <div className="max-w-lg mx-auto space-y-6">
          {activeTab === "tasks" ? (
            <>
              {/* Current Task Section */}
              {currentTask && (
                <Card className="p-4 bg-white border-0 shadow-md rounded-2xl">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#0d2673] text-white text-xs font-semibold rounded-full">
                      CURRENT TASK
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(currentTask.priority)}`}
                    >
                      {currentTask.priority}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-[#0d2673] mb-2">
                    {currentTask.title}
                  </h2>

                  <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">
                      {currentTask.address}
                    </span>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Before Photo */}
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        Before Photo
                      </p>
                      <input
                        ref={beforeInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload("before", e)}
                        className="hidden"
                      />
                      <button
                        onClick={() => beforeInputRef.current?.click()}
                        className="w-full aspect-square rounded-xl border-2 border-dashed border-[#0d2673]/30 bg-gray-50 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors overflow-hidden"
                      >
                        {beforePhoto ? (
                          <Image
                            src={beforePhoto || "/placeholder.svg"}
                            alt="Before"
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-[#0d2673]/50" />
                            <span className="text-xs text-[#0d2673]/60">
                              Tap to upload
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* After Photo */}
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        After Photo
                      </p>
                      <input
                        ref={afterInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload("after", e)}
                        className="hidden"
                      />
                      <button
                        onClick={() => afterInputRef.current?.click()}
                        className="w-full aspect-square rounded-xl border-2 border-dashed border-[#0d2673]/30 bg-blue-50/50 flex flex-col items-center justify-center gap-2 hover:bg-blue-100/50 transition-colors overflow-hidden"
                      >
                        {afterPhoto ? (
                          <Image
                            src={afterPhoto || "/placeholder.svg"}
                            alt="After"
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-[#0d2673]/50" />
                            <span className="text-xs text-[#0d2673]/60">
                              Tap to upload
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Upload Status */}
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-4 px-1">
                    <span className="text-gray-500">Upload Status:</span>
                    <span
                      className={
                        canCompleteTask
                          ? "text-green-600 font-medium"
                          : "text-[#0d2673]"
                      }
                    >
                      {canCompleteTask
                        ? "Ready to complete"
                        : "Upload both photos"}
                    </span>
                  </div>

                  {/* Upload Buttons */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      onClick={() => beforeInputRef.current?.click()}
                      className="bg-[#0d2673] hover:bg-[#0a1d5a] text-white rounded-full py-4 sm:py-5 text-xs sm:text-sm"
                    >
                      <Upload className="h-4 w-4 mr-1 sm:mr-2" />
                      Before
                    </Button>
                    <Button
                      onClick={() => afterInputRef.current?.click()}
                      variant="outline"
                      className="border-[#0d2673] text-[#0d2673] hover:bg-[#0d2673]/10 rounded-full py-4 sm:py-5 text-xs sm:text-sm"
                    >
                      <Upload className="h-4 w-4 mr-1 sm:mr-2" />
                      After
                    </Button>
                  </div>

                  {/* Complete Task Button */}
                  {canCompleteTask && (
                    <Button
                      onClick={handleCompleteTask}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white rounded-full py-4 sm:py-5"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Complete Task
                    </Button>
                  )}
                </Card>
              )}

              {!currentTask && (
                <Card className="p-6 bg-white border-0 shadow-md rounded-2xl text-center">
                  <Check className="h-16 w-16 text-green-500 mx-auto mb-3" />
                  <h2 className="text-lg font-bold text-[#0d2673] mb-2">
                    All Tasks Completed!
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Great work! Check back later for new assignments.
                  </p>
                </Card>
              )}

              {/* Upcoming Tasks Section */}
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0d2673] mb-4">
                  Upcoming Tasks
                </h2>

                <div className="space-y-3">
                  {upcomingTasks.map((task: any) => (
                    <Card
                      key={task._id}
                      className="p-3 sm:p-4 bg-white border-0 shadow-sm rounded-xl"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Status Dot */}
                        <div
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${getStatusDotColor(task.priority)}`}
                        />

                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#0d2673] text-xs sm:text-sm truncate">
                            {task.title}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {task.address}
                          </p>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-gray-50">
                            <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0d2673]/50" />
                          </div>
                          <div className="p-1.5 sm:p-2 rounded-lg bg-gray-50">
                            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0d2673]/50" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {upcomingTasks.length === 0 && (
                    <Card className="p-4 bg-white border-0 shadow-sm rounded-xl text-center">
                      <p className="text-gray-500 text-sm">No upcoming tasks</p>
                    </Card>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* History Tab */
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0d2673] mb-4">
                Task History
              </h2>

              <div className="space-y-3">
                {completedTasks.map((task: any) => (
                  <Card
                    key={task.id}
                    className="p-3 sm:p-4 bg-white border-0 shadow-sm rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      {/* Check Icon */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      </div>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[#0d2673] text-xs sm:text-sm">
                            {task.title}
                          </h3>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{task.completedDate}</span>
                        </div>
                        <div className="mt-2">
                          {renderStars(task.rating || 5)}
                        </div>

                        {/* Before/After Photos */}
                        {(task.beforePhoto || task.afterPhoto) && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {task.beforePhoto && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Before
                                </p>
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={task.beforePhoto || "/placeholder.svg"}
                                    alt="Before"
                                    width={150}
                                    height={100}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            {task.afterPhoto && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  After
                                </p>
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={task.afterPhoto || "/placeholder.svg"}
                                    alt="After"
                                    width={150}
                                    height={100}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {completedTasks.length === 0 && (
                  <Card className="p-6 bg-white border-0 shadow-sm rounded-xl text-center">
                    <History className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No completed tasks yet
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex flex-col items-center gap-1 py-2 px-4 ${activeTab === "tasks" ? "text-[#0d2673]" : "text-gray-400"}`}
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs font-medium">Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center gap-1 py-2 px-4 ${activeTab === "history" ? "text-[#0d2673]" : "text-gray-400"}`}
          >
            <History className="h-5 w-5" />
            <span className="text-xs">History</span>
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400 hover:text-[#0d2673]"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
