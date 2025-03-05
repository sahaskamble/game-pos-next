'use client';

import React, { useState, useEffect } from 'react';
import { useCollection } from "@/lib/hooks/useCollection";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, TvIcon, Users, Plus, X, Timer, Cookie, Car } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import pb from "@/lib/pocketbase";
import { useAuth } from '@/lib/context/AuthContext';
import { FaPlaystation } from 'react-icons/fa';
import { GGPointsDialog } from "./components/GGPointsDialog";

export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: devices, loading, updateItem: updateDevice } = useCollection("devices", {
    expand: 'branch_id',
  });
  const { data: sessions, updateItem: updateSession } = useCollection("sessions");
  const { data: snacks } = useCollection("snacks");
  const { createItem: createSessionSnack } = useCollection("session_snack");
  const { data: settings } = useCollection("settings", { expand: 'branch_id' });

  // Dialog states
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showAddSnackDialog, setShowAddSnackDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [extensionHours, setExtensionHours] = useState(1);
  const [selectedSnacks, setSelectedSnacks] = useState([]);

  // Add this state for calculations
  const [calculations, setCalculations] = useState({
    baseAmount: 0,
    snacksTotal: 0,
    discountAmount: 0,
    totalAmount: 0,
    ggPoints: 0,
    ggPointsValue: 0
  });

  // Add state for extension form data
  const [extensionFormData, setExtensionFormData] = useState({
    discount_type: "percentage",
    discount_percentage: 0,
    discount_amount: 0,
    no_of_players: 1
  });

  // Add these new states
  const [showGGPointsDialog, setShowGGPointsDialog] = useState(false);
  const [selectedSessionForClose, setSelectedSessionForClose] = useState(null);

  const handleBooking = (deviceId) => {
    router.push(`/booking/${deviceId}`);
  };

  const handleExtendSession = async (device) => {
    try {
      const session = device.expand.current_session;

      // Update session with new calculations and number of players
      const updatedSession = await pb.collection('sessions').update(session.id, {
        duration: session.duration + extensionHours,
        session_amount: session.base_amount + calculations.baseAmount,
        discount_type: extensionFormData.discount_type,
        discount_percentage: extensionFormData.discount_percentage,
        discount_amount: calculations.discountAmount,
        total_amount: session.total_amount + calculations.totalAmount,
        amount_paid: session.total_amount + calculations.totalAmount,
        gg_points_earned: session.gg_points_earned + calculations.ggPoints,
        no_of_players: extensionFormData.no_of_players
      });

      toast.success("Session extended successfully");
      setShowExtendDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Error extending session:", error);
      toast.error("Failed to extend session");
    }
  };

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

  const handleAddSnacksToSession = async (device) => {
    try {
      const session = device.expand.current_session;
      const snacksTotal = selectedSnacks.reduce((acc, snack) => {
        return acc + (snack.price * snack.quantity);
      }, 0);

      // Update session with new total
      await pb.collection('sessions').update(session.id, {
        snacks_total: (session.snacks_total || 0) + snacksTotal,
        total_amount: session.total_amount + snacksTotal
      });

      // Create session_snack entries
      for (const snack of selectedSnacks) {
        await createSessionSnack({
          session_id: session.id,
          snack_id: snack.id,
          quantity: snack.quantity,
          price: snack.price * snack.quantity,
          branch_id: user.branch_id,
          user_id: user.id,
        });
      }

      toast.success("Snacks added successfully");
      setShowAddSnackDialog(false);
      setSelectedSnacks([]);
      router.refresh();
    } catch (error) {
      console.error("Error adding snacks:", error);
      toast.error("Failed to add snacks");
    }
  };

  const handleCloseSession = async (device) => {
    try {
      const sessionData = sessions.find((session) =>
        session.device_id === device.id &&
        session.status === 'Active'
      );

      if (!sessionData) {
        toast.error("No session found for this device");
        return;
      }

      // Get customer's current points from point_logging
      const customerPoints = await pb.collection('point_logging')
        .getList(1, 50, {
          filter: `customer_id = "${sessionData.customer_id}"`,
          sort: '-created',
        });

      // Calculate total points
      const totalPoints = customerPoints.items.reduce((acc, log) => {
        return log.type === 'credit' ? acc + log.amount : acc - log.amount;
      }, 0);

      setSelectedSessionForClose({
        session: sessionData,
        device: device,
        customerPoints: totalPoints
      });
      setShowGGPointsDialog(true);
    } catch (error) {
      console.error("Error preparing session close:", error);
      toast.error("Failed to prepare session close");
    }
  };

  // Add new function to handle final session close
  const handleFinalSessionClose = async (pointsToUse) => {
    try {
      const { session, device, customerPoints } = selectedSessionForClose;

      // Calculate final amount after points redemption
      const finalAmount = session.total_amount - pointsToUse;

      // Update session
      await updateSession(session.id, {
        status: "Closed",
        session_out: new Date().toISOString(),
        rewardPointsUsed: pointsToUse,
        amount_paid: finalAmount
      });

      // Update device status
      await updateDevice(device.id, {
        status: "open",
      });

      // If points were used, create a debit entry in point_logging
      if (pointsToUse > 0) {
        await pb.collection('point_logging').create({
          customer_id: session.customer_id,
          branch_id: user.branch_id,
          amount: pointsToUse,
          type: 'debit'
        });
      }

      // Create a credit entry for new points earned
      const earnedPoints = Math.floor(finalAmount * 0.05); // 5% of final amount
      if (earnedPoints > 0) {
        await pb.collection('point_logging').create({
          customer_id: session.customer_id,
          branch_id: user.branch_id,
          amount: earnedPoints,
          type: 'credit'
        });
      }

      setShowGGPointsDialog(false);
      setSelectedSessionForClose(null);
      toast.success("Session closed successfully");
      router.refresh();
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Failed to close session");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
        return 'bg-red-500/10 text-red-500 border-red-500/20 text-base px-2 py-1';
      case 'open':
        return 'bg-green-500/10 text-green-500 border-green-500/20 text-base px-2 py-1';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20 text-base px-2 py-1';
    }
  };

  // Group devices by type
  const groupedDevices = devices?.reduce((acc, device) => {
    const type = device.type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(device);
    return acc;
  }, {});

  if (loading) {
    return <div>Loading...</div>;
  }

  const renderDeviceSection = (devices, title, icon) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {devices.map((device) => (
          <Card key={device.id} className="p-4 bg-gray-800">
            <CardTitle className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {device.type === 'PS' ? (
                  <FaPlaystation className="h-5 w-5" />
                ) : device.type === 'SIM' ? (
                  <Car className="h-5 w-5" />
                ) : (
                  <TvIcon className="h-5 w-5" />
                )}
                <span>{device.name}</span>
              </div>
              <Badge variant="outline" className={getStatusColor(device.status)}>
                {device.status}
              </Badge>
            </CardTitle>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Max Players: {device.max_players}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{device.type}</span>
                </div>
              </div>

              {/* Add this new section to show session end time when device is booked */}
              {device.status === "booked" && (
                <div className="text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Ends at: {
                      sessions?.find(session =>
                        session.device_id === device.id &&
                        session.status === 'Active'
                      )?.session_out ?
                        new Date(sessions.find(session =>
                          session.device_id === device.id &&
                          session.status === 'Active'
                        ).session_out).toLocaleTimeString() :
                        'N/A'
                    }</span>
                  </div>
                </div>
              )}

              {device.status === "booked" ? (
                <div className="flex gap-2">
                  <button
                    className="w-full px-2 py-2 bg-yellow-500 inline-flex justify-center items-center rounded-lg"
                    onClick={() => {
                      setSelectedDevice(device);
                      setShowExtendDialog(true);
                    }}
                  >
                    <Timer className="h-4 w-4" color='#fff' />
                  </button>
                  <button
                    className="w-full px-2 py-2 bg-blue-500 inline-flex justify-center items-center rounded-lg"
                    onClick={() => {
                      setSelectedDevice(device);
                      setShowAddSnackDialog(true);
                    }}
                  >
                    <Cookie className="h-4 w-4" />
                  </button>
                  <button
                    className="w-full px-2 py-2 bg-red-500 inline-flex justify-center items-center rounded-lg"
                    onClick={() => handleCloseSession(device)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleBooking(device.id)}
                >
                  Book Now
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Add this dialog to your existing JSX */}
      <GGPointsDialog
        open={showGGPointsDialog}
        onOpenChange={setShowGGPointsDialog}
        customerPoints={selectedSessionForClose?.customerPoints || 0}
        sessionAmount={selectedSessionForClose?.session?.total_amount || 0}
        onConfirm={handleFinalSessionClose}
      />

      <div className="p-8 space-y-8">
        <h1 className="text-2xl font-bold mb-6">Device Booking</h1>

        {/* PlayStation Section */}
        {groupedDevices?.PS && groupedDevices.PS.length > 0 && (
          renderDeviceSection(
            groupedDevices.PS,
            "PlayStation",
            <FaPlaystation className="h-6 w-6" />
          )
        )}

        {/* Simulator Section */}
        {groupedDevices?.SIM && groupedDevices.SIM.length > 0 && (
          renderDeviceSection(
            groupedDevices.SIM,
            "Simulator",
            <Car className="h-6 w-6" />
          )
        )}

        {/* VR Section */}
        {groupedDevices?.VR && groupedDevices.VR.length > 0 && (
          renderDeviceSection(
            groupedDevices.VR,
            "Virtual Reality",
            <TvIcon className="h-6 w-6" />
          )
        )}

        {/* Other Devices Section */}
        {groupedDevices?.Other && groupedDevices.Other.length > 0 && (
          renderDeviceSection(
            groupedDevices.Other,
            "Other Devices",
            <TvIcon className="h-6 w-6" />
          )
        )}

        {/* Extend Session Dialog */}
        <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Extend Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Add Number of Players Input */}
              <div className="space-y-2">
                <Label>Number of Players</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedDevice?.max_players || 4}
                  value={extensionFormData.no_of_players}
                  onChange={(e) => setExtensionFormData(prev => ({
                    ...prev,
                    no_of_players: Math.max(1, Math.min(parseInt(e.target.value) || 1, selectedDevice?.max_players || 4))
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Extension Hours</Label>
                <Input
                  type="number"
                  min="1"
                  value={extensionHours}
                  onChange={(e) => setExtensionHours(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Discount Section */}
              <div className="space-y-2">
                <Select
                  value={extensionFormData.discount_type}
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

                {extensionFormData.discount_type === 'percentage' ? (
                  <Input
                    type="number"
                    placeholder="Discount Percentage"
                    value={extensionFormData.discount_percentage}
                    onChange={(e) => handleDiscountChange('percentage', e.target.value)}
                    min={0}
                    max={100}
                  />
                ) : (
                  <Input
                    type="number"
                    placeholder="Discount Amount"
                    value={extensionFormData.discount_amount}
                    onChange={(e) => handleDiscountChange('amount', e.target.value)}
                    min={0}
                  />
                )}
              </div>

              {/* Calculations Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>₹{calculations.baseAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>₹{calculations.discountAmount}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total Amount:</span>
                  <span>₹{calculations.totalAmount}</span>
                </div>
                <div className="flex justify-between text-green-500">
                  <span>GG Points to be earned:</span>
                  <span>{calculations.ggPoints} (₹{calculations.ggPointsValue})</span>
                </div>
              </div>

              <Button
                onClick={() => handleExtendSession(selectedDevice)}
                className="w-full"
              >
                Extend Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Snacks Dialog */}
        <Dialog open={showAddSnackDialog} onOpenChange={setShowAddSnackDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Snacks</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
              </div>
              <Button
                onClick={() => handleAddSnacksToSession(selectedDevice)}
                className="w-full"
              >
                Add Snacks
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
