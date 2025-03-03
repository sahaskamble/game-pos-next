'use client';

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection } from "@/lib/hooks/useCollection";

export function EditSessionDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [formData, setFormData] = useState({});

  const { data: customers } = useCollection("customers");
  const { data: devices } = useCollection("devices");
  const { data: games } = useCollection("games");
  const { data: branches } = useCollection("branches");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Extended">Extended</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Session Amount</Label>
            <Input
              type="number"
              value={formData.session_amount || ''}
              onChange={(e) => setFormData({ ...formData, session_amount: e.target.value })}
            />
          </div>

          <div>
            <Label>Snacks Price</Label>
            <Input
              type="number"
              value={formData.snacks_price || ''}
              onChange={(e) => setFormData({ ...formData, snacks_price: e.target.value })}
            />
          </div>

          <div>
            <Label>Discount Rate</Label>
            <Input
              value={formData.discount_rate || ''}
              onChange={(e) => setFormData({ ...formData, discount_rate: e.target.value })}
            />
          </div>

          <div>
            <Label>Amount Paid</Label>
            <Input
              type="number"
              value={formData.amount_paid || ''}
              onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
            />
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
