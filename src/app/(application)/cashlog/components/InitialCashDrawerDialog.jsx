"use client";

import { useState } from "react";
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
import { useAuth } from "@/lib/context/AuthContext";
import { useCollection } from "@/lib/hooks/useCollection";

export function InitialCashDrawerDialog({ previousBalance, onSuccess }) {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();
  
  const { createItem: createCashDrawer } = useCollection("cashIndrawer");

  const form = useForm({
    defaultValues: {
      cash_in_drawer: previousBalance || 0,
    },
  });

  const onSubmit = async (data) => {
    try {
      // Validate user data
      if (!user?.id || !user?.branch_id) {
        throw new Error("User data is missing");
      }

      // Create cash drawer entry
      const drawerData = {
        cash_in_drawer: Number(data.cash_in_drawer),
        user_id: user.id,
        branch_id: user.branch_id,
      };

      const drawerRecord = await createCashDrawer(drawerData);

      if (!drawerRecord) {
        throw new Error("Failed to create cash drawer record");
      }

      toast.success("Initial cash drawer amount set successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error in InitialCashDrawerDialog:", error);
      toast.error(error.message || "Failed to set initial cash drawer amount");
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
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Set Initial Amount</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
