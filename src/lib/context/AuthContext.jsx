"use client";

import { createContext, useContext, useEffect, useState } from "react";
import pb from "../pocketbase";
import { redirect, useRouter } from "next/navigation";

const AuthContext = createContext();

// Hardcoded Café Coordinates
const cafeCoordinates = { lat: 19.214611, lon: 73.101417 };
const allowedRadius = 0.5; // in km

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.record || []);
  const [branches, setBranches] = useState([]);
  const isValid = pb.authStore.isValid;
  const router = useRouter();

  useEffect(() => {
    async function fetchBranches() {
      try {
        const record = await pb.collection("branches").getList();
        setBranches(record.items);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    }

    fetchBranches();
  }, []);

  // Function to login user and update login details
  async function login(username, password) {
    try {
      const identity = username;
      const authData = await pb.collection("users").authWithPassword(identity, password);

      if (!authData || !authData.record) {
        throw new Error("Authentication failed.");
      }

      // Retrieve user details
      const userId = authData.record.id;
      const branchId = authData.record.branch_id;

      // Log the login details in PocketBase
      await pb.collection("staff_logins").create({
        user_id: userId,
        branch_id: branchId,
        login_time: new Date().toISOString(),
        status: "active",
        // location: { lat: latitude, lon: longitude },
      });

      setUser(authData.record);
      return authData;
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
  }

  // Function to log out and update logout time
  async function logout(id) {
    try {
      const userId = id;
      if (userId) {
        const latestLogin = await pb.collection("staff_logins").getFirstListItem(`user_id="${userId}"`, { sort: "-login_time" });

        if (latestLogin) {
          await pb.collection("staff_logins").update(latestLogin.id, {
            logout_time: new Date().toISOString(),
          });
        }
      }

      pb.authStore.clear();
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ logout, login, user, branches, isValid }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

