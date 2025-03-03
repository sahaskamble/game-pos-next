"use client";

import { useState, useEffect, use } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { calculateSessionValues } from "@/lib/utils/calculateSessionValues";

const DURATION_OPTIONS = [
  { value: 1, label: "1 Hour" },
  { value: 2, label: "2 Hours" },
  { value: 3, label: "3 Hours" },
  { value: 4, label: "4 Hours" },
  { value: 5, label: "5 Hours" },
  { value: 6, label: "6 Hours" },
];

function AddCustomerDialog({ onCustomerAdd }) {
  const [newCustomer, setNewCustomer] = useState({
    customer_name: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await pb.collection("customers").create(newCustomer);
      onCustomerAdd(created);
      return created;
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Customer</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer_name">Name</Label>
          <Input
            id="customer_name"
            value={newCustomer.customer_name}
            onChange={(e) =>
              setNewCustomer((prev) => ({
                ...prev,
                customer_name: e.target.value,
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
        <Button type="submit" className="w-full">
          Add Customer
        </Button>
      </form>
    </DialogContent>
  );
}

export default function BookingForm({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const deviceId = unwrappedParams.deviceId;

  const { data: device, updateItem: updateDevice } = useCollection("devices", { filter: `id="${deviceId}"` });
  const { data: games } = useCollection("games");
  const { data: customers, createItem: createCustomer } = useCollection("customers");
  const { data: snacks } = useCollection("snacks");
  const { data: settings } = useCollection("settings");
  const { createItem: createSession } = useCollection("sessions");
  const { createItem: createSessionSnack } = useCollection("session_snack");

  useEffect(() => {
    console.log("Current settings:", settings);
  }, [settings]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    game_id: "",
    no_of_players: 1,
    duration: 1,
    payment_mode: "Cash",
    selectedSnacks: [],
    discount_type: "percentage",
    discount_percentage: 0,
    discount_amount: 0
  });

  const [calculations, setCalculations] = useState({
    baseAmount: 0,
    snacksTotal: 0,
    discountAmount: 0,
    totalAmount: 0,
    ggPoints: 0,
    ggPointsValue: 0
  });

  const handlePlayersChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setFormData(prev => ({
      ...prev,
      no_of_players: Math.max(1, Math.min(value, device?.[0]?.max_players || 4))
    }));
  };

  const handleDurationChange = (value) => {
    const duration = parseInt(value) || 1;
    setFormData(prev => ({
      ...prev,
      duration: duration
    }));
  };

  const handleSnackAdd = (snackId) => {
    const selectedSnack = snacks.find(s => s.id === snackId);
    if (!selectedSnack) return;

    setFormData(prev => ({
      ...prev,
      selectedSnacks: [
        ...prev.selectedSnacks.filter(s => s.id !== snackId),
        { id: snackId, name: selectedSnack.name, price: selectedSnack.price, quantity: 1 }
      ]
    }));
  };

  const handleSnackQuantity = (snackId, change) => {
    setFormData(prev => ({
      ...prev,
      selectedSnacks: prev.selectedSnacks.map(snack => {
        if (snack.id === snackId) {
          const newQuantity = Math.max(0, snack.quantity + change);
          return { ...snack, quantity: newQuantity };
        }
        return snack;
      }).filter(snack => snack.quantity > 0)
    }));
  };

  const handleDiscountChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      discount_type: type,
      discount_percentage: type === 'percentage' ? parseFloat(value) || 0 : 0,
      discount_amount: type === 'amount' ? parseFloat(value) || 0 : 0
    }));
  };

  // Filter customers based on search term
  const filteredCustomers = customers?.filter(customer =>
    customer?.customer_name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    customer?.customer_contact?.includes(searchTerm)
  );

  const handleCustomerAdd = async (newCustomer) => {
    setFormData(prev => ({ ...prev, customer_id: newCustomer.id }));
    setShowAddCustomer(false);
  };

  // Calculate totals whenever relevant data changes
  useEffect(() => {
    // Early return if no settings or formData
    if (!settings?.[0]) {
      console.log("No settings available yet");
      return;
    }

    if (!formData.no_of_players) {
      console.log("No players selected yet");
      return;
    }

    console.log("Calculating with:", {
      players: formData.no_of_players,
      settings: settings[0],
      duration: formData.duration
    });

    // Calculate base price
    const sessionValues = calculateSessionValues(formData.no_of_players, settings[0]);
    const basePrice = sessionValues.totalAmount * formData.duration;

    console.log("Base price calculated:", basePrice);

    // Calculate snacks total
    const snacksTotal = formData.selectedSnacks.reduce((acc, snack) => {
      return acc + (snack.price * snack.quantity);
    }, 0);

    console.log("Snacks total:", snacksTotal);

    // Calculate discount
    let discountAmount = 0;
    if (formData.discount_type === 'percentage') {
      discountAmount = (basePrice + snacksTotal) * (formData.discount_percentage / 100);
    } else {
      discountAmount = formData.discount_amount;
    }

    const totalBeforeDiscount = basePrice + snacksTotal;
    const finalTotal = totalBeforeDiscount - discountAmount;

    // Calculate GG Points
    const ggConfig = settings[0].ggpoints_config;
    const ggPoints = Math.floor((finalTotal * ggConfig.reward_percentage) / 100);
    const ggPointsValue = Math.floor(ggPoints / ggConfig.points_to_rupee_ratio);

    console.log("Final calculations:", {
      baseAmount: basePrice,
      snacksTotal,
      discountAmount,
      totalAmount: finalTotal,
      ggPoints,
      ggPointsValue
    });

    setCalculations({
      baseAmount: basePrice,
      snacksTotal,
      discountAmount,
      totalAmount: finalTotal,
      ggPoints,
      ggPointsValue,
    });
  }, [formData.no_of_players, formData.duration, formData.selectedSnacks, formData.discount_type, formData.discount_percentage, formData.discount_amount, settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create the session
      const session = await createSession({
        device_id: deviceId,
        customer_id: formData.customer_id,
        game_id: formData.game_id,
        no_of_players: formData.no_of_players,
        duration: formData.duration,
        payment_mode: formData.payment_mode,
        status: "Active",
        base_amount: calculations.baseAmount,
        snacks_total: calculations.snacksTotal,
        discount_type: formData.discount_type,
        discount_percentage: formData.discount_percentage,
        discount_amount: calculations.discountAmount,
        total_amount: calculations.totalAmount,
        gg_points_earned: calculations.ggPoints,
        session_in: new Date().toISOString(),
      });

      // Update device status
      await updateDevice(deviceId, {
        status: "Booked",
        current_session: session.id
      });

      // Create session_snacks entries
      for (const snack of formData.selectedSnacks) {
        await createSessionSnack({
          session_id: session.id,
          snack_id: snack.id,
          quantity: snack.quantity,
          price: snack.price * snack.quantity,
        });
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">New Session Booking</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search customer by name or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8"
                />
                <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <AddCustomerDialog onCustomerAdd={handleCustomerAdd} />
              </Dialog>
            </div>

            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {filteredCustomers?.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.customer_name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          {/* Number of Players Input */}
          <div className="space-y-2">
            <Label>Number of Players</Label>
            <Input
              type="number"
              placeholder="Number of Players"
              value={formData.no_of_players}
              onChange={handlePlayersChange}
              min={1}
              max={device?.[0]?.max_players || 4}
            />
          </div>

          {/* Duration Select */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select
              value={formData.duration.toString()}
              onValueChange={handleDurationChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Add Snacks</h3>
            <Select onValueChange={handleSnackAdd}>
              <SelectTrigger>
                <SelectValue placeholder="Add Snack" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select">Select Snack</SelectItem>
                {snacks?.map(snack => (
                  <SelectItem key={snack.id} value={snack.id}>
                    {snack.name} - ₹{snack.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              {formData.selectedSnacks.map(snack => (
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

          <Select
            value={formData.payment_mode}
            onValueChange={(value) => setFormData(prev => ({ ...prev, payment_mode: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Payment Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Upi">UPI</SelectItem>
            </SelectContent>
          </Select>

          {/* Discount Section */}
          <div className="space-y-2">
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
                placeholder="Discount Amount"
                value={formData.discount_amount}
                onChange={(e) => handleDiscountChange('amount', e.target.value)}
                min={0}
              />
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Base Amount:</span>
              <span>₹{calculations.baseAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Snacks Total:</span>
              <span>₹{calculations.snacksTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>₹{calculations.discountAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>₹{calculations.totalAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-green-500">
              <span>GG Points to be earned:</span>
              <span>{calculations.ggPoints} (₹{calculations.ggPointsValue})</span>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create Session
          </Button>
        </form>
      </Card>
    </div>
  );
}
