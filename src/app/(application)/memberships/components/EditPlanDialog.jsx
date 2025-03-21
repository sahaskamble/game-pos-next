'use client';

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isNumber } from "lodash";
import { toast } from "sonner";

export default function EditPlanDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mutate
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id) {
      toast.error('Invalid plan data');
      return;
    }

    if (!isNumber(formData.amount) || !isNumber(formData.ggpointsCredit) || !isNumber(formData.selling_price)) {
      toast.warning('Amount and points must be valid numbers');
      return;
    }

    try {
      await onSubmit(formData.id, {
        name: formData.name,
        amount: formData.amount,
        ggpointsCredit: formData.ggpointsCredit,
        selling_price: formData.selling_price,
      });

      toast.success('Successfully updated the plan');
      onOpenChange(null);
      mutate();
    } catch (error) {
      console.error('Update plan error:', error);
      toast.error('Error updating plan, please try again later');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 p-4">
          <div className="space-y-2">
            <Label>Plan Name</Label>
            <Input
              type='text'
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder='eg; Basic Plan'
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Selling Price</Label>
            <Input
              type='number'
              value={formData.selling_price || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, selling_price: value === '' ? '' : Number(value) })
              }}
              placeholder='(in Rs.)'
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Amount to be credited</Label>
            <Input
              type='number'
              value={formData.amount || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, amount: value === '' ? '' : Number(value) })
              }}
              placeholder='(in Rs.)'
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Points to be credited</Label>
            <Input
              type='number'
              value={formData.ggpointsCredit || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, ggpointsCredit: value === '' ? '' : Number(value) })
              }}
              placeholder='GG coins'
              required
            />
          </div>
          <Button type="submit">Update Plan</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


