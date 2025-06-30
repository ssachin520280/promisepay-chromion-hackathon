// functions/src/index.ts
import * as functions from 'firebase-functions';
import { ethers } from 'ethers';
import { defineSecret } from "firebase-functions/params";
import * as admin from 'firebase-admin';
import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();

const PRIVATE_KEY = defineSecret("PRIVATE_KEY");
const CONTRACT_ADDRESS = "0x8646ad379ddc6fe9f134ac5a46bb0ec462a9a4e0";
const PROVIDER_URL = defineSecret("PROVIDER_URL");
const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address",
        "indexed": true
      },
      {
        "internalType": "bytes32",
        "name": "contractIdHash",
        "type": "bytes32",
        "indexed": true
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string",
        "indexed": false
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256",
        "indexed": false
      }
    ],
    "type": "event",
    "name": "ContractLogged",
    "anonymous": false
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address",
        "indexed": true
      },
      {
        "internalType": "bytes32",
        "name": "ratingHash",
        "type": "bytes32",
        "indexed": true
      },
      {
        "internalType": "string",
        "name": "context",
        "type": "string",
        "indexed": false
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256",
        "indexed": false
      }
    ],
    "type": "event",
    "name": "RatingLogged",
    "anonymous": false
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "contractIdHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "logContract"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "ratingHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "context",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "logRating"
  }
];

// Firestore trigger
export const logToBlockchain = functions.firestore.onDocumentCreated(
  {
    document: "contracts/{docId}",
    secrets: [PRIVATE_KEY, PROVIDER_URL],
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    const data = snap?.data();

    try {
      if (!data) throw new Error("No contract data found");

      const {
        id,
        title,
        description,
        amount,
        deadline,
        status,
        clientId,
        freelancerEmail,
        freelancerId,
        createdAt,
        acceptedAt,
        submittedAt,
        completedAt,
        rating
      } = data;

      // Prepare deterministic string for hashing
      const concatString = `${id}|${title}|${description}|${amount}|${deadline}|${status}|${clientId}|${freelancerEmail}|${freelancerId}|${createdAt}|${acceptedAt}|${submittedAt}|${completedAt}|${JSON.stringify(rating)}`;

      const contractIdHash = ethers.keccak256(ethers.toUtf8Bytes(concatString));
      const metadataURI = `${id}`; // You can update this with real IPFS or DB URI

      const provider = new ethers.JsonRpcProvider(PROVIDER_URL.value());
      const wallet = new ethers.Wallet(PRIVATE_KEY.value(), provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

      const tx = await contract.logContract(contractIdHash, metadataURI);
      await tx.wait();
      console.log("Logged to blockchain:", tx.hash);
    } catch (err) {
      console.error("Blockchain logging failed:", err);
    }
  }
);

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
export const addMessage = onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  console.log(original)
  // Push the new message into Firestore using the Firebase Admin SDK.
  // const writeResult = await getFirestore()
  //     .collection("messages")
  //     .add({original: original});
  // Send back a message that we've successfully written the message
  res.json({result: `Message received. ${original}`});
});

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

