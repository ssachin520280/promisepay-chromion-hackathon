import { useState, useEffect } from "react";
import { auth, db } from "../../firebase/client"; // Your Firebase auth import
import { onAuthStateChanged, User } from "firebase/auth"; // Import User type
import { doc, getDoc } from "firebase/firestore"; // Firebase Firestore imports

export function useFirebase() {
    const [user, setUser] = useState<User | null>(null); // Type for user
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Error type as string
    const [role, setRole] = useState<string | null>(null); // Track the user role

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user); // Store user information

                try {
                    // Fetch the user's role from Firestore
                    const userDocRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setRole(userData?.role || null); // Save the role
                    } else {
                        console.error("User data not found in Firestore");
                        setRole(null); // No role if user data doesn't exist
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setError("Error fetching user role"); // Set error state
                }
            } else {
                setUser(null); // Clear user if logged out
                setRole(null); // Clear role if logged out
            }
            setLoading(false); // Loading is done
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    return { user, loading, error, role }; // Return the states
}
