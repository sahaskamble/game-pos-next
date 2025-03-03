'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection } from "@/lib/hooks/useCollection";
import pb from "@/lib/pocketbase";

export default function BookingModal({ isOpen, onClose, deviceId }) {
  const { data: customers } = useCollection("customers");
  const { data: games } = useCollection("games");
  const { data: device } = useCollection("devices", { filter: `id="${deviceId}"` });
  
  const [formData, setFormData] = useState({
    customer_id: "",
    game_id: "",
    no_of_players: 1,
    duration: 1,
    payment_mode: "Cash",
  });

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (device?.[0]) {
      setTotalAmount(device[0].hourly_rate * formData.duration);
    }
  }, [formData.duration, device]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await pb.collection("sessions").create({
        device_id: deviceId,
        customer_id: formData.customer_id,
        game_id: formData.game_id,
        no_of_players: formData.no_of_players,
        duration: formData.duration,
        payment_mode: formData.payment_mode,
        status: "Active",
        total_amount: totalAmount,
        session_in: new Date().toISOString(),
      });

      onClose();
      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Customer</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Game</Label>
            <Select
              value={formData.game_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, game_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Game" />
              </SelectTrigger>
              <SelectContent>
                {games?.map(game => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Number of Players</Label>
            <Input
              type="number"
              min="1"
              value={formData.no_of_players}
              onChange={(e) => setFormData(prev => ({ ...prev, no_of_players: parseInt(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (hours)</Label>
            <Input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Mode</Label>
            <Select
              value={formData.payment_mode}
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_mode: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xl font-bold">
            Total Amount: ₹{totalAmount}
          </div>

          <Button type="submit" className="w-full">
            Confirm Booking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}