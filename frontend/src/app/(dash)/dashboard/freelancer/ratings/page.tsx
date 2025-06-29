"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"

export default function RatingsPage() {
    // Mock data - replace with real data from your backend
    const ratings = [
        {
            id: "1",
            client: "TechCorp Inc.",
            avatar: "/avatars/techcorp.jpg",
            rating: 5,
            comment: "Excellent work! The website redesign exceeded our expectations. Very professional and responsive.",
            project: "Website Redesign",
            date: "2024-01-30",
            helpful: 3
        },
        {
            id: "2",
            client: "StartupXYZ",
            avatar: "/avatars/startup.jpg",
            rating: 5,
            comment: "Amazing mobile app development. Delivered on time and the quality is outstanding.",
            project: "Mobile App Development",
            date: "2024-01-25",
            helpful: 5
        },
        {
            id: "3",
            client: "Design Studio",
            avatar: "/avatars/design.jpg",
            rating: 4,
            comment: "Great logo design work. Very creative and professional. Would definitely recommend!",
            project: "Logo Design",
            date: "2024-01-20",
            helpful: 2
        }
    ]

    const averageRating = 4.7
    const totalReviews = ratings.length
    const fiveStarReviews = ratings.filter(r => r.rating === 5).length

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
            />
        ))
    }

    return (
        <div>
            <DashboardHeader userType="freelancer" userName="Freelancer" />
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Ratings & Reviews</h1>
                    <p className="text-muted-foreground">See what clients say about your work</p>
                </div>

                {/* Rating Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageRating}</div>
                            <div className="flex items-center mt-1">
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Based on {totalReviews} reviews</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
                            <Star className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fiveStarReviews}</div>
                            <p className="text-xs text-muted-foreground">
                                {Math.round((fiveStarReviews / totalReviews) * 100)}% of total reviews
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalReviews}</div>
                            <p className="text-xs text-muted-foreground">Client feedback received</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reviews List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Client Reviews</CardTitle>
                        <CardDescription>
                            Recent feedback from your clients
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {ratings.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                                <div className="flex items-start space-x-4">
                                    <Avatar>
                                        <AvatarImage src={review.avatar} />
                                        <AvatarFallback>
                                            {review.client.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="font-medium">{review.client}</h3>
                                                <p className="text-sm text-muted-foreground">{review.project}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <Badge variant="outline">{review.rating}/5</Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{new Date(review.date).toLocaleDateString()}</span>
                                            <div className="flex items-center space-x-1">
                                                <ThumbsUp className="w-3 h-3" />
                                                <span>{review.helpful} found this helpful</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 