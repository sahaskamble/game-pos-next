'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext';
import { useCollection } from "@/lib/hooks/useCollection";

export default function DataFilter({ onBranchChange }) {
  const { user } = useAuth();
  const { data: branches, loading } = useCollection('branches');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle non-SuperAdmin branch selection
  useEffect(() => {
    if (mounted && user && user?.role !== 'SuperAdmin' && user?.branch_id) {
      const branchId = localStorage.getItem('branch_id');
      setSelectedBranch(branchId);
      onBranchChange(branchId);
    }
  }, [mounted, user, onBranchChange]);

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    onBranchChange(value);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // For non-SuperAdmin users and users with access to both branches, don't render the selector
  if (user?.role !== 'SuperAdmin') {
    return null;
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Select
      value={selectedBranch}
      onValueChange={handleBranchChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All Branches" />
      </SelectTrigger>
      <SelectContent>
        {branches?.map((branch) => (
          <SelectItem key={branch?.id} value={branch?.id}>
            {branch?.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
