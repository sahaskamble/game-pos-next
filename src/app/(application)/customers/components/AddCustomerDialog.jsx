'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/context/AuthContext";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AddCustomerDialog({
  mutate = () => { },
  handleSubmit = async () => { },
}) {

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    total_visits: 1,
    total_rewards: 0,
    branch_id: '',
    user_id: ''
  });
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = async () => {
    try {
      if (!user?.id) {
        return;
      }
      const branchId = localStorage.getItem('branch_id');
      await handleSubmit({
        customer_name: formData.customer_name,
        customer_contact: formData.customer_contact,
        total_visits: formData.total_visits,
        total_rewards: formData.total_rewards,
        branch_id: branchId,
        user_id: user.id
      });
      toast.success('Successfully added the customer!!!');
    } catch (error) {
      toast.error('Error Adding Customer, please try again later...');
      console.log(error);
    } finally {
      setIsOpen(false);
      mutate();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex text-sm justify-center items-center gap-2 px-2 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-lg">
        <Plus className="w-4 h-4" />
        Add Customer
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
          <div className="grid gap-4 p-4">
            <div className="space-y-2">
              <Label> Customer Name </Label>
              <Input
                type='text'
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder='eg; John Doe'
              />
            </div>
            <div className="space-y-2">
              <Label> Customer Contact </Label>
              <Input
                type='text'
                value={formData.customer_contact}
                onChange={(e) => setFormData({ ...formData, customer_contact: e.target.value })}
                placeholder='eg; 1234567890'
                maxLength={10}
                minLength={10}
              />
            </div>
            <Button onClick={onSubmit}> Create Customer </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
};
