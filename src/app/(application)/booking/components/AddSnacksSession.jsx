'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { CookieIcon } from 'lucide-react';
import { useCollection } from '@/lib/hooks/useCollection';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/AuthContext';

export default function AddSnacksSession({ device, setReload }) {
  const { data: sessions, updateItem: updateSession } = useCollection("sessions");
  const { data: snacks } = useCollection("snacks");
  const { createItem: createSessionSnack } = useCollection("session_snack");
  const { user } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSnacks, setSelectedSnacks] = useState([]);

  const handleSnackAdd = (snackId) => {
    const snack = snacks.find(s => s.id === snackId);
    if (!snack) return;

    setSelectedSnacks(prev => {
      const existing = prev.find(s => s.id === snackId);
      if (existing) {
        return prev.map(s => s.id === snackId ? { ...s, quantity: s.quantity + 1 } : s);
      }
      return [...prev, { id: snackId, name: snack.name, price: snack.price, quantity: 1 }];
    });
  };

  const handleSnackQuantity = (snackId, change) => {
    setSelectedSnacks(prev => prev.map(snack => {
      if (snack.id === snackId) {
        const newQuantity = Math.max(0, snack.quantity + change);
        return { ...snack, quantity: newQuantity };
      }
      return snack;
    }).filter(snack => snack.quantity > 0));
  };

  const handleAddSnacksToSession = async (e) => {
    e.preventDefault();
    try {
      const snacksTotal = selectedSnacks.reduce((acc, snack) => {
        return acc + (snack.price * snack.quantity);
      }, 0);

      // Update session with new total
      await updateSession(session.id, {
        snacks_total: (session.snacks_total || 0) + snacksTotal,
        total_amount: session.total_amount + snacksTotal
      });

      // Create session_snack entries
      for (const snack of selectedSnacks) {
        const sessionSnack = await createSessionSnack({
          session_id: session.id,
          snack_id: snack.id,
          quantity: snack.quantity,
          price: snack.price * snack.quantity,
          branch_id: user.branch_id,
          user_id: user.id,
        });
        console.log('Session Snack Add', sessionSnack)
      }

      toast.success("Snacks added successfully");
      setSelectedSnacks([]);
      router.refresh();
    } catch (error) {
      console.error("Error adding snacks:", error);
      toast.error("Failed to add snacks");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!device?.id) {
          setLoading(false);
          return;
        }

        const matchingSession = sessions.find((s) => s.device_id === device.id && s.status === 'Active');
        if (matchingSession) {
          setSession(matchingSession);
          console.log('Matching Session', matchingSession);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [device?.id, sessions]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Dialog className='w-full'>
      <DialogTrigger className="w-full px-2 py-2 bg-blue-500 inline-flex justify-center items-center rounded-lg">
        <CookieIcon className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Snacks</DialogTitle>
          <div className='text-gray-700/70'>
          </div>
          <form className='grid gap-4' onSubmit={(e) => handleAddSnacksToSession(e)}>
            <div className="space-y-2">
              <Label>Select Snacks</Label>
              <Select onValueChange={handleSnackAdd}>
                <SelectTrigger>
                  <SelectValue placeholder="Add Snack" />
                </SelectTrigger>
                <SelectContent>
                  {snacks?.map(snack => (
                    <SelectItem key={snack.id} value={snack.id}>
                      {snack.name} - ₹{snack.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                {selectedSnacks.map(snack => (
                  <div key={snack.id} className="flex items-center justify-between">
                    <span>{snack.name} - ₹{snack.price}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSnackQuantity(snack.id, -1)}
                      >
                        -
                      </Button>
                      <span>{snack.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSnackQuantity(snack.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type='submit'
                className="w-full"
              >
                Add Snacks
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
};
