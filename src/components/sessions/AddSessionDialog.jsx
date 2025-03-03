import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useState, useEffect } from "react";
import { useCollection } from "@/lib/hooks/useCollection";

export function AddSessionDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    status: 'Active',
    payment_mode: 'Cash',
  });

  const { data: customers } = useCollection("customers");
  const { data: devices } = useCollection("devices");
  const { data: games } = useCollection("games");
  const { data: branches } = useCollection("branches");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Session</DialogTitle>
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
            <Label>Device</Label>
            <Select
              value={formData.device_id}
              onValueChange={(value) => setFormData({ ...formData, device_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                {devices?.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Game</Label>
            <Select
              value={formData.game_id}
              onValueChange={(value) => setFormData({ ...formData, game_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent>
                {games?.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Branch</Label>
            <Select
              value={formData.branch_id}
              onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
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
            <Label>Number of Players</Label>
            <Input
              type="number"
              value={formData.no_of_players || ''}
              onChange={(e) => setFormData({ ...formData, no_of_players: e.target.value })}
            />
          </div>

          <div>
            <Label>Payment Mode</Label>
            <Select
              value={formData.payment_mode}
              onValueChange={(value) => setFormData({ ...formData, payment_mode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Upi">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit">Create Session</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
