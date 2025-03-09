"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
import { useCollection } from "@/lib/hooks/useCollection";

const CATEGORIES = [
  "Repairs / Maintainence",
  "Snacks & Drinks Expenses",
  "New Hardware/Equipment",
  "Miscellaneous"
];

export function AddCashlogDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { createItem: createCashlog } = useCollection("cashlog");
  const { data: cashDrawerEntries } = useCollection("cashIndrawer", {
    sort: "-created",
    filter: `user_id = "${user?.id}"`,
  });

  const form = useForm({
    defaultValues: {
      category: "",
      withdraw_from_drawer: {
        amount: 0,
        description: "",
        taken_by: ""
      }
    },
  });

  const onSubmit = async (data) => {
    try {
      // Get today's start timestamp
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find today's drawer entry
      const todayDrawerEntry = cashDrawerEntries?.find(entry =>
        new Date(entry.created) >= today
      );

      if (!todayDrawerEntry) {
        throw new Error("No cash drawer entry found for today");
      }

      // Convert amount to number and ensure it's positive
      const withdrawalAmount = Math.abs(Number(data.withdraw_from_drawer.amount));

      // Create the cashlog entry with properly formatted data
      const cashlogData = {
        category: data.category,
        withdraw_from_drawer: {
          amount: withdrawalAmount,
          description: data.withdraw_from_drawer.description,
          taken_by: data.withdraw_from_drawer.taken_by
        },
        user_id: user.id,           // Change user_id to user
        branch_id: user.branch_id,  // Change branch_id to branch
        drawer_id: todayDrawerEntry.id,  // Change drawer_id to drawer
      };

      console.log(cashlogData);

      await createCashlog(cashlogData);

      toast.success("Cash log entry created successfully");
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Creation error:", error);
      toast.error(error.message || "Failed to create cash log entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Cash Log Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="withdraw_from_drawer.amount"
              rules={{ required: "Amount is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter withdrawal amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="withdraw_from_drawer.description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter withdrawal description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="withdraw_from_drawer.taken_by"
              rules={{ required: "Taken by is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taken By</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name of person who took the money"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
