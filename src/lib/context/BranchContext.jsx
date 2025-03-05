'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create the context with a default value
const BranchContext = createContext({
  selectedBranch: null,
  setSelectedBranch: () => {},
});

export function BranchProvider({ children }) {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  useEffect(() => {
    if (user && user.role !== 'SuperAdmin') {
      setSelectedBranch(user.branch_id);
    }
  }, [user]);

  const value = {
    selectedBranch,
    setSelectedBranch
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}

// Export the hook with error handling
export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
