import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
import { Check, Search } from "lucide-react";

export function AddSessionDialog({ open, onOpenChange, onSubmit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    status: 'Active',
    customer_id: '',
    no_of_players: 1,
    visiting_time: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    note: '',
    branch_id: '',
    created_by: user?.id
  });
  const [customerInput, setCustomerInput] = useState({
    customer_name: "",
    phone: ""
  });
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const { data: customers, createItem: createCustomer } = useCollection("customers");
  const { data: branches } = useCollection('branches');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.customer_id) {
        toast.warning("Please select a customer");
        return;
      }

      if (!formData.visiting_time) {
        toast.warning("Please select visiting time");
        return;
      }

      if (formData.no_of_players < 1) {
        toast.warning("Number of players must be at least 1");
        return;
      }

      const visitingTime = new Date(formData.visiting_time);
      if (isNaN(visitingTime.getTime())) {
        toast.error("Invalid visiting time");
        return;
      }

      if (formData?.branch_id || formData.no_of_players > 1 || !isNaN(visitingTime) || formData.customer_id) {
        const sessionData = {
          ...formData,
          no_of_players: parseInt(formData.no_of_players),
          visiting_time: visitingTime.toISOString(),
        };
        await onSubmit(sessionData);
        onOpenChange(false);
        // Reset form
        setFormData({
          status: 'Active',
          customer_id: '',
          no_of_players: 1,
          visiting_time: new Date().toISOString().slice(0, 16),
          note: '',
          branch_id: '',
          created_by: user?.id
        });

        toast.success("Session added successfully");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    }
  };

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
        branch_id: formData.branch_id,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Advance Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
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

          <div>
            <Label>Number of Players</Label>
            <Input
              type="number"
              min="1"
              value={formData.no_of_players}
              onChange={(e) => setFormData({ ...formData, no_of_players: e.target.value })}
            />
          </div>

          <div>
            <Label>Visiting Date and Time</Label>
            <Input
              type="datetime-local"
              value={formData.visiting_time}
              onChange={(e) => setFormData({ ...formData, visiting_time: e.target.value })}
            />
          </div>

          <div>
            <Label>Branch</Label>
            <Select
              value={formData.branch_id}
              onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
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
            <Label>Note</Label>
            <Textarea
              placeholder="Add any additional notes here..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">Add Advance Session</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
