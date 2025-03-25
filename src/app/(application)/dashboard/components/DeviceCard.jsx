import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DeviceCard({ sessions = [], devices = [] }) {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [timeRangeStats, setTimeRangeStats] = useState([
    { range: '9am-12pm', sales: 0, customers: 0 },
    { range: '12pm-3pm', sales: 0, customers: 0 },
    { range: '3pm-6pm', sales: 0, customers: 0 },
    { range: '6pm-9pm', sales: 0, customers: 0 },
    { range: '9pm-12am', sales: 0, customers: 0 },
  ]);
  const [PeakTime, setPeakTime] = useState({
    slot: '',
    customers: 0,
    revenue: 0
  });

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 p-2 border rounded-lg shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          {/*
          <p className="text-sm text-muted-foreground">
            Revenue: ₹{payload[0].value.toLocaleString()}
          </p>
          */}
          <p className="text-sm text-muted-foreground">
            Customers: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    // Initialize selected device if not set and devices are available
    if (!selectedDevice && devices.length > 0) {
      setSelectedDevice(devices[0]);
    }

    // Calculate revenue for each device and time-range statistics
    const revenueByDevice = devices.reduce((acc, device) => {
      const deviceTotal = sessions
        .filter((session) => session.device_id === device.id)
        .reduce((sum, session) => sum + (Number(session?.amount_paid) || 0), 0);

      return {
        ...acc,
        [device.id]: deviceTotal
      };
    }, {});

    // Update total revenue for selected device
    if (selectedDevice) {
      setTotalRevenue(revenueByDevice[selectedDevice.id] || 0);

      // Calculate time-range statistics for selected device
      const deviceSessions = sessions.filter(
        (session) => session.device_id === selectedDevice.id
      );

      const newTimeRangeStats = timeRangeStats.map(slot => {
        const [startTime, endTime] = slot.range.split('-').map(time => {
          const [hour, meridiem] = time.match(/(\d+)(am|pm)/).slice(1);
          return meridiem === 'pm' && hour !== '12'
            ? parseInt(hour) + 12
            : parseInt(hour);
        });

        const slotSessions = deviceSessions.filter(session => {
          const sessionHour = new Date(session.session_in).getHours();
          return sessionHour >= startTime && sessionHour < endTime;
        });

        return {
          range: slot.range,
          sales: slotSessions.reduce((sum, session) =>
            sum + (Number(session?.amount_paid) || 0), 0),
          customers: slotSessions.reduce((sum, session) =>
            sum + (Number(session?.no_of_players) || 0), 0)
        };
      });

      setTimeRangeStats(newTimeRangeStats);

      // Calculate peak hour slots
      if (newTimeRangeStats.length > 0) {
        let maxCustomers = 0;
        let totalCustomers = 0;
        let customersSlot = "";

        newTimeRangeStats.forEach(slot => {
          totalCustomers += slot.customers;
          if (slot.customers > maxCustomers) {
            maxCustomers = slot.customers;
            customersSlot = slot.range;
          }
        });

        setPeakTime({
          slot: customersSlot,
          customers: totalCustomers
        });
      }
    }
  }, [sessions, devices, selectedDevice]);

  const handleDeviceChange = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    setSelectedDevice(device);
  };

  if (!selectedDevice) {
    return (
      <Card className='h-[490px]'>
        <CardHeader>
          <CardTitle className='text-sm text-muted-foreground'>Device Revenue</CardTitle>
          <CardDescription className='text-2xl font-semibold text-foreground'>
            Loading...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className='text-sm text-muted-foreground'>Device</CardTitle>
          <Select
            value={selectedDevice.id}
            onValueChange={handleDeviceChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name} - {device?.expand?.branch_id?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CardDescription className='text-2xl font-semibold text-foreground'>
          ₹ {totalRevenue.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeRangeStats}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} opacity={0.3} />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                dataKey="range"
                type="category"
                tick={{ fontSize: 12 }}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              {/*
              <Legend wrapperStyle={{ fontSize: "16px" }} />
              <Bar
                dataKey="sales"
                name="Revenue (₹)"
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
              */}
              <Bar
                dataKey="customers"
                name="Customers"
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
        <div className="flex items-center gap-2">
          <h1 className="font-bold"> Peak Hour :- </h1>
          <span>{PeakTime.slot}</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-bold"> Customers Visited :- </h1>
          <span>{PeakTime.customers}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
