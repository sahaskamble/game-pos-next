"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import pb from "@/lib/pocketbase";
import { useAuth } from "@/lib/context/AuthContext";
import { useCollection } from "@/lib/hooks/useCollection";

export function InitialCashDrawerDialog({ user, onSuccess }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const { selectedBranch } = useAuth(); // Get selectedBranch from context
  
  const { createItem: createCashDrawer } = useCollection("cashIndrawer");
  const { createItem: createCashLog } = useCollection("cashlog");

  const form = useForm({
    defaultValues: {
      cash_in_drawer: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Create cash drawer record using selected branch
      const drawerRecord = await createCashDrawer({
        cash_in_drawer: parseFloat(data.cash_in_drawer),
        user_id: user.id,
        branch_id: selectedBranch, // Use selected branch from context
      });

      setOpen(false);
      onSuccess?.();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error setting cash drawer:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Initial Cash Drawer Amount</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cash_in_drawer"
              rules={{ required: "Cash amount is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cash Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter cash amount"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Start Shift
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}