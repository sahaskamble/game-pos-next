'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function GGPointsDialog({
  open,
  onOpenChange,
  customerPoints = 0,
  sessionAmount = 0,
  onConfirm
}) {
  const [formData, setformData] = useState({
    pointsToUse: 0,
    discount_type: "percentage",
    discount_percentage: 0,
    discount_amount: 0
  });

  const maxAllowedPoints = Math.min(customerPoints, sessionAmount * 0.5); // 50% of session amount

  const handleDiscountChange = (type, value) => {
    setformData(prev => ({
      ...prev,
      iscount_type: type,
      discount_percentage: type === 'percentage' ? parseFloat(value) || 0 : 0,
      discount_amount: type === 'amount' ? parseFloat(value) || 0 : 0
    }));
  };

  const handleConfirm = () => {
    onConfirm(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use GG Points</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Available Points</Label>
            <div className="text-2xl font-bold">{customerPoints} Points </div>
          </div>
          <div>
            <Label>Maximum Redeemable Points</Label>
            <div className="text-lg text-muted-foreground">{maxAllowedPoints.toFixed(0)} Points</div>
          </div>
          <div className="space-y-2">
            <Label>Points to Use</Label>
            <Input
              disabled={formData.discount_amount !== 0 || formData.discount_percentage !== 0}
              type="number"
              value={formData.pointsToUse}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value <= maxAllowedPoints && value >= 0) {
                  setformData({ ...formData, pointsToUse: value });
                }
              }}
              max={maxAllowedPoints}
              min={0}
            />
          </div>
          {/* Discount Section */}
          <div className="space-y-2">
            <Label>Discount</Label>
            <Select
              value={formData.discount_type}
              onValueChange={(value) => handleDiscountChange(value, 0)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Discount Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>

            {formData.discount_type === 'percentage' ? (
              <Input
                disabled={formData.pointsToUse !== 0}
                type="number"
                placeholder="Discount Percentage"
                value={formData.discount_percentage}
                onChange={(e) => handleDiscountChange('percentage', e.target.value)}
                min={0}
                max={100}
              />
            ) : (
              <Input
                type="number"
                disabled={formData.pointsToUse !== 0}
                placeholder="Discount Amount"
                value={formData.discount_amount}
                onChange={(e) => handleDiscountChange('amount', e.target.value)}
                min={0}
              />
            )}
          </div>
          <Button
            className="w-full"
            onClick={handleConfirm}
          >
            Confirm and Close Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
