'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GGPointsDialog({
  open,
  onOpenChange,
  customerPoints = 0,
  sessionAmount = 0,
  onConfirm
}) {
  const [pointsToUse, setPointsToUse] = useState(0);
  const maxAllowedPoints = Math.min(customerPoints, sessionAmount * 0.5); // 50% of session amount

  const handleConfirm = () => {
    onConfirm(Number(pointsToUse));
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
            <div className="text-2xl font-bold">₹{customerPoints}</div>
          </div>
          <div>
            <Label>Maximum Redeemable Points</Label>
            <div className="text-lg text-muted-foreground">₹{maxAllowedPoints.toFixed(2)}</div>
          </div>
          <div className="space-y-2">
            <Label>Points to Use</Label>
            <Input
              type="number"
              value={pointsToUse}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value <= maxAllowedPoints && value >= 0) {
                  setPointsToUse(value);
                }
              }}
              max={maxAllowedPoints}
              min={0}
            />
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
