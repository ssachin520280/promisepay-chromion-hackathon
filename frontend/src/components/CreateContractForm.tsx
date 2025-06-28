import { useState } from "react";
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: undefined,
      freelancerEmail: "",
    },
  });

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

      // Step 2: Build contract data (fully matching our Contract type)
      const contractData: Omit<Contract, "id"> = {
        title: data.title,
        description: data.description,
        amount: data.amount,
        deadline: format(data.deadline, "yyyy-MM-dd"), // Match our string format
        status: "pending",
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || "",
        clientEmail: auth.currentUser.email || "",
        freelancerId: freelancerDoc.id,
        freelancerName: freelancerData.name || "",
        freelancerEmail: freelancerData.email || "",
        createdAt: Timestamp.now(),
        acceptedAt: null, // Using undefined instead of null
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
                  <FormDescription>Fixed payment amount for the entire project</FormDescription>
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