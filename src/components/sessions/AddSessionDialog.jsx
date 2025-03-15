import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";

export function AddSessionDialog({ open, onOpenChange, onSubmit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    status: 'Active',
    customer_id: '',
    no_of_players: 1,
    visiting_time: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    note: '',
    branch_id: '',
    created_by: user?.id
  });

  const { data: customers } = useCollection("customers");
  const { data: branches } = useCollection('branches');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.customer_id) {
        toast.error("Please select a customer");
        return;
      }

      if (!formData.visiting_time) {
        toast.error("Please select visiting time");
        return;
      }

      if (formData.no_of_players < 1) {
        toast.error("Number of players must be at least 1");
        return;
      }

      const visitingTime = new Date(formData.visiting_time);
      if (isNaN(visitingTime.getTime())) {
        toast.error("Invalid visiting time");
        return;
      }

      const sessionData = {
        ...formData,
        no_of_players: parseInt(formData.no_of_players),
        visiting_time: visitingTime.toISOString(),
      };

      await onSubmit(sessionData);
      onOpenChange(false);

      // Reset form
      setFormData({
        status: 'Active',
        customer_id: '',
        no_of_players: 1,
        visiting_time: new Date().toISOString().slice(0, 16),
        note: '',
        branch_id: '',
        created_by: user?.id
      });

      toast.success("Session added successfully");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Advance Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Customer</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Number of Players</Label>
            <Input
              type="number"
              min="1"
              value={formData.no_of_players}
              onChange={(e) => setFormData({ ...formData, no_of_players: e.target.value })}
            />
          </div>

          <div>
            <Label>Visiting Date and Time</Label>
            <Input
              type="datetime-local"
              value={formData.visiting_time}
              onChange={(e) => setFormData({ ...formData, visiting_time: e.target.value })}
            />
          </div>

          <div>
            <Label>Branch</Label>
            <Select
              value={formData.branch_id}
              onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Note</Label>
            <Textarea
              placeholder="Add any additional notes here..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">Add Advance Session</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
