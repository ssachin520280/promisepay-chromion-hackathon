// src/scripts/createContract.ts

import { db } from "../../../firebase/admin";

export default async function createContract() {
    const contractId = "contract_abc123";

    const contractData = {
        id: contractId,
        title: "Landing Page Design",
        description: "Design homepage for fintech app",
        amount: 1000,
        deadline: "2025-05-10",
        status: "submitted",
        clientId: "uid_client_001",
        freelancerEmail: "freelancer@example.com",
        freelancerId: "uid_freelancer_002",
        createdAt: new Date("2025-05-06T08:00:00Z"),
        acceptedAt: new Date("2025-05-06T09:00:00Z"),
        submittedAt: new Date("2025-05-06T11:30:00Z"),
        completedAt: new Date("2025-05-06T12:00:00Z"),
        rating: {
            clientToFreelancer: {
                stars: 5,
                comment: "Great job!",
            },
            freelancerToClient: {
                stars: 4,
                comment: "Smooth process!",
            },
        },
        unionLogs: {
            contractHash: "0xabc123...",
            ratingHash: "0xdef456...",
        },
    };

    try {
        await db.collection("contracts").doc(contractId).set(contractData);
        console.log("✅ Contract document created!");
    } catch (error) {
        console.error("❌ Error creating contract document:", error);
    }
}

