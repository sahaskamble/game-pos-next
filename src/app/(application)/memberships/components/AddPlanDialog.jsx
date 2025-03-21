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
import { isNumber } from "lodash";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCollection } from "@/lib/hooks/useCollection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddPlanDialog({
  mutate = () => { },
  handleSubmit = async () => { },
}) {

  const { user } = useAuth();
  const { data: branches, loading } = useCollection('branches');

  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    selling_price: 0,
    ggpointsCredit: 0,
    branch_id: '',
    user_id: ''
  });
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = async () => {
    try {
      if (!user?.id || !isNumber(formData.amount) || !isNumber(formData.ggpointsCredit || loading || !branches)) {
        toast.warning('Please Fill all the required fields...');
        return;
      }

      await handleSubmit({
        name: formData.name,
        amount: formData.amount || 0,
        ggpointsCredit: formData.ggpointsCredit || 0,
        selling_price: formData.selling_price || 0,
        branch_id: formData.branch_id,
        user_id: user.id
      });
      toast.success('Successfully added the plan!!!');
    } catch (error) {
      toast.error('Error Adding Plan, please try again later...');
      console.log(error);
    } finally {
      setFormData({
        name: '',
        amount: 0,
        ggpointsCredit: 0,
        branch_id: '',
        user_id: ''
      });
      setIsOpen(false);
      mutate();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex text-sm justify-center items-center gap-2 px-2 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-lg">
        <Plus className="w-4 h-4" />
        Add Plan
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Plan</DialogTitle>
          <div className="grid gap-4 p-4">
            <div className="space-y-2">
              <Label> Plan Name </Label>
              <Input
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='eg; John Doe'
              />
            </div>
            <div className="space-y-2">
              <Label> Selling Price </Label>
              <Input
                type='number'
                value={formData.selling_price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setFormData({ ...formData, selling_pricet: '' })
                  } else {
                    setFormData({ ...formData, selling_price: Number(value) })
                  }
                }}
                placeholder='GG coins'
              />
            </div>
            <div className="space-y-2">
              <Label> Amount to be Credited </Label>
              <Input
                type='number'
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setFormData({ ...formData, amount: '' })
                  } else {
                    setFormData({ ...formData, amount: Number(value) })
                  }
                }}
                placeholder='(in Rs.)'
              />
            </div>
            <div className="space-y-2">
              <Label> Points to be credited </Label>
              <Input
                type='number'
                value={formData.ggpointsCredit}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setFormData({ ...formData, ggpointsCredit: '' })
                  } else {
                    setFormData({ ...formData, ggpointsCredit: Number(value) })
                  }
                }}
                placeholder='GG coins'
              />
            </div>
            <div className="space-y-2">
              <Label> Branch </Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch) => (
                    <SelectItem key={branch?.id} value={branch?.id}>
                      {branch?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={onSubmit}> Create New Plan </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
};
