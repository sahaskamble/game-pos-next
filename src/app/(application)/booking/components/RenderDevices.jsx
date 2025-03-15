import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { useCollection } from "@/lib/hooks/useCollection";
import { AirplayIcon, Car, Clock, CookieIcon, Timer, TvIcon, Users, X } from "lucide-react";
import { FaPlaystation } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RenderDeviceSection({ devices, title, icon }) {
  const { data: sessions } = useCollection("sessions", {
    filter: "status='Active'"
  });
  const router = useRouter();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':
        return 'bg-red-500/10 text-red-500 border-red-500/20 text-sm px-2 py-1';
      case 'open':
        return 'bg-green-500/10 text-green-500 border-green-500/20 text-sm px-2 py-1';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20 text-sm px-2 py-1';
    }
  };


  return (
    <div className="space-y-4 pt-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {devices.map((device) => (
          <Card key={device.id} className="p-4">
            <CardTitle className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {device.type === 'PS' ? (
                  <FaPlaystation className="h-5 w-5" />
                ) : device.type === 'SIM' ? (
                  <Car className="h-5 w-5" />
                ) : (
                  <TvIcon className="h-5 w-5" />
                )}
                <span>{device.name}</span>
              </div>
              <Badge variant="outline" className={getStatusColor(device.status)}>
                {device.status}
              </Badge>
            </CardTitle>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                {device.status === "open" && (
                  <>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Max Players: {device.max_players}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AirplayIcon className="h-4 w-4" />
                      <span>{device.type}</span>
                    </div>
                  </>
                )}
              </div>

              {device.status === "booked" && (
                <div className="text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Ends at: {
                      sessions
                        ?.find(session => session.device_id === device.id)
                        ?.session_out ? (
                        new Date(sessions.find((session) => session.device_id === device.id).session_out).toLocaleTimeString()
                      ) : 'N/A'
                    }</span>
                  </div>
                </div>
              )}

              {device.status === "booked" ? (
                <div className="flex gap-2">
                  <Link
                    href={`/booking/extend/${device.id}`}
                    className="w-full px-2 py-2 bg-yellow-500 inline-flex justify-center items-center rounded-lg"
                  >
                    <Timer className="h-4 w-4" color='#fff' />
                  </Link>
                  <Link
                    href={`/booking/snacks/${device.id}`}
                    className="w-full px-2 py-2 bg-blue-500 inline-flex justify-center items-center rounded-lg"
                  >
                    <CookieIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/booking/close/${device.id}`}
                    className="w-full px-2 py-2 bg-red-500 inline-flex justify-center items-center rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={(() => router.push(`/booking/${device.id}`))}
                >
                  Book Now
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// <ExtendSession className='w-full' device={device} />
// <AddSnacksSession className='w-full' device={device} />
// <CloseSession className='w-full' device={device} onChanged={onChanged} />

