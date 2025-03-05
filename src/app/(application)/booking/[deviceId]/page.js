"use client";

import { useState, useEffect, use } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
// import { useAuth } from "@/lib/hooks/useAuth";
import { useAuth } from "@/lib/context/AuthContext";
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
import { Plus, Search, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { calculateSessionValues } from "@/lib/utils/calculateSessionValues";
import { toast } from "@/components/ui/sonner";  // or whatever toast library you're using

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

export default function BookingPage({ params }) {
  const { user } = useAuth(); // Add this line to get the authenticated user
  const router = useRouter();
  const unwrappedParams = use(params);
  const deviceId = unwrappedParams.deviceId;

  const { data: device, updateItem: updateDevice } = useCollection("devices", {
    filter: `id="${deviceId}"`
  });
  const { data: games } = useCollection("games");
  const { data: customers, createItem: createCustomer } = useCollection("customers");
  const { data: snacks } = useCollection("snacks");
  const { data: settings } = useCollection("settings");
  const { createItem: createSession, updateItem: updateSession } = useCollection("sessions");
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
    duration: 15, // Changed default to 15 minutes
    duration_unit: "minutes", // Add new state for duration unit
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

  const [customerInput, setCustomerInput] = useState({
    customer_name: "",
    phone: ""
  });

  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  // Filter customers based on name input
  const filteredCustomers = customers?.filter(customer =>
    customer.customer_name.toLowerCase().includes(customerInput.customer_name.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({ ...prev, customer_id: customer.id }));
    setCustomerInput({
      customer_name: customer.customer_name,
      phone: customer.customer_contact
    });
    setShowCustomerSuggestions(false);
  };

  const handleNewCustomer = async () => {
    try {
      if (!customerInput.customer_name || !customerInput.phone) {
        toast.error("Please fill in both customer name and phone");
        return;
      }

      const newCustomer = await createCustomer({
        customer_name: customerInput.customer_name,
        customer_contact: customerInput.phone,
      });

      // Update form data with the new customer ID
      setFormData(prev => ({ ...prev, customer_id: newCustomer.id }));
      return newCustomer;
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create customer");
    }
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

    // Convert duration to hours for calculation
    const durationInHours = formData.duration_unit === "minutes"
      ? formData.duration / 60
      : formData.duration;

    console.log("Calculating with:", {
      players: formData.no_of_players,
      settings: settings[0],
      duration: durationInHours
    });

    // Calculate base price
    const sessionValues = calculateSessionValues(formData.no_of_players, settings[0]);
    const basePrice = sessionValues.totalAmount * durationInHours;

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
  }, [formData.no_of_players, formData.duration, formData.duration_unit, formData.selectedSnacks, formData.discount_type, formData.discount_percentage, formData.discount_amount, settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.game_id) {
        toast.error("Please select a game");
        return;
      }

      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // If no customer_id is set but we have customer input, create a new customer
      let customerId = formData.customer_id;
      if (!customerId && customerInput.customer_name && customerInput.phone) {
        const newCustomer = await handleNewCustomer();
        if (!newCustomer) {
          return; // Exit if customer creation failed
        }
        customerId = newCustomer.id;
      }

      if (!customerId) {
        toast.error("Please select or create a customer");
        return;
      }

      // Calculate session end time
      const sessionIn = new Date();
      const sessionOut = new Date(sessionIn);

      // Add duration based on unit
      if (formData.duration_unit === "minutes") {
        sessionOut.setMinutes(sessionOut.getMinutes() + formData.duration);
      } else {
        sessionOut.setHours(sessionOut.getHours() + formData.duration);
      }

      // Create the session
      const session = await createSession({
        device_id: deviceId,
        customer_id: customerId,
        game_id: formData.game_id,
        branch_id: user.branch_id,
        user_id: user.id,
        no_of_players: formData.no_of_players,
        duration: formData.duration,
        duration_unit: formData.duration_unit,
        payment_mode: formData.payment_mode,
        status: "Active",
        base_amount: calculations.baseAmount,
        snacks_total: calculations.snacksTotal,
        discount_type: formData.discount_type,
        discount_percentage: formData.discount_percentage,
        discount_amount: calculations.discountAmount,
        total_amount: calculations.totalAmount,
        gg_points_earned: calculations.ggPoints,
        session_in: sessionIn.toISOString(),
        session_out: sessionOut.toISOString(),
        session_amount: calculations.baseAmount,
      });

      // Update customer's total rewards
      try {
        const customer = await pb.collection('customers').getOne(customerId);
        const currentRewards = customer.total_rewards || 0;
        
        await pb.collection('customers').update(customerId, {
          total_rewards: currentRewards + calculations.ggPoints
        });
      } catch (error) {
        console.error("Error updating customer rewards:", error);
        // Don't throw error here as session is already created
      }

      // Update game popularity score
      try {
        const game = await pb.collection('games').getOne(formData.game_id);
        const currentScore = game.popularity_score || 0;

        await pb.collection('games').update(formData.game_id, {
          popularity_score: currentScore + 1
        });
      } catch (error) {
        console.error("Error updating game popularity:", error);
        // Don't throw error here as session is already created
      }

      // Create session snacks if any are selected
      if (formData.selectedSnacks.length > 0) {
        for (const snack of formData.selectedSnacks) {
          await createSessionSnack({
            session_id: session.id,
            snack_id: snack.id,
            quantity: snack.quantity,
            price: snack.price * snack.quantity,
            branch_id: user.branch_id,
            user_id: user.id,
          });
        }
      }

      // Update device status
      await updateDevice(deviceId, {
        status: "booked",
        current_session: session.id
      });

      router.push("/booking");

    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    }
  };

  // Add new states for session management
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showAddSnackDialog, setShowAddSnackDialog] = useState(false);
  const [extensionHours, setExtensionHours] = useState(1);
  const [currentSession, setCurrentSession] = useState(null);

  // Get current session if device is booked
  useEffect(() => {
    if (device?.[0]?.status === "Booked" && device[0].current_session) {
      const fetchSession = async () => {
        try {
          const session = await pb.collection('sessions').getOne(device[0].current_session, {
            expand: 'customer_id,game_id'
          });
          setCurrentSession(session);
        } catch (error) {
          console.error("Error fetching session:", error);
        }
      };
      fetchSession();
    }
  }, [device]);

  const handleExtendSession = async () => {
    try {
      const additionalAmount = (calculations.baseAmount / formData.duration) * extensionHours;

      // Update session
      const updatedSession = await pb.collection('sessions').update(currentSession.id, {
        duration: currentSession.duration + extensionHours,
        total_amount: currentSession.total_amount + additionalAmount
      });

      toast.success("Session extended successfully");
      setShowExtendDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Error extending session:", error);
      toast.error("Failed to extend session");
    }
  };

  const handleAddSnacksToSession = async (selectedSnacks) => {
    try {
      // Calculate new snacks total
      const newSnacksTotal = selectedSnacks.reduce((acc, snack) => {
        return acc + (snack.price * snack.quantity);
      }, currentSession.snacks_total || 0);

      // Update session with new total
      await pb.collection('sessions').update(currentSession.id, {
        snacks_total: newSnacksTotal,
        total_amount: currentSession.total_amount + newSnacksTotal
      });

      // Create session_snack entries
      for (const snack of selectedSnacks) {
        await createSessionSnack({
          session_id: currentSession.id,
          snack_id: snack.id,
          quantity: snack.quantity,
          price: snack.price * snack.quantity,
          branch_id: user.branch_id, // Add branch_id
          user_id: user.id, // Add user_id
        });
      }

      toast.success("Snacks added successfully");
      setShowAddSnackDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding snacks:", error);
      toast.error("Failed to add snacks");
    }
  };

  const handleCloseSession = async () => {
    try {
      // Update session status
      await pb.collection('sessions').update(currentSession.id, {
        status: "Completed",
        session_out: new Date().toISOString()
      });

      // Update device status
      await pb.collection('devices').update(deviceId, {
        status: "Open",
        current_session: null
      });

      toast.success("Session closed successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Failed to close session");
    }
  };

  return (
    <div className="p-8">
      <Card className="max-w-full md:max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">New Session Booking</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <div className="relative">
                <Input
                  id="customer_name"
                  value={customerInput.customer_name}
                  onChange={(e) => {
                    setCustomerInput(prev => ({
                      ...prev,
                      customer_name: e.target.value
                    }));
                    setShowCustomerSuggestions(true);
                    setFormData(prev => ({ ...prev, customer_id: "" }));
                  }}
                  className="pr-8"
                />
                <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />

                {/* Customer suggestions dropdown */}
                {showCustomerSuggestions && customerInput.customer_name && filteredCustomers?.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div>
                          <div>{customer.customer_name}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </div>
                        {formData.customer_id === customer.id && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={customerInput.phone}
                onChange={(e) => {
                  setCustomerInput(prev => ({
                    ...prev,
                    phone: e.target.value
                  }));
                  setFormData(prev => ({ ...prev, customer_id: "" }));
                }}
              />
            </div>

            {/* Show this button only when no existing customer is selected and inputs are filled */}
            {!formData.customer_id && customerInput.customer_name && customerInput.phone && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleNewCustomer}
              >
                Add as New Customer
              </Button>
            )}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                type="number"
                min={formData.duration_unit === "minutes" ? 15 : 1}
                step={formData.duration_unit === "minutes" ? 15 : 1}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_unit">Duration Unit</Label>
              <Select
                value={formData.duration_unit}
                onValueChange={(value) => {
                  // Reset duration when switching units
                  const newDuration = value === "minutes" ? 15 : 1;
                  setFormData({ ...formData, duration_unit: value, duration: newDuration });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
