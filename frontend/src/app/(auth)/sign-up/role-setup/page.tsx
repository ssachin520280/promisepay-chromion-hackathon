"use client"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db } from "../../../../../firebase/client"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import FormField from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { ChangeEvent } from "react"

const roleSetupSchema = z.object({
    role: z.enum(["client", "freelancer"]),
    company: z.string().optional(),
    title: z.string().optional(),
    skills: z.array(z.string()).optional(),
    hourlyRate: z.number().optional(),
    availability: z.enum(["available", "busy", "unavailable"]).optional(),
})

type RoleSetupForm = z.infer<typeof roleSetupSchema>

type UserData = {
    role: "client" | "freelancer";
    createdAt: Date;
    updatedAt: Date;
    company?: string;
    title?: string;
    skills?: string[];
    hourlyRate?: number;
    availability?: "available" | "busy" | "unavailable";
    [key: string]: string | number | boolean | Date | string[] | undefined;
}

const SelectRole = () => {
    const router = useRouter()
    const form = useForm<RoleSetupForm>({
        resolver: zodResolver(roleSetupSchema),
        defaultValues: {
            role: undefined,
            company: "",
            title: "",
            skills: [],
            hourlyRate: undefined,
            availability: "available",
        },
    })

    const onSubmit = async (values: RoleSetupForm) => {
        const user = auth.currentUser
        if (!user) return toast.error("No user logged in")

        try {
            const userData: UserData = {
                role: values.role,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            if (values.role === "client") {
                if (values.company) userData.company = values.company
            } else {
                if (values.title) userData.title = values.title
                if (values.skills) userData.skills = values.skills
                if (values.hourlyRate) userData.hourlyRate = values.hourlyRate
                if (values.availability) userData.availability = values.availability
            }

            await updateDoc(doc(db, "users", user.uid), userData)

            toast.success(`Role set as ${values.role}`)
            router.push(`/dashboard/${values.role}`)
        } catch (err) {
            console.error(err)
            toast.error("Failed to set role.")
        }
    }

    const selectedRole = form.watch("role")

    const handleSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
        const skills = e.target.value.split(",").map((s: string) => s.trim())
        form.setValue("skills", skills)
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-8">Complete Your Profile</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium">Choose your role:</h2>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant={selectedRole === "client" ? "default" : "outline"}
                                className="flex-1 py-8"
                                onClick={() => form.setValue("role", "client")}
                            >
                                Client
                            </Button>
                            <Button
                                type="button"
                                variant={selectedRole === "freelancer" ? "default" : "outline"}
                                className="flex-1 py-8"
                                onClick={() => form.setValue("role", "freelancer")}
                            >
                                Freelancer
                            </Button>
                        </div>
                    </div>

                    {selectedRole === "client" && (
                        <FormField
                            control={form.control}
                            name="company"
                            label="Company Name"
                            placeholder="Enter your company name"
                            type="text"
                        />
                    )}

                    {selectedRole === "freelancer" && (
                        <>
                            <FormField
                                control={form.control}
                                name="title"
                                label="Professional Title"
                                placeholder="e.g. Senior Developer, UI/UX Designer"
                                type="text"
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Skills</label>
                                <input
                                    type="text"
                                    placeholder="Enter your skills (comma-separated)"
                                    className="w-full p-2 border rounded-md"
                                    onChange={handleSkillsChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    placeholder="Enter your hourly rate"
                                    className="w-full p-2 border rounded-md"
                                    onChange={(e) => form.setValue("hourlyRate", Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Availability</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    onChange={(e) => form.setValue("availability", e.target.value as "available" | "busy" | "unavailable")}
                                >
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                            </div>
                        </>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!selectedRole}
                    >
                        Complete Setup
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default SelectRole
