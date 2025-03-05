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
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/lib/context/AuthContext";

const CATEGORIES = [
  "Repairs / Maintainence",
  "Snacks & Drinks Expenses",
  "New Hardware/Equipment",
  "Miscellaneous"
];

export function AddCashlogDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

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
      // First create a cash drawer record
      const drawerRecord = await pb.collection("cashIndrawer").create({
        cash_in_drawer: data.cash_in_drawer,
        user_id: user.id,
        branch_id: user.branch_id,
      });

      // Then create the cashlog entry with the drawer reference
      await pb.collection("cashlog").create({
        cash_in_drawer: drawerRecord.id,
        category: data.category,
        withdraw_from_drawer: data.withdraw_from_drawer,
        user_id: user.id,
        branch_id: user.branch_id,
      });

      toast.success("Cash log entry created successfully");
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create cash log entry");
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
              name="cash_in_drawer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cash in Drawer</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="Enter amount"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
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
