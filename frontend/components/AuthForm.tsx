"use client"
import { signInWithPopup } from "firebase/auth"
import { auth, db, provider } from "../firebase/client"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import FormField from "@/components/FormField"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import Image from "next/image"
import { doc, getDoc, setDoc } from "firebase/firestore"

const authFormSchema = (type: FormType) =>
    z.object({
        name: type === "sign-up" ? z.string().min(3, "Name is too short") : z.string().optional(),
        email: z.string().email("Invalid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
    })

import { useEffect } from "react";

const AuthForm = ({ type }: { type: FormType }) => {
    const formSchema = authFormSchema(type)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    // Added useEffect as requested
    useEffect(() => {
        // Example: Log when AuthForm mounts or type changes
        // You can replace this with any side effect you need
        console.log("AuthForm mounted");
        console.log(46, process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
       
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            // Send idToken to your backend to create session cookies
            const response = await signIn({
                email: user.email!,
                idToken,
            });

            if (!response?.success) {
                toast.error(response.message || "Google sign-in failed.");
                return;
            }

            // 🔍 Check if user exists in Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (!userSnapshot.exists()) {
                // New user: create user in Firestore
                await setDoc(userDocRef, {
                    name: user.displayName,
                    email: user.email,
                });

                toast.success("Account created! Please select your role.");
                router.push("/sign-up/role-setup");
            } else {
                const userData = userSnapshot.data();
                const role = userData.role;

                toast.success("Signed in with Google!");
                router.push(role ? `/dashboard/${role}` : "/sign-up/role-setup");
            }
        } catch (error) {
            console.error(error);
            toast.error("Google sign-in failed.");
        }
    };


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const auths = auth;
            const { email, password } = values

            if (type === "sign-up") {
                const { name } = values

                // Create the user with Firebase
                const userCredentials = await createUserWithEmailAndPassword(auths, email, password)

                // Create user in Firestore and handle success
                const result = await signUp({
                    uid: userCredentials.user.uid,
                    name: name!,
                    email,
                    password, // preserved as requested
                })

                if (!result?.success) {
                    toast.error(result.message || "Something went wrong.")
                    return
                }

                toast.success("Account created successfully. Select your role now!")
                router.push("/sign-up/role-setup")
            } else {
                // Sign-in with Firebase credentials
                const userCredential = await signInWithEmailAndPassword(auths, email, password)
                const idToken = await userCredential.user.getIdToken()

                if (!idToken) {
                    toast.error("Sign in failed.")
                    return
                }

                // Handle user sign-in and session
                const result = await signIn({
                    email,
                    idToken,
                })

                if (!result?.success) {
                    toast.error(result.message || "Sign in failed.")
                    return
                }

                toast.success("Logged in! Redirecting to dashboard.")
                router.push("/")
            }
        } catch (error: unknown) {
            console.error(error)
            const message =
                error instanceof FirebaseError
                    ? error.message
                    : "Something went wrong."
            toast.error(message)
        }
    }

    const isSignIn = type === "sign-in"

    return (
        <div className="lg:min-w-[566px] border bg-white dark:bg-slate-900 rounded-lg shadow-md p-8 space-y-4">
            <div className="flex flex-col items-center justify-center space-x-2 mb-4 py-14 px-10">
                <h1 className="text-2xl font-bold text-center">Welcome to PromisePay</h1>
                <p className="text-sm text-muted-foreground text-center">
                    Decentralized Escrow for a Borderless Workforce.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {!isSignIn && (
                        <FormField
                            control={form.control}
                            name="name"
                            label="Name"
                            placeholder="Enter your name"
                            type="text"
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="email"
                        label="Email"
                        placeholder="Enter your mail ID"
                        type="email"
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                    />
                    <Button
                        className="w-full border rounded-4xl hover:cursor-pointer hover:text-white hover:bg-gray-700"
                        type="submit"
                    >
                        {isSignIn ? "Sign In" : "Create an Account"}
                    </Button>
                    <Button
                        className="w-full border rounded-4xl mt-2 hover:cursor-pointer hover:bg-gray-800 hover:text-white bg-white flex items-center justify-center gap-2"
                        onClick={handleGoogleSignIn}
                        type="button"
                    >
                        <Image
                            src="https://cdn.iconfinder.com/data/icons/social-media-2210/24/Google-512.png"
                            alt="Google logo"
                            width={20}
                            height={20}
                        />
                        Continue with Google
                    </Button>

                </form>
            </Form>

            <p className="text-sm text-muted-foreground text-center">
                {isSignIn ? "No account yet?" : "Have an account already?"}
                <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="ml-1 underline">
                    {isSignIn ? "Sign Up" : "Sign In"}
                </Link>
            </p>
        </div>
    )
}

export default AuthForm
