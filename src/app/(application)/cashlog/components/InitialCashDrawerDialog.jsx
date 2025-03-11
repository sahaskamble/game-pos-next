"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/lib/context/AuthContext";

export function InitialCashDrawerDialog({ onSuccess }) {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      cash_in_drawer: 0,
    },
  });

  const onSubmit = async (data) => {
    try {
      const record = await pb.collection("cashIndrawer").create({
        cash_in_drawer: data.cash_in_drawer,
        user_id: user.id,
        branch_id: user.branch_id,
      });

      // Create a corresponding cashlog entry
      await pb.collection("cashlog").create({
        cash_in_drawer: record.id,
        user_id: user.id,
        branch_id: user.branch_id,
        category: "Miscellaneous",
      });

      toast.success("Initial cash drawer amount set successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to set initial cash drawer amount");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Initial Cash Drawer Amount</DialogTitle>
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
            <Button type="submit" className="w-full">Start Shift</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}