'use client';

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCollection } from "@/lib/hooks/useCollection";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/context/AuthContext";

export function AdvanceBookingsNotifications() {
  const { data: bookings, updateItem: updateBooking, mutate } = useCollection("advance_bookings", {
    filter: 'status = "Active"',
    expand: 'customer_id',
  });
  const { user } = useAuth();

  const handleMarkAsClosed = async (bookingId) => {
    if (!user?.id) {
      toast.error('Please login first to access this feature.')
      return;
    }
    try {
      await updateBooking(bookingId, {
        status: "Closed"
      });
      toast.success("Booking marked as closed");
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    } finally {
      mutate();
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {bookings?.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full"
            >
              {bookings.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advance Bookings</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {bookings?.length === 0 ? (
            <p className="text-center text-muted-foreground">No active advance bookings</p>
          ) : (
            bookings?.map((booking) => (
              <div
                key={booking.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    {booking.expand?.customer_id?.customer_name || 'Unknown Customer'}
                  </h4>
                  <Badge>{booking.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Visiting Time: {format(new Date(booking.visiting_time), 'PPpp')}</p>
                  <p>Players: {booking.no_of_players}</p>
                  {booking.note && <p>Note: {booking.note}</p>}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => handleMarkAsClosed(booking.id)}
                >
                  Mark as Closed
                </Button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
