import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const BookingStation = ({ station, onBook }) => {
  const { id, name, status, nextAvailable, display } = station;

  return (
    <Card className={`station-card ${status}`}>
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-sm">Next available: {nextAvailable}</p>
      <p className="text-sm">{display}</p>
      {status === 'Available' ? (
        <Button onClick={() => onBook(id)} className="mt-2">Book Now</Button>
      ) : (
        <Button disabled className="mt-2">{status === 'Occupied' ? 'Unavailable' : 'Closing Soon'}</Button>
      )}
    </Card>
  );
};

export default BookingStation; 