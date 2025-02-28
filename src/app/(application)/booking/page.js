'use client';

import { useAuth } from "@/lib/context/AuthContext";
import { useEffect } from "react";

export default function BookingPage() {
  const { logout, user, isValid } = useAuth();

  useEffect(() => {
    if (!isValid) {
      toast.info('User is not Authenticated')
      return redirect('/login');
    }
  }, [isValid])

  if (!isValid) return null;
  return (
    <>
      <h1>Booking Page</h1>
      <p>{user.username}</p>
      <button onClick={logout}>logout</button>
    </>
  )
}
