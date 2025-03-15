'use client';

import React, { useState, useEffect } from 'react'
import { useCollection } from '@/lib/hooks/useCollection';
import RenderDeviceSection from './components/RenderDevices';
import { FaPlaystation } from 'react-icons/fa';
import { Car, TvIcon } from 'lucide-react';
import { BsHeadsetVr } from "react-icons/bs";
import { useRouter } from 'next/navigation';
import DataFilter from "@/components/superAdmin/DataFilter";

export default function BookingPage() {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filteredDevices, setFilteredDevices] = useState([]);

  const { data: devices, loading } = useCollection("devices", {
    expand: 'branch_id',
  });

  // Filter devices based on branch
  useEffect(() => {
    if (devices) {
      let filtered = [...devices];

      // Apply branch filter if selected
      if (selectedBranch) {
        filtered = filtered.filter(device => device.branch_id === selectedBranch);
      }

      setFilteredDevices(filtered);
    }
  }, [devices, selectedBranch]);

  const groupedDevices = filteredDevices?.reduce((acc, device) => {
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
    <div className="container px-8 mx-auto py-10 grid gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Booking</h2>
        <div className="flex items-center gap-4">
          <DataFilter
            onBranchChange={setSelectedBranch}
          />
        </div>
      </div>

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
          title="Car Simulator"
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

    </div>
  );
}
