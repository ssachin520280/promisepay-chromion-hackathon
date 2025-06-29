"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardHeader } from "@/components/DashboardHeader"

export default function NewContractPage() {
    return (
        <div>
            <DashboardHeader userType="client" userName="Client" />
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Create New Contract</h1>
                    <p className="text-muted-foreground">Set up a new contract with a freelancer</p>
                </div>
                
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Contract Details</CardTitle>
                        <CardDescription>
                            Fill in the details for your new contract
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Project Title</Label>
                            <Input id="title" placeholder="Enter project title" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="description">Project Description</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Describe the project requirements, deliverables, and expectations"
                                rows={4}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget (ETH)</Label>
                                <Input id="budget" type="number" placeholder="0.0" step="0.01" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (days)</Label>
                                <Input id="duration" type="number" placeholder="30" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="web-development">Web Development</SelectItem>
                                    <SelectItem value="mobile-development">Mobile Development</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="writing">Writing</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="skills">Required Skills</Label>
                            <Input id="skills" placeholder="e.g., React, TypeScript, UI/UX" />
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline">Save Draft</Button>
                            <Button>Create Contract</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 