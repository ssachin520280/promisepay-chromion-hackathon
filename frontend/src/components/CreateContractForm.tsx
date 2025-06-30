import { useState, useEffect } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { db, auth } from "../../firebase/client";
import { addDoc, collection, Timestamp, query, where, getDocs } from "firebase/firestore";
import type { Contract } from "../../types/contracts"; // Using our existing type
import { ethers } from "ethers";
import EscrowFactoryABI from "@/abi/EscrowFactory.json";

// Add this to let TypeScript know about window.ethereum
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

const ESCROW_FACTORY_ADDRESS = "0xde8080f7d36c42ae2ffdd60b65a52d49872a960c";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  deadline: z.date().min(new Date(), "Deadline must be in the future"),
  freelancerEmail: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateContractForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [ethAmount, setEthAmount] = useState<number | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: undefined,
      freelancerEmail: "",
    },
  });

  // Fetch ETH price on mount
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await res.json();
        setEthPrice(data.ethereum.usd);
      } catch {
        setEthPrice(null);
      }
    };
    fetchEthPrice();
  }, []);

  // Update ETH amount when USD changes
  const watchedAmount = form.watch("amount");
  useEffect(() => {
    if (ethPrice && watchedAmount) {
      setEthAmount(Number(watchedAmount) / ethPrice);
    } else {
      setEthAmount(null);
    }
  }, [watchedAmount, ethPrice, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (!auth.currentUser) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a contract.",
          variant: "destructive",
        });
        return;
      }

      // Step 1: Look up freelancer by email
      const freelancerQuery = query(
        collection(db, "users"),
        where("email", "==", data.freelancerEmail)
      );
      const freelancerSnapshot = await getDocs(freelancerQuery);

      if (freelancerSnapshot.empty) {
        toast({
          title: "Freelancer Not Found",
          description: "No freelancer found with the provided email. Please check the email.",
          variant: "destructive",
        });
        return;
      }

      const freelancerDoc = freelancerSnapshot.docs[0];
      const freelancerData = freelancerDoc.data();

      // Check if freelancer has a walletAddress
      if (!freelancerData.walletAddress) {
        toast({
          title: "Freelancer Wallet Required",
          description: "Freelancer must have a wallet connected to be assigned this project.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if walletAddress is a valid Ethereum address
      if (!ethers.isAddress(freelancerData.walletAddress)) {
        toast({
          title: "Invalid Wallet Address",
          description: "Freelancer's wallet address is invalid. Please ask the freelancer to reconnect their wallet.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log(97, freelancerData)

      let signer = null;
      let provider;
      if (window.ethereum == null) {

          // If MetaMask is not installed, we use the default provider,
          // which is backed by a variety of third-party services (such
          // as INFURA). They do not have private keys installed,
          // so they only have read-only access
          console.log("MetaMask not installed; using read-only defaults")
          provider = ethers.getDefaultProvider()
          toast({
            title: "Wallet Not Found",
            description: "Please install MetaMask to proceed.",
            variant: "destructive",
          });
          return;
      } else {

          // Connect to the MetaMask EIP-1193 object. This is a standard
          // protocol that allows Ethers access to make all read-only
          // requests through MetaMask.
          provider = new ethers.BrowserProvider(window.ethereum)

          // It also provides an opportunity to request access to write
          // operations, which will be performed by the private key
          // that MetaMask manages for the user.
          signer = await provider.getSigner();
      }

      console.log(await provider.getBlockNumber());
      const signerAddress = await signer.getAddress();
      const balance = await provider.getBalance(signerAddress);
      console.log("balance: ", balance);

      const contract = new ethers.Contract(
        ESCROW_FACTORY_ADDRESS,
        EscrowFactoryABI.abi,
        signer
      );

      console.log(contract);

      if (!ethPrice) {
        toast({
          title: "ETH Price Unavailable",
          description: "Could not fetch ETH price. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      const ethValue = Number(data.amount) / ethPrice;
      // Fix: trim to 18 decimals to avoid parseEther error
      const ethValueStr = ethValue.toFixed(18).replace(/0+$/, '').replace(/\.$/, '');
      const tx = await contract.createProject(
        freelancerData.walletAddress,
        { value: ethers.parseEther(ethValueStr) }
      );
      const receipt = await tx.wait();

      // Find the ProjectCreated event in the logs
      const event = receipt.logs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .find((e: any) => e && e.name === "ProjectCreated");

      if (!event) {
        toast({
          title: "Contract Creation Failed",
          description: "Could not find ProjectCreated event.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { projectId, client, freelancer } = event.args;

      // Step 2: Build contract data (fully matching our Contract type)
      const contractData: Omit<Contract, "id"> = {
        title: data.title,
        description: data.description,
        amount: Number(ethValueStr), // Store ETH amount rounded
        amountUsd: Number(data.amount), // Store USD value
        usdPerEth: ethPrice, // Store USD/ETH price at contract creation
        deadline: format(data.deadline, "yyyy-MM-dd"), // Match our string format
        status: "pending",
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || "",
        clientEmail: auth.currentUser.email || "",
        freelancerId: freelancerDoc.id,
        freelancerName: freelancerData.name || "",
        freelancerEmail: freelancerData.email || "",
        clientWallet: client,
        freelancerWallet: freelancer,   
        projectId: projectId.toString(),
        createdAt: Timestamp.now(),
        acceptedAt: null,
        submittedAt: null,
        completedAt: null,
        blockchainHash: null,
        rating: {
          clientToFreelancer: {
            stars: 1,
            comment: "string",
            createdAt: null,
          },
          freelancerToClient: {
            stars: 1,
            comment: "string",
            createdAt: null,
          },
        },
        unionLogs: {
          contractHash: null,
          ratingHash: null,
        },
      };

      console.log(183, contractData)

      const contractRef = await addDoc(collection(db, "contracts"), contractData);
      console.log("Contract created with ID:", contractRef.id);

      // Create a conversation for this contract
      const conversationData = {
        contractId: contractRef.id,
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || "",
        freelancerId: freelancerDoc.id,
        freelancerName: freelancerData.name || "",
        participants: [auth.currentUser.uid, freelancerDoc.id],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastMessage: null,
        messages: []
      };

      await addDoc(collection(db, "conversations"), conversationData);

      toast({
        title: "Contract Created",
        description: "The contract has been successfully created.",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({
        title: "Contract Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create contract",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // FORM UI REMAINS IDENTICAL TO YOUR ORIGINAL
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Title</FormLabel>
                <FormControl>
                  <Input placeholder="E.g. Website Redesign Project" {...field} />
                </FormControl>
                <FormDescription>A clear title that describes the project</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide detailed requirements and expectations..."
                    className="h-24 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Be specific about deliverables and quality expectations</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Fixed payment amount for the entire project. {ethAmount && ethPrice && (
                      <span className="text-xs text-muted-foreground block mt-1">
                        ≈ {ethAmount.toFixed(6)} ETH (1 ETH = ${ethPrice})
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Project Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a deadline</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>When the project should be completed by</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="freelancerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Freelancer Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="freelancer@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>The email address of the freelancer you want to work with</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Contract..." : "Create Contract"}
        </Button>
      </form>
    </Form>
  );
}