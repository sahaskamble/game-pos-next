'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowRightLeft, Car, TvIcon } from "lucide-react"
import { useCollection } from "@/lib/hooks/useCollection";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FaPlaystation } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ShiftSession({ deviceType = 'PS', deviceId = '', onUpdate = () => { } }) {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [devicesData, setDevicesData] = useState([]);
  const [isOpen, setisOpen] = useState(false);
  const { data: sessions, updateItem: updateSession } = useCollection("sessions", {
    filter: "status='Active'"
  });
  const { data: devices, updateItem: updateDevice } = useCollection("devices", {
    filter: "status='open'"
  });

  useEffect(() => {
    if (devices) {
      const branchId = localStorage.getItem('branch_id');
      const devices_data = devices.filter((device) => device?.branch_id === branchId && device?.type === deviceType);
      setDevicesData(devices_data);
    }
  }, [devices]);

  const handleShiftSession = async () => {
    if (!selectedDevice) {
      toast.error('Please select a device to shift session')
      return;
    };

    try {
      const onGoingSession = sessions?.find((session) => session?.device_id === deviceId && session?.status === 'Active');

      // Update Device Id for current session
      await updateSession(onGoingSession?.id, {
        device_id: selectedDevice
      });

      // Set previous device to open
      await updateDevice(deviceId, {
        status: 'open'
      });

      // Set new device as booked
      await updateDevice(selectedDevice, {
        status: 'booked'
      });

    } catch (error) {
      toast.error('Error Shifting Session, please try again later');
      console.log('Error Shifting Session', error);
    } finally {
      setisOpen(false);
      onUpdate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setisOpen} className='w-full'>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="w-full px-2 py-2 bg-green-800/80 hover:bg-green-800 dark:bg-green-600/80 dark:hover:bg-green-600 dark:text-white"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90dvw] md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Shift Session</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Select a device to shift this session. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devicesData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 col-span-full">
                No available devices found
              </p>
            ) : (
              devicesData.map((device) => (
                <Card
                  key={device.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedDevice === device.id ? 'border-2 border-primary' : ''
                    }`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {device.type === 'PS' ? (
                          <FaPlaystation className="h-5 w-5 text-blue-500" />
                        ) : device.type === 'SIM' ? (
                          <Car className="h-5 w-5 text-green-500" />
                        ) : (
                          <TvIcon className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.type} • Max Players: {device.max_players || 4}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => { setSelectedDevice(''); setisOpen(false); }}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleShiftSession}
            disabled={!selectedDevice}
          >
            Shift Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
