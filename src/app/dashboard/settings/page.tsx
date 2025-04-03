"use client";

import { useState, useEffect } from "react";
import { User, Trash2, Lock, Bell, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast, Toaster } from 'sonner'
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();

        if (response.ok) {
          setFirstName(data.user.firstName);
          setEmail(data.user.email);
          setUserId(data.user._id);
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

  // Handle deleting chat history
  const handleDeleteHistory = async () => {
    setIsDeletingHistory(true);
    try {
      const response = await fetch('/api/sessions/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete history');
      }

      toast.success(
        `Successfully deleted your chat history.`,
        {
          description: 'All your chat history has been permanently removed.',
        }
      );
    } catch (error) {
      toast.error(
        'Failed to delete chat history',
        {
          description: error instanceof Error ? error.message : 'Please try again later.',
        }
      );
    } finally {
      setIsDeletingHistory(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-50 p-6 font-sans">
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
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
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
                    Permanently delete all your chat history with the AI model.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirmation(true)}
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

        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-xl">Confirm Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Are you sure you want to permanently delete all your chat history?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirmation(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      setShowDeleteConfirmation(false);
                      await handleDeleteHistory();
                    }}
                  >
                    Delete All History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Section */}
        {/* <Card className="mb-6 shadow-sm">
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
        </Card> */}

        {/* Security Section */}
        {/* <Card className="mb-6 shadow-sm">
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
        </Card> */}

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
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster richColors position='top-center' />
    </div>
  );
}