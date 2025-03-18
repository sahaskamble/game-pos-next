"use client";

import { useState, useEffect, use } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
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
import { Label } from "@/components/ui/label";
import { Search, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { calculateSessionValues } from "@/lib/utils/calculateSessionValues";
import { toast } from "sonner";

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
  const { data: snacks, updateItem: updateSnacksQuantity } = useCollection("snacks");
  const { data: settings } = useCollection("settings");
  const { createItem: createSession } = useCollection("sessions");
  const { createItem: createSessionSnack } = useCollection("session_snack");
  const [branchId, setBranchId] = useState('');
  const [deviceSettings, setDeviceSettings] = useState();

  useEffect(() => {
    if (settings && device) {
      const device_settings = settings.filter((setting) =>
        setting.type === device[0]?.type && setting?.branch_id === device[0]?.branch_id
      );
      if (device_settings?.[0]) {
        setDeviceSettings(device_settings?.[0]);
      }
    }
  }, [settings, device]);

  useEffect(() => {
    // Use setTimeout to ensure the page has loaded and state has been updated
    const checkSettings = setTimeout(() => {
      // Only check if we have the required data and no settings were found
      if (settings &&
        device &&
        device?.length > 0 &&
        (!deviceSettings || deviceSettings.length === 0)
      ) {
        toast.error('No Settings found for this device type');
        router.push('/booking');
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(checkSettings); // Cleanup timeout
  }, [deviceSettings, settings, device, router]);

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
    const maxPlayers = device?.[0]?.max_players || 4;

    if (value > maxPlayers) {
      toast.warning(`Maximum ${maxPlayers} players allowed`);
    }

    setFormData(prev => ({
      ...prev,
      no_of_players: Math.max(1, Math.min(value, maxPlayers))
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
        total_visits: 1,
        total_rewards: 0,
        branch_id: branchId,
        user_id: user?.id,
        isMember: false,
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
    const fetchData = () => {
      const branch_id = localStorage.getItem('branch_id');
      setBranchId(branch_id);
      // Convert duration to hours for calculation
      const durationInHours = formData.duration_unit === "minutes"
        ? formData.duration / 60
        : formData.duration;

      // Calculate base price
      const sessionValues = calculateSessionValues(formData.no_of_players, deviceSettings);
      const basePrice = sessionValues.totalAmount * durationInHours;

      // Calculate snacks total
      const snacksTotal = formData.selectedSnacks.reduce((acc, snack) => {
        return acc + (snack.price * snack.quantity);
      }, 0);

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
      const ggConfig = deviceSettings.ggpoints_config;
      const ggPoints = Math.floor((basePrice * ggConfig.reward_percentage) / 100);
      const ggPointsValue = Math.floor(ggPoints / ggConfig.points_to_rupee_ratio);
      setCalculations({
        baseAmount: basePrice,
        snacksTotal,
        discountAmount,
        totalAmount: finalTotal,
        ggPoints,
        ggPointsValue,
      });
    }

    // Early return if no settings or formData
    if (deviceSettings && deviceSettings?.length !== 0) {
      switch (device[0]?.type) {
        case 'PS':
          fetchData();
          break;
        case 'SIM':
          fetchData();
          break;
      }
    }

  }, [formData.no_of_players, formData.duration, formData.duration_unit, formData.selectedSnacks, formData.discount_type, formData.discount_percentage, formData.discount_amount, deviceSettings]);

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
        branch_id: branchId,
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

        await pb.collection('customers').update(customer?.id, {
          total_rewards: currentRewards + calculations?.ggPoints
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

      // Create session snacks and update snack quantities
      if (formData.selectedSnacks.length > 0) {
        for (const snack of formData.selectedSnacks) {
          // Create session snack entry
          await createSessionSnack({
            session_id: session.id,
            snack_id: snack.id,
            quantity: snack.quantity,
            price: snack.price * snack.quantity,
            branch_id: branchId,
            user_id: user.id,
          });

          // Update snack quantity in snacks collection
          try {
            const currentSnack = snacks.find((s) => s.id === snack.id);
            const newQuantity = currentSnack.quanity - snack.quantity;
            await updateSnacksQuantity(snack.id, {
              quanity: newQuantity
            });
          } catch (error) {
            console.error(`Error updating quantity for snack ${snack.id}:`, error);
            toast.error(`Failed to update quantity for ${snack.name}`);
          }
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
  const [currentSession, setCurrentSession] = useState(null);

  // Get current session if device is booked
  useEffect(() => {
    if (device?.[0]?.status === "Booked" && device?.[0]?.current_session) {
      const fetchSession = async () => {
        try {
          const session = await pb.collection('sessions').getOne(device[0]?.current_session, {
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
                  placeholder='eg; John Doe'
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
                placeholder='eg; 1234567890'
                maxLength={10}
                minLength={10}
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

          <div className="space-y-2">
            <Label htmlFor="game">Game</Label>
            <Select
              value={formData.game_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, game_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Game" />
              </SelectTrigger>
              <SelectContent>
                {games
                  ?.filter((game) => game.branch_id === branchId)
                  ?.map(game => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Players Input */}
          {device?.[0]?.type === 'PS' && (
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
          )}

          {/* Duration Select */}
          {
            device?.[0]?.type !== 'VR' && (
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
            )
          }

          <div className="space-y-2">
            <h3 className="font-semibold">Add Snacks</h3>
            <Select onValueChange={handleSnackAdd}>
              <SelectTrigger>
                <SelectValue placeholder="Add Snack" />
              </SelectTrigger>
              <SelectContent>
                {snacks
                  ?.filter((snack) => snack?.branch_id === branchId && snack.quanity > 0)
                  ?.map(snack => (
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

          <div className="space-y-2">
            <Label htmlFor="payment_mode">Payment Mode</Label>
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
