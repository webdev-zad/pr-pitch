"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, LogOut, User } from "lucide-react";
import { toast } from "sonner";

interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (session) {
      fetchMessages();
      sendAutomaticEmail();
    }
  }, [session]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gmail/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        toast.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const sendAutomaticEmail = async () => {
    setSending(true);
    try {
      const response = await fetch("/api/gmail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: session?.user?.email,
          subject: "PR Pitch System - Welcome!",
          body: `Hello ${session?.user?.name},\n\nWelcome to the PR Pitch Management System! This is an automatic email sent upon authentication.\n\nBest regards,\nPR Pitch Team`,
        }),
      });

      if (response.ok) {
        toast.success("Welcome email sent automatically!");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setSending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">PR Pitch Management</CardTitle>
            <CardDescription>
              Connect your Gmail account to manage PR pitches and communications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => signIn("google")} className="w-full" size="lg">
              <Mail className="mr-2 h-4 w-4" />
              Sign in with Gmail
            </Button>
            <p className="text-xs text-gray-500 text-center">
              We&apos;ll read your last 5 messages and send a welcome email
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">PR Pitch Management</h1>
              <Badge variant="secondary">Demo</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm text-gray-700">{session.user?.name}</span>
              </div>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gmail Connected</p>
                    <p className="text-2xl font-bold text-green-600">✓</p>
                  </div>
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Messages Loaded</p>
                    <p className="text-2xl font-bold">{messages.length}</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Auto Email</p>
                    <p className="text-2xl font-bold text-green-600">{sending ? "Sending..." : "Sent"}</p>
                  </div>
                  <Send className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Gmail Messages</CardTitle>
                <CardDescription>Your last 5 received messages</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={message.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {message.subject || "(No Subject)"}
                          </h3>
                          <Badge variant="outline">{index + 1}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">From: {message.from}</p>
                        <p className="text-sm text-gray-700 mb-2">{message.snippet}</p>
                        <p className="text-xs text-gray-500">{new Date(message.date).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No messages found</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>PR pitch management tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={fetchMessages} disabled={loading} className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Refresh Messages
                </Button>

                <Button onClick={sendAutomaticEmail} disabled={sending} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email
                </Button>

                <Separator />

                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Demo Features:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Gmail OAuth authentication</li>
                    <li>• Read last 5 messages</li>
                    <li>• Automatic email sending</li>
                    <li>• Clean, responsive UI</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
