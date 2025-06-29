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
import { User, Mail, Shield, Bell, Globe, Wallet, Building } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"

export default function ClientSettingsPage() {
    return (
        <div>
            <DashboardHeader userType="client" userName="Client" />
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
                                Update your personal information and company profile
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src="/avatars/client.jpg" />
                                    <AvatarFallback>TC</AvatarFallback>
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
                                    <Input id="lastName" defaultValue="Smith" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue="john.smith@company.com" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company Name</Label>
                                <Input id="company" defaultValue="TechCorp Inc." />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <Input id="position" defaultValue="Project Manager" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Company Description</Label>
                                <Textarea 
                                    id="bio" 
                                    placeholder="Tell freelancers about your company and projects"
                                    rows={4}
                                    defaultValue="We are a technology company focused on innovative web solutions and mobile applications."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Select defaultValue="technology">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                        <SelectItem value="education">Education</SelectItem>
                                        <SelectItem value="retail">Retail</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    <Input id="username" defaultValue="techcorp" />
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

                        {/* Company Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Company
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Company Size</Label>
                                    <Select defaultValue="10-50">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-10">1-10 employees</SelectItem>
                                            <SelectItem value="10-50">10-50 employees</SelectItem>
                                            <SelectItem value="50-200">50-200 employees</SelectItem>
                                            <SelectItem value="200+">200+ employees</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Budget Range</Label>
                                    <Select defaultValue="medium">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small">$1K - $10K</SelectItem>
                                            <SelectItem value="medium">$10K - $50K</SelectItem>
                                            <SelectItem value="large">$50K+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                        <Label>Project Updates</Label>
                                        <p className="text-sm text-muted-foreground">
                                        Get notified of project progress
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
                                        <Label>Company Profile</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show company info to freelancers
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Project History</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display completed projects
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