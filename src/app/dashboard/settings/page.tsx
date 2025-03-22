"use client";

import { useState, useEffect } from "react";
import { User, Trash2, Lock, Bell, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {toast, Toaster} from 'sonner'
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");  
  const [email, setEmail] = useState("");
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const router = useRouter();

  // Handle deleting chat history
  const handleDeleteHistory = async () => {
    setIsDeletingHistory(true);
    try {
      // Simulate API call to delete chat history
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(
        "Your chat history has been deleted.",
      );
    } catch (error) {
      toast.error(
         "Failed to delete chat history. Please try again.",
      );
    } finally {
      setIsDeletingHistory(false);
    }
  };

  useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await fetch("/api/auth/user");
          const data = await response.json();
  
          if (response.ok) {
            setFirstName(data.user.firstName);
            setEmail(data.user.email);
          } else {
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
        }
      };
  
      fetchUserData();
      const intervalId = setInterval(fetchUserData, 60000);
  
      return () => clearInterval(intervalId);
    }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 font-sans">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Profile Section */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </Label>
                <Input
                  id="name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-white"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="delete-history" className="text-sm font-medium text-gray-700">
                    Delete Chat History
                  </Label>
                  <p className="text-sm text-gray-500">
                    Permanently delete your chat history with the AI model.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteHistory}
                  disabled={isDeletingHistory}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletingHistory ? "Deleting..." : "Delete History"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications about updates and reminders.
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={isNotificationEnabled}
                  onCheckedChange={setIsNotificationEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Change Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  className="mt-1 bg-white"
                />
              </div>
              <Button className="bg-green-600 hover:bg-green-700">Update Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-red-600" />
              Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If you need assistance, please contact our support team at{" "}
                <a href="mailto:support@mindease.com" className="text-blue-600 hover:underline">
                  support@mindease.com
                </a>
                .
              </p>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster richColors position='top-center' />
    </div>
  );
}