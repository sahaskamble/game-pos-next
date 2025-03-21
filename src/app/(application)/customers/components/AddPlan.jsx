'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection } from "@/lib/hooks/useCollection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

function AddPlan({ open, onOpenChange, customerInfo, mutate, displayText = 'Add Plan' }) {
  const { updateItem: updateCustomerInfo } = useCollection('customers');
  const { data: memberships } = useCollection('memberships');
  const { createItem: addPlan } = useCollection('membershipLog');
  const { data: users } = useCollection('users');

  // <--- State Variables --->
  const [formData, setFormData] = useState({
    taken_date: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16),
    customer: customerInfo?.id,
    user_id: '',
    branch_id: '',
    payment_mode: '',
    plan_id: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData?.user_id || !formData.taken_date || !formData.payment_mode || !formData.plan_id) {
      toast.error('Please fill all the values before submitting!!');
      return;
    }

    try {
      const membershipPlan = await memberships?.find((plan) => plan.id === formData?.plan_id);
      if (membershipPlan) {
        const takenDate = new Date(formData.taken_date);
        const branch_id = customerInfo?.branch_id;
        await addPlan({
          ...formData,
          branch_id: branch_id,
          taken_date: takenDate.toISOString()
        });
        const creditWallet = membershipPlan?.amount + customerInfo?.wallet;
        const creditGG = membershipPlan?.ggpointsCredit + customerInfo?.total_rewards;
        await updateCustomerInfo(customerInfo.id, {
          total_rewards: creditGG,
          wallet: creditWallet,
          isMember: true
        });
        toast.success(`Plan added to ${customerInfo?.customer_name} successfully`)
        onOpenChange(null);
        mutate();
      } else {
        toast.info('Plan not found, please try again after sometime...')
      }
    } catch (error) {
      toast.error('Error add Subscription, please try again later...');
      console.log(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{displayText}</DialogTitle>
          {/* Info */}
          <div className="flex flex-col items-start md:items-center md:justify-between md:flex-row gap-4 py-6 text-muted-foreground">
            <div>
              <h1 className="text-lg font-semibold"> Customer Name </h1>
              <p>{customerInfo?.customer_name || ''}</p>
            </div>
            <div>
              <h1 className="text-lg font-semibold"> Contact </h1>
              <p>+91 {customerInfo?.customer_contact || ''}</p>
            </div>
          </div>

          {/* Form */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label> Taken On </Label>
              <Input
                type="datetime-local"
                value={formData.taken_date}
                onChange={(e) => setFormData({ ...formData, taken_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label> Pack </Label>
              <Select
                value={formData.plan_id}
                onValueChange={(value) => setFormData({ ...formData, plan_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  {memberships?.map((membership) => (
                    <SelectItem key={membership?.id} value={membership?.id}>
                      {membership?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label> Payment Mode </Label>
              <Select
                value={formData.payment_mode}
                onValueChange={(value) => setFormData({ ...formData, payment_mode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Cash'> Cash </SelectItem>
                  <SelectItem value='Upi'> Upi </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label> Agent </Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => setFormData({ ...formData, user_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user_info) => (
                    <SelectItem key={user_info?.id} value={user_info?.id}>
                      {user_info?.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit}> Add Membership </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default AddPlan;
