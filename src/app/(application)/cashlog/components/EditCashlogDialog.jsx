"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { Pencil } from "lucide-react";

const CATEGORIES = [
  "Repairs / Maintainence",
  "Snacks & Drinks Expenses",
  "New Hardware/Equipment",
  "Miscellaneous"
];

export function EditCashlogDialog({ cashlog, onSuccess }) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      category: cashlog.category,
      withdraw_from_drawer: cashlog.withdraw_from_drawer || {
        amount: 0,
        description: "",
        taken_by: ""
      }
    },
  });

  const onSubmit = async (data) => {
    try {
      // Update the cashlog entry
      await pb.collection("cashlog").update(cashlog.id, {
        category: data.category,
        withdraw_from_drawer: data.withdraw_from_drawer,
      });
      
      toast.success("Cash log entry updated successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update cash log entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Cash Log Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
