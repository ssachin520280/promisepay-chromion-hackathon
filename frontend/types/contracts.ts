import { Timestamp } from "firebase/firestore";

export interface Contract {
  id: string;
  title: string;
  description: string;
  aiApproved?: boolean;
  clientApproved?: boolean;
  amount: number; // ETH value
  amountUsd: number; // USD value at contract creation
  usdPerEth?: number; // USD/ETH price at contract creation
  deadline: string; // Store as "YYYY-MM-DD" string to match Firestore schema
  status: "pending" | "active" | "submitted" | "completed" | "cancelled";
  clientId: string;
  clientName: string;
  clientEmail: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  createdAt: Date | Timestamp;
  acceptedAt?: Date | Timestamp | null;
  submittedAt?: Date | Timestamp | null;
  completedAt?: Date | Timestamp | null;
  blockchainHash?: string | null;
  clientWallet?: string;        
  freelancerWallet?: string;
  projectId?: string;       

  rating?: {
    clientToFreelancer?: {
      stars: number;
      comment: string;
      createdAt: Date | Timestamp | null;
    };
    freelancerToClient?: {
      stars: number;
      comment: string;
      createdAt: Date | Timestamp | null;
    };
  };

  unionLogs?: {
    contractHash?: string | null;
    ratingHash?: string | null;
  };
}

export interface Rating {
  stars: number; // 1-5
  comment: string;
  createdAt: Timestamp;
  raterType: "client" | "freelancer";
}

export type FilterStatus = "all" | "pending" | "active" | "submitted" | "completed" | "cancelled";

export type ContractStatusBadgeType = {
  pending: "waiting for acceptance";
  active: "in progress";
  submitted: "waiting for approval";
  completed: "completed";
  cancelled: "cancelled";
};
