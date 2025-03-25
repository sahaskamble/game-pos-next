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
  const { createItem: addToCashlog } = useCollection("cashlog");
  const { createItem: addToCashinDrawer } = useCollection("cashIndrawer");
  const { data: branches } = useCollection("branches");
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      cash_in_drawer: "",
      category: "",
      branch_id: user?.branch_id?.[0] || "",
      withdraw_from_drawer: {
        amount: "",
        description: "",
        taken_by: ""
      }
    },
  });

  const onSubmit = async (data) => {
    try {
      // First create a cash drawer record
      const drawerRecord = await addToCashinDrawer({
        cash_in_drawer: parseFloat(data.cash_in_drawer),
        user_id: user.id,
        branch_id: data.branch_id,
      });

      // Then create the cashlog entry with the drawer reference
      const cashlogData = {
        user_id: user.id,
        branch_id: data.branch_id,
        category: data.category,
        drawer_id: drawerRecord.id,
        withdraw_from_drawer: {
          amount: parseFloat(data.withdraw_from_drawer.amount) || 0,
          description: data.withdraw_from_drawer.description || "",
          taken_by: data.withdraw_from_drawer.taken_by || ""
        }
      };

      await addToCashlog(cashlogData);

      toast.success("Cash log entry created successfully");
      setOpen(false);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error details:", error);
      if (error.data) {
        console.error("Server response:", error.data);
      }
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
                      {
                        user?.role === 'SuperAdmin' && (
                          <SelectItem value={'Salary'}>Salary</SelectItem>
                        )
                      }
                      <SelectItem value={'Purchases'}>Purchases</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="branch_id"
              rules={{ required: "Branch is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
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
