"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { useCollection } from "@/lib/hooks/useCollection";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";

export function InitialCashDrawer() {
  const { user } = useAuth();
  const { createItem: addToCashInDrawer } = useCollection("cashIndrawer");
  const { createItem: addToCashlog } = useCollection("cashlog");
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      cash_in_drawer: "",
      controller_count: "",
    }
  });

  const onSubmit = async (data) => {
    try {
      const drawerRecord = await addToCashInDrawer({
        cash_in_drawer: parseFloat(data.cash_in_drawer),
        controller_count: parseInt(data.controller_count),
        user_id: user.id,
        branch_id: localStorage.getItem('branch_id'),
      });

      if (drawerRecord) {
        const drawerlog = await addToCashlog({
          user_id: user.id,
          branch_id: localStorage.getItem('branch_id'),
          category: "Initial Cash",
          drawer_id: drawerRecord.id,
          category: "Drawer",
          withdraw_from_drawer: {
            'amount': parseFloat(data.cash_in_drawer),
            'description': "Cash in drawer"
          },
          controller_count: parseInt(data.controller_count)
        });
        drawerlog;
      }
      toast.success("Initial cash drawer amount and controller count set successfully");
      router.push("/booking");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to set initial cash drawer amount and controller count");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Enter Initial Cash Drawer Details</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cash_in_drawer"
            rules={{
              required: "Initial cash amount is required",
              min: { value: 0, message: "Amount must be positive" }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cash in Drawer</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseFloat(value) : "");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="controller_count"
            rules={{
              required: "Controller count is required",
              min: { value: 0, message: "Count must be positive" },
              validate: value => Number.isInteger(Number(value)) || "Count must be a whole number"
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Controller Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter number of controllers"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseInt(value) : "");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Set Initial Values
          </Button>
        </form>
      </Form>
    </div>
  );
}
