'use client';

import React from 'react'
import { useCollection } from '@/lib/hooks/useCollection';
import RenderDeviceSection from './components/RenderDevices';
import { FaPlaystation } from 'react-icons/fa';
import { Car, TvIcon } from 'lucide-react';
import { BsHeadsetVr } from "react-icons/bs";
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();
  const { data: devices, loading } = useCollection("devices", {
    expand: 'branch_id',
  });

  const groupedDevices = devices?.reduce((acc, device) => {
    const type = device.type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(device);
    return acc;
  }, {});

  const onChanged = () => {
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className='p-8 grid gap-6'>
      <h1 className="text-2xl font-bold mb-2">Device Booking</h1>


      {/* PlayStation Section */}
      {groupedDevices?.PS && groupedDevices?.PS?.length > 0 && (
        <RenderDeviceSection
          devices={groupedDevices.PS}
          title="PlayStation"
          icon=<FaPlaystation className="h-6 w-6" />
          onChanged={onChanged}
        />
      )}

      {/* Simulator Section */}
      {groupedDevices?.SIM && groupedDevices?.SIM?.length > 0 && (
        <RenderDeviceSection
          devices={groupedDevices.SIM}
          title="Simulator"
          icon=<Car className="h-6 w-6" />
          onChanged={onChanged}
        />
      )}

      {/* VR Section */}
      {groupedDevices?.VR && groupedDevices.VR.length > 0 && (
        <RenderDeviceSection
          devices={groupedDevices.VR}
          title="Virtual Reality"
          icon=<BsHeadsetVr className="h-6 w-6" />
          onChanged={onChanged}
        />
      )}

      {/* Other Devices Section */}
      {groupedDevices?.Other && groupedDevices.Other.length > 0 && (
        <RenderDeviceSection
          devices={groupedDevices.Other}
          title="Other Devices"
          icon=<TvIcon className="h-6 w-6" />
          onChanged={onChanged}
        />
      )}

    </section>
  )
};
