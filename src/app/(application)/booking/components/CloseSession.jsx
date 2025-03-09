'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { useCollection } from '@/lib/hooks/useCollection';
import { calculateSessionClosePrice } from '@/lib/utils/calculateSessionValues';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CloseSession({ device, onChanged = () => { } }) {
  const { data: sessions, updateItem: updateSession } = useCollection("sessions");
  const { data: settings } = useCollection("settings");
  const { data: customers } = useCollection("customers");
  const { updateItem: updateDevice } = useCollection("devices");

  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null); // Session
  const [customer, setCustomer] = useState(null); // Customer
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    total_amount: 0,
    discount_unit: "percentage", // Changed from discount_type to discount_unit
    discount_percentage: 0,
    discount_amount: 0,
    gg_point_used: 0,
    gg_price: 0
  });
  const [maxGGPoints, setMaxGGPoints] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!device?.id) {
          setLoading(false);
          return;
        }

        const matchingSession = sessions.find((s) => s.device_id === device.id && s.status === 'Active');
        if (matchingSession) {
          setSession(matchingSession);

          const sessionTotalAmount = matchingSession.session_amount + matchingSession.snacks_total;

          const matchingCustomer = customers.find((customer) => customer.id === matchingSession.customer_id);
          setCustomer(matchingCustomer);

          const closingVariables = calculateSessionClosePrice({
            ggPoints: 0,
            total_amount: sessionTotalAmount,
            settings: settings[0]
          });

          setMaxGGPoints((closingVariables?.maxGGPriceToBeUsed > matchingCustomer?.total_rewards) ? matchingCustomer?.total_rewards : closingVariables?.maxGGPriceToBeUsed);

          setFormData({
            ...formData,
            total_amount: sessionTotalAmount,
            gg_point_used: 0,
            gg_price: 0,
            discount_amount: 0,
            discount_percentage: 0
          });

          setFinalAmount(sessionTotalAmount);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (sessions && settings && customers) {
      fetchData();
    }
  }, [device?.id, sessions, settings, customers]);

  // Calculate final amount whenever discount values or GG points change
  useEffect(() => {
    if (!session) return;

    const baseAmount = session.session_amount + session.snacks_total;
    let calculatedAmount = baseAmount;

    // Reset all discount values first
    let newFormData = { ...formData };

    if (formData.discount_unit === "percentage" && formData.discount_percentage > 0) {
      newFormData.discount_amount = (baseAmount * formData.discount_percentage / 100).toFixed(2);
      newFormData.gg_point_used = 0;
      newFormData.gg_price = 0;
      calculatedAmount = baseAmount - newFormData.discount_amount;
    }
    else if (formData.discount_unit === "amount" && formData.discount_amount > 0) {
      newFormData.discount_percentage = ((formData.discount_amount / baseAmount) * 100).toFixed(2);
      newFormData.gg_point_used = 0;
      newFormData.gg_price = 0;
      calculatedAmount = baseAmount - formData.discount_amount;
    }
    else if (formData.discount_unit === "gg_points" && formData.gg_point_used > 0) {
      const closingVariables = calculateSessionClosePrice({
        ggPoints: formData.gg_point_used,
        total_amount: baseAmount,
        settings: settings[0]
      });

      newFormData.gg_price = closingVariables?.ggPrice || 0;
      newFormData.discount_amount = 0;
      newFormData.discount_percentage = 0;
      calculatedAmount = baseAmount - newFormData.gg_price;
    }

    setFormData(newFormData);
    setFinalAmount(calculatedAmount);
  }, [formData.discount_unit, formData.discount_percentage, formData.discount_amount, formData.gg_point_used, session]);

  const handleDiscountTypeChange = (value) => {
    setFormData({
      ...formData,
      discount_unit: value,
      discount_amount: 0,
      discount_percentage: 0,
      gg_point_used: 0,
      gg_price: 0
    });
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    // Limiting discount
    switch (name) {
      case 'gg_point_used':
        if (value > maxGGPoints) {
          value = maxGGPoints
        }
        break;

      case 'discount_percentage':
        if (value > 50) {
          value = 50
        }
        break;

      case 'discount_amount':
        if (value > (formData.total_amount * 0.5)) {
          value = formData.total_amount * 0.5
        }
        break;
    }

    setFormData({
      ...formData,
      [name]: parseInt((name === '' && value > maxGGPoints) ? maxGGPoints : value) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) return;

    try {
      // Update session with final calculation
      await updateSession(session.id, {
        ...session,
        status: 'Closed',
        final_amount: finalAmount,
        discount_amount: formData.discount_amount,
        discount_percentage: formData.discount_percentage,
        rewardPointsUsed: formData.gg_point_used,
      });

      // Update Device Status
      await updateDevice(device?.id, {
        ...device,
        status: 'open'
      });

      onChanged();
      setOpen(false);
    } catch (error) {
      console.error("Error closing session:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} className='w-full'>
      <DialogTrigger className="w-full px-2 py-2 bg-red-500 inline-flex justify-center items-center rounded-lg">
        <X className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Session</DialogTitle>
        </DialogHeader>

        {/* Session Info */}
        <article className='grid gap-2 text-muted-foreground'>
          {customer && (
            <div className='flex items-center flex-wrap justify-between px-4 pt-4 font-semibold'>
              <div className='flex items-center gap-2'>
                <h1 className='text-foreground'>Wallet:- </h1>
                <p>{customer?.total_rewards || 0} GG </p>
              </div>
              <div className='flex items-center gap-2'>
                <h1 className='text-foreground'>Max usage:- </h1>
                <p>{maxGGPoints} GG </p>
              </div>
            </div>
          )}

          {session && (
            <>
              <div className='flex items-center justify-between px-4 pt-4'>
                <h1>Base Amount</h1>
                <p>Rs. {session?.session_amount || 0}</p>
              </div>
              <div className='flex items-center justify-between px-4'>
                <h1>Snacks Amount</h1>
                <p>Rs. {session?.snacks_total || 0}</p>
              </div>
            </>
          )}

          {formData.discount_unit === "percentage" && formData.discount_percentage > 0 && (
            <div className='flex items-center justify-between px-4 text-destructive'>
              <h1>Discount ({formData.discount_percentage}%)</h1>
              <p> - Rs. {formData.discount_amount}</p>
            </div>
          )}

          {formData.discount_unit === "amount" && formData.discount_amount > 0 && (
            <div className='flex items-center justify-between px-4 text-destructive'>
              <h1>Discount Amount</h1>
              <p> - Rs. {formData.discount_amount}</p>
            </div>
          )}

          {formData.discount_unit === "gg_points" && formData.gg_point_used > 0 && (
            <div className='flex items-center justify-between px-4 text-destructive'>
              <h1>{formData.gg_point_used} GG points</h1>
              <p> - Rs. {formData.gg_price}</p>
            </div>
          )}

          <div className='w-full px-2'>
            <div id='separator' className='border-t border-muted-foreground' />
          </div>

          <div className='flex items-center justify-between text-foreground font-semibold px-4'>
            <h1>Total</h1>
            <p>Rs. {finalAmount.toFixed(2)}</p>
          </div>

          <div id='separator' className='border border-muted-foreground mt-4' />

          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="discount_unit">Discount Type</Label>
              <Select
                value={formData.discount_unit}
                onValueChange={handleDiscountTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="gg_points">GG Points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.discount_unit === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                <Input
                  type="number"
                  id="discount_percentage"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
              </div>
            )}

            {formData.discount_unit === "amount" && (
              <div className="space-y-2">
                <Label htmlFor="discount_amount">Discount Amount (Rs.)</Label>
                <Input
                  type="number"
                  id="discount_amount"
                  name="discount_amount"
                  value={formData.discount_amount}
                  onChange={handleInputChange}
                  min="0"
                  max={session ? (session.session_amount + session.snacks_total) : 0}
                />
              </div>
            )}

            {formData.discount_unit === "gg_points" && (
              <div className="space-y-2">
                <Label htmlFor="gg_point_used">GG Points</Label>
                <Input
                  type="number"
                  id="gg_point_used"
                  name="gg_point_used"
                  value={formData.gg_point_used}
                  onChange={handleInputChange}
                  min="0"
                  max={maxGGPoints}
                />
              </div>
            )}

            <Button type="submit" className="w-full">Close Session</Button>
          </form>
        </article>
      </DialogContent>
    </Dialog>
  );
}
