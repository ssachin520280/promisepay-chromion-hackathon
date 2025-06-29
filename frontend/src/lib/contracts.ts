import { Timestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/client";
import { Contract, Rating } from "../../types/contracts";

type FirestoreRating = {
    comment?: unknown;
    stars?: unknown;
    createdAt?: Timestamp;
};

const isValidRating = (data: FirestoreRating): data is {
    comment: string;
    stars: number;
    createdAt?: Timestamp;
} => {
    return (
        typeof data.comment === 'string' &&
        typeof data.stars === 'number' &&
        data.stars >= 1 &&
        data.stars <= 5
    );
};

const parseContractData = (doc: any): Contract => {
    const data = doc.data();

    const parseRating = (
        input: unknown,
        raterType: "client" | "freelancer"
    ): Rating | undefined => {
        if (!input || !isValidRating(input)) return undefined;
        return {
            comment: input.comment,
            stars: input.stars,
            createdAt: input.createdAt || Timestamp.now(),
            raterType
        };
    };

    return {
        id: doc.id,
        title: data.title,
        description: data.description,
        amount: data.amount,
        amountUsd: data.amountUsd,
        aiApproved: data.aiApproved ?? false,
        projectId: data.projectId,
        deadline: data.deadline,
        status: data.status,
        clientId: data.clientId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        freelancerId: data.freelancerId,
        freelancerName: data.freelancerName,
        freelancerEmail: data.freelancerEmail,
        createdAt: data.createdAt || Timestamp.now(),
        acceptedAt: data.acceptedAt,
        submittedAt: data.submittedAt,
        completedAt: data.completedAt,
        blockchainHash: data.blockchainHash ?? data.contractHash,
        rating: data.rating ? {
            clientToFreelancer: parseRating(data.rating.clientToFreelancer, "client"),
            freelancerToClient: parseRating(data.rating.freelancerToClient, "freelancer")
        } : undefined,
        unionLogs: data.unionLogs ? {
            contractHash: data.unionLogs.contractHash,
            ratingHash: data.unionLogs.ratingHash
        } : undefined
    } satisfies Contract;
};

export async function getContractsByClientId(clientId: string): Promise<Contract[]> {
    try {
        const q = query(collection(db, "contracts"), where("clientId", "==", clientId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(parseContractData);
    } catch (error) {
        console.error("Failed to fetch contracts:", error);
        return [];
    }
}

export async function getContractsByFreelancerId(freelancerId: string): Promise<Contract[]> {
    try {
        const q = query(collection(db, "contracts"), where("freelancerId", "==", freelancerId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(parseContractData);
    } catch (error) {
        console.error("Failed to fetch contracts:", error);
        return [];
    }
}