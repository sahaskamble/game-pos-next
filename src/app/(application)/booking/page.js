'use client';

import React from 'react';
import { useCollection } from "@/lib/hooks/useCollection";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, TvIcon, Users } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const router = useRouter();
  const { data: devices, loading } = useCollection("devices");

  const handleBooking = (deviceId) => {
    router.push(`/booking/${deviceId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">PlayStation Booking</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {devices?.map((device) => (
          <Card key={device.id} className="p-4 bg-gray-800 border border-blue-800/30">
            <CardTitle className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{device.name}</h2>
              <span className={`text-sm rounded-full px-3 py-1.5 ${
                device.status === 'Available' 
                  ? 'bg-green-800/60 text-green-500' 
                  : 'bg-red-800/60 text-red-500'
              }`}>
                {device.status}
              </span>
            </CardTitle>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={18} />
                  <span>Hourly Rate: ₹{device.hourly_rate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <TvIcon size={18} />
                  <span>{device.display || '4K Display'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Users size={18} />
                  <span>Max Players: {device.max_players || 4}</span>
                </div>
                <Button
                  className="mt-4 w-full"
                  disabled={device.status !== 'open'}
                  onClick={() => handleBooking(device.id)}
                >
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
