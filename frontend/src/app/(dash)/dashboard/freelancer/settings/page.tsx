"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Bell, Globe, Wallet } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"

export default function SettingsPage() {
    return (
        <div>
            <DashboardHeader userType="freelancer" userName="Freelancer" />
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Settings */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Profile Settings
                            </CardTitle>
                            <CardDescription>
                                Update your personal information and profile
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src="/avatars/user.jpg" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button variant="outline">Change Avatar</Button>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        JPG, PNG or GIF. Max size 2MB.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue="John" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue="john.doe@example.com" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea 
                                    id="bio" 
                                    placeholder="Tell clients about yourself and your skills"
                                    rows={4}
                                    defaultValue="Experienced web developer with 5+ years of experience in React, Node.js, and modern web technologies."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">Skills</Label>
                                <Input 
                                    id="skills" 
                                    placeholder="e.g., React, TypeScript, Node.js, UI/UX Design"
                                    defaultValue="React, TypeScript, Node.js, UI/UX Design"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hourlyRate">Hourly Rate (ETH)</Label>
                                <Input id="hourlyRate" type="number" step="0.01" defaultValue="0.05" />
                            </div>

                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>

                    {/* Sidebar Settings */}
                    <div className="space-y-6">
                        {/* Account Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Account
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" defaultValue="johndoe" />
                                </div>
                                <Button variant="outline" className="w-full">Change Password</Button>
                                <Button variant="outline" className="w-full">Two-Factor Authentication</Button>
                            </CardContent>
                        </Card>

                        {/* Wallet Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5" />
                                    Wallet
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Connected Wallet</Label>
                                    <div className="text-sm text-muted-foreground">
                                        0x1234...5678
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">Change Wallet</Button>
                            </CardContent>
                        </Card>

                        {/* Notification Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive updates via email
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>New Contract Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified of new contracts
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Message Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notify when you receive messages
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Privacy Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    Privacy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Profile Visibility</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show profile to potential clients
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Online Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show when you're online
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
} 