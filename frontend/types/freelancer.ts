export interface Freelancer {
    id: string;
    email: string;
    name: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
    // Professional information
    title?: string;
    skills: string[];
    hourlyRate?: number;
    availability?: 'available' | 'busy' | 'unavailable';
    // Contract related fields
    activeContracts?: string[]; // Array of contract IDs
    completedContracts?: string[]; // Array of contract IDs
    // Portfolio and work
    portfolio?: PortfolioItem[];
    // Rating and reviews
    rating?: number;
    totalReviews?: number;
    // Communication
    conversations?: string[]; // Array of conversation IDs
}

export interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    images?: string[];
    technologies: string[];
    url?: string;
    createdAt: Date;
}

export interface FreelancerProfile extends Freelancer {
    // Additional profile information
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        behance?: string;
        dribbble?: string;
    };
    // Professional details
    experience?: Experience[];
    education?: Education[];
    certifications?: Certification[];
    // Preferences
    notificationPreferences?: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    // Verification
    isVerified: boolean;
    verificationDate?: Date;
    // Payment information
    paymentDetails?: {
        bankAccount?: string;
        paypalEmail?: string;
    };
}

export interface Experience {
    id: string;
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: Date;
    expiryDate?: Date;
    credentialUrl?: string;
} 