export const shouldReleaseFunds = onRequest({ secrets: ["GEMINI_API_KEY"] }, async (req, res) => {
  try {
    console.log("181");
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
    console.log("183");
    const conversationId = req.method === "GET" ? req.query.conversationId as string : req.body.conversationId as string;
    console.log("conversationId: " + conversationId);
    if (!conversationId) {
      res.status(400).json({ error: 'conversationId is required' });
      return;
    }

    // Fetch conversation from Firestore
    console.log("192");
    const docRef = admin.firestore().collection('conversations').doc(conversationId as string);
    console.log("194: ", docRef);
    const docSnap = await docRef.get();
    console.log("196: ", docSnap);
    if (!docSnap.exists) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    const conversation = docSnap.data();
    console.log("202: ", conversation);
    // Prepare messages for Gemini
    const messages = (conversation?.messages || []).map((msg: any) => {
      return `${msg.senderId}: ${msg.content}`;
    }).join('\n');

    const prompt = `
      You are an escrow assistant. Based on the following conversation between a client and a freelancer, should the client release funds to the freelancer? Respond with "Yes" or "No" and a short explanation.

      Conversation:
      ${messages}
    `;

    // Call Gemini API
    const gemRes = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const geminiData = gemRes.text?.trim() || "";

    // Extract answer and explanation
    let answer = "";
    let explanation = geminiData;

    // Try to extract "Yes" or "No" at the start, or anywhere in the text
    const match = geminiData.match(/^(Yes|No)\b[\s:,-]*/i);
    if (match) {
      answer = match[1];
      explanation = geminiData.slice(match[0].length).trim();
    } else if (/yes/i.test(geminiData)) {
      answer = "Yes";
    } else if (/no/i.test(geminiData)) {
      answer = "No";
    }

    res.json({ answer, explanation });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// const ESCROW_FACTORY_CONTRACT_ADDRESS = "0xde8080f7d36c42ae2ffdd60b65a52d49872a960c";

export const aiApproveOnSubmission = functions.firestore
  .onDocumentUpdated(
    {
      document: "contracts/{docId}",
      secrets: [PRIVATE_KEY, PROVIDER_URL, GEMINI_API_KEY],
      region: "us-central1",
    },
    async (event) => {
      console.log("[aiApproveOnSubmission] Triggered for docId:", event.params.docId);

      const before = event.data?.before.data();
      const after = event.data?.after.data();
      const docId = event.params.docId;

      if (!before) {
        console.log("[aiApproveOnSubmission] 'before' data missing for docId:", docId);
      }
      if (!after) {
        console.log("[aiApproveOnSubmission] 'after' data missing for docId:", docId);
      }

      // Only trigger if status changed to "submitted"
      if (!before || !after || before.status === after.status || after.status !== "submitted") {
        console.log("[aiApproveOnSubmission] Skipping: status did not change to 'submitted' for docId:", docId, "before.status:", before?.status, "after.status:", after?.status);
        return null;
      }

      const conversationsRef = admin.firestore().collection('conversations');
      const querySnap = await conversationsRef
        .where('contractId', '==', docId)
        .limit(1)
        .get();

      if (querySnap.empty) {
        console.log("[aiApproveOnSubmission] Conversation not found for contractId:", docId);
        return null;
      }
      const docSnap = querySnap.docs[0];
      console.log("docSnap: ", docSnap);
      const conversation = docSnap.data();
      console.log("conversation: ", conversation);
      console.log("[aiApproveOnSubmission] Conversation fetched for contractId:", docId);

     const messagesRef = admin.firestore().collection('messages');
      const messagesQuerySnap = await messagesRef
        .where('conversationId', '==', docSnap.id)
        .orderBy('timestamp', 'desc')
        .get();

      console.log("messagesQuerySnap: ", messagesQuerySnap);
      const messageDocs = messagesQuerySnap.docs;
      console.log("messages docs: ", messageDocs);

      const messages = (messageDocs || []).map((msg: any) => {
        msg.data()
        return `${msg.data().senderId}: ${msg.data().content}`;
      }).join('\n');

      console.log("messages: ", messages);

      const prompt = `
        You are an escrow assistant. Based on the following conversation between a client and a freelancer, should the client release funds to the freelancer? Respond with "Yes" or "No" and a short explanation.

        Conversation:
        ${messages}
      `;

      // Call Gemini API
      console.log("[aiApproveOnSubmission] Calling Gemini API for docId:", docId);
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
      const gemRes = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      const geminiData = gemRes.text?.trim() || "";
      console.log("[aiApproveOnSubmission] Gemini API response for docId:", docId, ":", geminiData);

      // Extract answer
      let answer = "";
      const match = geminiData.match(/^(Yes|No)\b[\s:,-]*/i);
      if (match) {
        answer = match[1];
      } else if (/yes/i.test(geminiData)) {
        answer = "Yes";
      } else if (/no/i.test(geminiData)) {
        answer = "No";
      }
      console.log("[aiApproveOnSubmission] AI answer for docId:", docId, ":", answer);

      // If answer is "Yes", call approveByAI on EscrowFactory
      if (answer === "Yes") {
        try {
          console.log("[aiApproveOnSubmission] Calling approveByAI on EscrowFactory for projectId:", docId);
          const provider = new ethers.JsonRpcProvider(PROVIDER_URL.value());
          const wallet = new ethers.Wallet(PRIVATE_KEY.value(), provider);
          const escrowFactory = new ethers.Contract(
            "0xde8080f7d36c42ae2ffdd60b65a52d49872a960c",
            [
              "function approveByAI(uint256 projectId) external"
            ],
            wallet
          );
          await escrowFactory.approveByAI(Number(after.projectId));
          console.log("[aiApproveOnSubmission] approveByAI called for projectId:", docId);

          // Update Firestore: set aiApproved to true
          await admin.firestore().collection("contracts").doc(docId).update({
            aiApproved: true
          });
          console.log("[aiApproveOnSubmission] Firestore updated: aiApproved set to true for docId:", docId);

        } catch (err) {
          console.error("[aiApproveOnSubmission] Error calling approveByAI for projectId:", docId, ":", err);
        }
      } else {
        console.log("[aiApproveOnSubmission] AI did not approve for docId:", docId, ". No contract call made.");
      }

      return null;
    }
  );
