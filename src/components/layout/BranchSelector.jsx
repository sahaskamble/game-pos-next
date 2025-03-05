'use client';

import { useCallback, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection } from "@/lib/hooks/useCollection";
import { useBranch } from '@/lib/context/BranchContext';
import { useAuth } from '@/lib/context/AuthContext';
import debounce from 'lodash/debounce';

export function BranchSelector() {
  const { user } = useAuth();
  const { selectedBranch, setSelectedBranch } = useBranch();
  const { data: branches } = useCollection('branches');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const debouncedBranchChange = useCallback(
    debounce((value) => {
      setSelectedBranch(value);
    }, 300),
    []
  );

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Check user role after mounting
  if (user?.role !== 'SuperAdmin') {
    return null;
  }

  return (
    <div className="w-[200px] ml-4">
      <Select
        value={selectedBranch}
        onValueChange={debouncedBranchChange}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select Branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
          {branches?.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
