"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import Loader from "@/components/loader";
import { toast, Toaster } from "sonner";

interface Mood {
  date: string;
  mood: string;
}

interface DailyQuote {
  q: string;
  a: string;
}

interface Resource {
  title: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
}

interface QuickAction {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  variant?: "destructive";
}

export default function MentalEaseDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [firstName, setFirstName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [moodData, setMoodData] = useState<Record<string, string>>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loadingMoodData, setLoadingMoodData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyQuote, setDailyQuote] = useState<{
    q: string;
    a: string;
  } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);

  const router = useRouter();
  const { data: session } = useSession();

    // Memoized User Data Fetching
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/user", {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();

      if (response.ok) {
        setFirstName(data.user.firstName);
        setUserId(data.user._id);
        await checkMoodStatus(data.user._id);
      } else {
        handleAuthError();
      }
    } catch (error) {
      handleAuthError();
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Memoized Mood Data Fetching
  const fetchMoodData = useCallback(async () => {
    if (!userId) return;

    try {
      const month = format(selectedMonth, "yyyy-MM");
      const response = await fetch(`/api/mood?userId=${userId}&month=${month}`, {
        headers: {
          'Cache-Control': 'max-age=3600'
        }
      });
      const data = await response.json();

      if (response.ok) {
        const formattedData = data.moods.reduce((acc: Record<string, string>, mood: Mood) => {
          const date = format(new Date(mood.date), "yyyy-MM-dd");
          acc[date] = mood.mood;
          return acc;
        }, {});
        setMoodData(formattedData);
      } else {
        setError(data.error || "Failed to fetch mood data");
      }
    } catch (error) {
      setError("Error fetching mood data");
    } finally {
      setLoadingMoodData(false);
    }
  }, [userId, selectedMonth]);

  // Memoized Mood Summary
  const moodSummary = useMemo(() => {
    return Object.values(moodData).reduce(
      (acc: { [key: string]: number }, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      },
      { happy: 0, neutral: 0, sad: 0 }
    );
  }, [moodData]);

  // Memoized Total Moods
  const totalMoods = useMemo(() => 
    Object.values(moodSummary).reduce((sum, count) => sum + count, 0),
    [moodSummary]
  );

  // Check Mood Status
  const checkMoodStatus = async (userId: string) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      if (!userId) {
        throw new Error("User ID is missing");
      }

      const response = await fetch(`/api/mood?userId=${userId}&date=${today}`);
      const data = await response.json();

      if (response.ok && !data.mood) {
        setIsMoodModalOpen(true);
      }
    } catch (error) {
      console.error("Error checking mood status:", error);
    }
  };

  // Mood Selection Handler
  const handleMoodSelection = async (mood: string) => {
    setSelectedMood(mood);
    setIsMoodModalOpen(false);

    try {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const payload = {
        userId,
        mood,
        date: format(new Date(), "yyyy-MM-dd"),
      };

      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save mood");
      }

      toast.success("Mood recorded successfully!");
    } catch (error) {
      console.error("Error saving mood:", error);
      toast.error("Failed to record mood");
    }
  };

  // Percentage Calculation
  const calculatePercentage = useCallback((value: number) => {
    return Math.round((value / totalMoods) * 100);
  }, [totalMoods]);

  // Quote Fetching with Local Storage Caching
  const fetchDailyQuote = useCallback(async () => {
    setQuoteLoading(true);
    try {
      const cachedQuote = localStorage.getItem('dailyQuote');
      const cachedTimestamp = localStorage.getItem('dailyQuoteTimestamp');

      if (cachedQuote && cachedTimestamp) {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (parseInt(cachedTimestamp) > oneDayAgo) {
          setDailyQuote(JSON.parse(cachedQuote));
          setQuoteLoading(false);
          return;
        }
      }

      const response = await fetch('/api/quotes');
      const result = await response.json();
      
      localStorage.setItem('dailyQuote', JSON.stringify(result));
      localStorage.setItem('dailyQuoteTimestamp', Date.now().toString());
      
      setDailyQuote(result);
    } catch (error) {
      console.error('Error:', error);
      const fallbackQuotes: DailyQuote[] = [
        {
          q: "You are braver than you believe, stronger than you seem, and smarter than you think.",
          a: "A.A. Milne"
        },
        {
          q: "Mental health is not a destination, but a process.",
          a: "Noam Shpancer"
        }
      ];
      const fallbackQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setDailyQuote(fallbackQuote);
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  // Authentication Error Handler
  const handleAuthError = useCallback(() => {
    if (session) {
      toast.error("Failed to fetch user data");
    } else {
      toast.error("Session expired. Please login again.");
    }
    router.push("/login");
  }, [session, router]);

  // Lifecycle Effects
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  useEffect(() => {
    fetchDailyQuote();
  }, [fetchDailyQuote]);

  // Early Return for Loading States
  if (loading || loadingMoodData) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Static Data with TypeScript
  const resources: Resource[] = [
    {
      title: "Understanding Anxiety",
      type: "Article",
      icon: FileText,
      description: "Learn about the causes and symptoms of anxiety disorders.",
      href: "/dashboard/resources",
    },
    {
      title: "Mindfulness Meditation",
      type: "Video",
      icon: Video,
      description: "A 10-minute guided meditation for stress relief.",
      href: "/dashboard/resources",
    },
    {
      title: "Cognitive Behavioral Therapy",
      type: "Guide",
      icon: BookOpen,
      description: "An introduction to CBT techniques for managing negative thoughts.",
      href: "/dashboard/resources",
    },
  ];

  const actions: QuickAction[] = [
    {
      title: "Chat with AI",
      icon: MessageSquare,
      href: "/dashboard/chat",
      color: "text-blue-600",
    },
    {
      title: "Resources",
      icon: HeartPulse,
      href: "/dashboard/resources",
      color: "text-purple-600",
    },
    {
      title: "Playlists",
      icon: Music,
      href: "/dashboard/playlist",
      color: "text-amber-600",
    },
    {
      title: "Feedback",
      icon: ThumbsUp,
      href: "/dashboard/feedback",
      color: "text-amber-600",
    },
    {
      title: "Emergency",
      icon: AlertOctagon,
      href: "/dashboard/emergency-assistance",
      color: "text-red-600",
      variant: "destructive",
    },
  ];

  const menuItems = [
    { title: "Dashboard", icon: Home, href: "/" },
    { title: "Chat with AI", icon: MessageSquare, href: "/dashboard/chat" },
    { title: "Resources", icon: HeartPulse, href: "/dashboard/resources" },
    { title: "Playlists", icon: Music, href: "dashboard/playlist" },
    { title: "Feedback", icon: ThumbsUp, href: "/dashboard/feedback" },
    { title: "Settings", icon: Settings, href: "dashboard/settings" },
  ];
 

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-b from-gray-50 to-white font-sans">
        {/* Sidebar */}
        <Sidebar className="bg-white border-r border-gray-100 shadow-sm">
          <SidebarHeader className="flex items-center justify-between p-6">
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
                    className="hover:bg-gray-50 my-1 p-4"
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
          <SidebarFooter className="p-6">
            <a href="/dashboard/emergency-assistance" className="cursor-pointer">
              <Button variant="destructive" className="w-full justify-start gap-2 cursor-pointer">
                <AlertOctagon className="h-5 w-5" />
                <span>Emergency Assistance</span>
              </Button>
            </a>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="mx-auto w-full max-w-7xl">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back to MentalEase. How are you feeling today?</p>
            </div>

            {/* Dashboard Content */}
            <div className="grid gap-8">
              {/* Welcome Card */}
              <Card className="bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Welcome {firstName}</h2>
                      <p className="mt-1 text-gray-600">Your personal mental health companion</p>
                    </div>

                    <Dialog open={isMoodModalOpen} onOpenChange={setIsMoodModalOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>How are you feeling today?</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center gap-4">
                          <Button
                            className="bg-green-500 text-white hover:bg-green-600"
                            onClick={() => handleMoodSelection("happy")}
                          >
                            😊 Happy
                          </Button>
                          <Button
                            className="bg-yellow-500 text-white hover:bg-yellow-600"
                            onClick={() => handleMoodSelection("neutral")}
                          >
                            😐 Neutral
                          </Button>
                          <Button
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleMoodSelection("sad")}
                          >
                            😔 Sad
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Link href="/dashboard/chat">
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat with AI</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Motivation */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Daily Motivation</CardTitle>
                </CardHeader>
                <CardContent>
                  {quoteLoading ? (
                    <div className="animate-pulse rounded-lg bg-gray-100 p-6">
                      <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                      <div className="mt-4 h-6 w-1/2 rounded bg-gray-200"></div>
                    </div>
                  ) : dailyQuote ? (
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                      <blockquote className="text-lg italic text-gray-800">
                        "{dailyQuote.q}"
                      </blockquote>
                      <p className="mt-4 text-right font-medium text-gray-600">
                        — {dailyQuote.a}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-100 p-6 text-center text-gray-600">
                      Couldn't load quote. Please try again.
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={fetchDailyQuote}
                    disabled={quoteLoading}
                  >
                    {quoteLoading ? "Loading..." : "Get New Inspiration"}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white shadow-lg">
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
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Monthly Mood Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["happy", "neutral", "sad"].map((mood) => (
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
                              mood === "neutral" && "bg-blue-500",
                              mood === "sad" && "bg-red-500",
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
              <Card className="bg-white shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Mood Tracking</CardTitle>
                  <div className="flex items-center space-x-2">
                    {["happy", "neutral", "sad"].map((mood) => (
                      <div key={mood} className="flex items-center space-x-1">
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full",
                            mood === "happy" && "bg-green-500",
                            mood === "neutral" && "bg-blue-500",
                            mood === "sad" && "bg-red-500",
                          )}
                        />
                        <span className="text-xs text-gray-600 capitalize">{mood}</span>
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const prevMonth = new Date(selectedMonth);
                        prevMonth.setMonth(prevMonth.getMonth() - 1);
                        setSelectedMonth(prevMonth);
                      }}
                    >
                      Previous Month
                    </Button>
                    <span className="text-lg font-bold">
                      {format(selectedMonth, "MMMM yyyy")}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const nextMonth = new Date(selectedMonth);
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        setSelectedMonth(nextMonth);
                      }}
                    >
                      Next Month
                    </Button>
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
                      if (mood === "neutral") bgColor = "bg-blue-500";
                      if (mood === "sad") bgColor = "bg-red-500";

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
              <Card className="bg-white shadow-lg">
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
                        <div className="p-6">
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
      <Toaster richColors position='top-center' />
    </SidebarProvider>
  );
}
