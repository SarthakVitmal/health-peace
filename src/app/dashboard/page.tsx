"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  AlertOctagon,
  ArrowRight,
  BookOpen,
  CalendarIcon,
  FileText,
  HeartPulse,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  Music,
  Settings,
  Sun,
  ThumbsUp,
  User,
  Video,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

export default function MentalEaseDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [firstName, setFirstName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();

        if (response.ok) {
          setFirstName(data.user.firstName);
        } else {
          router.push("/login"); 
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUserData();
  }, []);

  // Sample mood data
  const moodData: Record<string, "happy" | "sad" | "depressed"> = {
    "2025-03-01": "happy",
    "2025-03-05": "happy",
    "2025-03-08": "happy",
    "2025-03-10": "sad",
    "2025-03-12": "sad",
    "2025-03-15": "depressed",
    "2025-03-18": "happy",
    "2025-03-20": "happy",
  };

  // Sample mood summary data
  const moodSummary = {
    happy: 12,
    sad: 5,
    depressed: 2,
    total: 19,
  };

  // Sample resources
  const resources = [
    {
      title: "Understanding Anxiety",
      type: "Article",
      icon: FileText,
      description: "Learn about the causes and symptoms of anxiety disorders.",
      href: "/resources/anxiety",
    },
    {
      title: "Mindfulness Meditation",
      type: "Video",
      icon: Video,
      description: "A 10-minute guided meditation for stress relief.",
      href: "/resources/meditation",
    },
    {
      title: "Cognitive Behavioral Therapy",
      type: "Guide",
      icon: BookOpen,
      description: "An introduction to CBT techniques for managing negative thoughts.",
      href: "/resources/cbt",
    },
  ];

  // Quick actions
  const actions = [
    {
      title: "Chat with AI",
      icon: MessageSquare,
      href: "/chat",
      color: "text-blue-600",
    },
    {
      title: "Mood Tracking",
      icon: CalendarIcon,
      href: "/mood",
      color: "text-green-600",
    },
    {
      title: "Resources",
      icon: HeartPulse,
      href: "/resources",
      color: "text-purple-600",
    },
    {
      title: "Playlists",
      icon: Music,
      href: "/playlists",
      color: "text-amber-600",
    },
    {
      title: "Emergency",
      icon: AlertOctagon,
      href: "/emergency",
      color: "text-red-600",
      variant: "destructive" as const,
    },
  ];

  // Sidebar menu items
  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Chat with AI",
      icon: MessageSquare,
      href: "/chat",
    },
    {
      title: "Mood Tracking",
      icon: CalendarIcon,
      href: "/mood",
    },
    {
      title: "Resources",
      icon: HeartPulse,
      href: "dashboard/resources",
    },
    {
      title: "Playlists",
      icon: Music,
      href: "dashboard/playlist",
    },
    {
      title: "Feedback",
      icon: ThumbsUp,
      href: "/feedback",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  // Helper functions
  const calculatePercentage = (value: number) => {
    return Math.round((value / moodSummary.total) * 100);
  };

  const getMoodColor = (date: Date | undefined) => {
    if (!date) return "";

    const dateString = format(date, "yyyy-MM-dd");
    const mood = moodData[dateString];

    if (mood === "happy") return "bg-green-500";
    if (mood === "sad") return "bg-blue-500";
    if (mood === "depressed") return "bg-red-500";

    return "";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white font-sans">
        {/* Sidebar */}
        <Sidebar className="bg-gray-50 border-r border-gray-200">
          <SidebarHeader className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MentalEase</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.title === "Dashboard"}
                    tooltip={item.title}
                    className="hover:bg-gray-100 my-1 p-4"
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5 text-gray-700" />
                      <span className="text-gray-900 text-[16px]">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button variant="destructive" className="w-full justify-start gap-2">
              <AlertOctagon className="h-5 w-5" />
              <span>Emergency Assistance</span>
            </Button>
            <div className="mt-4 flex items-center justify-between">
              {/* User Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">User</p>
                      <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="mx-auto w-full">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back to MentalEase. How are you feeling today?</p>
            </div>

            {/* Dashboard Content */}
            <div className="grid gap-6">
              {/* Welcome Card */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Welcome {firstName}</h2>
                      <p className="mt-1 text-gray-600">Your personal mental health companion</p>
                    </div>
                    <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Link href="/chat">
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat with AI</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                    {actions.map((action) => (
                      <Button
                        key={action.title}
                        variant="outline"
                        className="flex h-24 flex-col items-center justify-center gap-2 bg-white hover:bg-gray-50"
                        asChild
                      >
                        <Link href={action.href}>
                          <action.icon className={cn("h-6 w-6", action.color)} />
                          <span className="text-gray-900">{action.title}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mood Summary */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Monthly Mood Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["happy", "sad", "depressed"].map((mood) => (
                      <div key={mood} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 capitalize">{mood}</span>
                          <span className="font-medium text-gray-900">
                            {calculatePercentage(moodSummary[mood as keyof typeof moodSummary])}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className={cn(
                              "h-2 rounded-full",
                              mood === "happy" && "bg-green-500",
                              mood === "sad" && "bg-blue-500",
                              mood === "depressed" && "bg-red-500",
                            )}
                            style={{
                              width: `${calculatePercentage(moodSummary[mood as keyof typeof moodSummary])}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calendar */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Mood Tracking</CardTitle>
                  <div className="flex items-center space-x-2">
                    {["happy", "sad", "depressed"].map((mood) => (
                      <div key={mood} className="flex items-center space-x-1">
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full",
                            mood === "happy" && "bg-green-500",
                            mood === "sad" && "bg-blue-500",
                            mood === "depressed" && "bg-red-500",
                          )}
                        />
                        <span className="text-xs text-gray-600 capitalize">{mood}</span>
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[280px] justify-start text-left font-normal bg-white",
                            !date && "text-gray-400",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-gray-600" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const currentDate = new Date(2025, 2, day); // March 2025
                      const dateString = format(currentDate, "yyyy-MM-dd");
                      const mood = moodData[dateString];

                      let bgColor = "bg-gray-200";
                      if (mood === "happy") bgColor = "bg-green-500";
                      if (mood === "sad") bgColor = "bg-blue-500";
                      if (mood === "depressed") bgColor = "bg-red-500";

                      return (
                        <div
                          key={day}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full text-sm",
                            bgColor,
                            mood ? "text-white" : "text-gray-900",
                          )}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Mental Health Resources */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Mental Health Resources</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/resources" className="gap-1 text-blue-600 hover:text-blue-700">
                      <span>View all</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {resources.map((resource) => (
                      <Card key={resource.title} className="bg-white shadow-sm">
                        <div className="p-4">
                          <resource.icon className="h-8 w-8 text-blue-600" />
                          <h3 className="mt-2 text-lg font-semibold text-gray-900">{resource.title}</h3>
                          <p className="text-xs text-gray-600">{resource.type}</p>
                          <p className="mt-2 text-sm text-gray-600">{resource.description}</p>
                          <Button variant="link" className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-700" asChild>
                            <Link href={resource.href}>Read more</Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}