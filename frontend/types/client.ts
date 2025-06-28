export interface Client {
    id: string;
    email: string;
    name: string;
    company?: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
    // Contract related fields
    activeContracts?: string[]; // Array of contract IDs
    completedContracts?: string[]; // Array of contract IDs
    // Payment related fields
    paymentMethods?: PaymentMethod[];
    // Rating and reviews
    rating?: number;
    totalReviews?: number;
    // Communication
    conversations?: string[]; // Array of conversation IDs
}

export interface PaymentMethod {
    id: string;
    type: 'credit_card' | 'bank_transfer' | 'paypal';
    last4?: string;
    isDefault: boolean;
    createdAt: Date;
}

export interface ClientProfile extends Client {
    // Additional profile information
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
    };
    // Preferences
    notificationPreferences?: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    // Verification
    isVerified: boolean;
    verificationDate?: Date;
} 