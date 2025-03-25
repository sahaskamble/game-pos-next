'use client';

import { useEffect, useState } from "react";
import { CustomerTable } from './components/CustomerTable';
import { useCollection } from '@/lib/hooks/useCollection'
import AddCustomerDialog from './components/AddCustomerDialog';
import AddPlan from './components/AddPlan';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataFilter from "@/components/superAdmin/DataFilter";
import { useAuth } from "@/lib/context/AuthContext";

export default function CustomersPage() {
  const { user } = useAuth();
  const { data: customers, mutate, createItem: addCustomer } = useCollection("customers", {
    expand: 'branch_id,user_id',
    sort: '-created'
  });
  const { data: sessions } = useCollection("sessions", {
    expand: 'customer_id,branch_id,device_id,game_id,session_snacks.snack_id',
    sort: '-created'
  });

  // <--- State Variables --->
  const [displayAddDialog, setDisplayAddDialog] = useState(false);
  const [CustomerMembershipAdd, setCustomerMembershipAdd] = useState();
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      let FilteredCust = customers;
      let FilteredSessions = sessions;
      if (user?.role !== 'SuperAdmin') {
        const branchId = localStorage.getItem('branch_id');
        FilteredCust = FilteredCust.filter((customer) => customer.branch_id === branchId);
        FilteredSessions = FilteredSessions.filter((session) => session.branch_id === branchId);
      } else if (selectedBranch) {
        FilteredCust = FilteredCust.filter((customer) => customer.branch_id === selectedBranch);
        FilteredSessions = FilteredSessions.filter((session) => session.branch_id === selectedBranch);
      }
      setFilteredCustomers(FilteredCust);
      setFilteredSessions(FilteredSessions);
    }
    if (customers && sessions) {
      fetchData();
    }
  }, [customers, sessions, selectedBranch]);



  if (!customers || !sessions) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <section className='p-10'>
      <div className='flex items-center justify-between'>
        <h1 className='text-4xl font-semibold pb-4'>Customer Management</h1>
        <div className="flex items-center gap-4">
          <DataFilter
            onBranchChange={setSelectedBranch}
          />
          <AddCustomerDialog handleSubmit={addCustomer} mutate={mutate} />
        </div>
      </div>
      <CustomerTable
        customers={filteredCustomers}
        sessions={filteredSessions}
        displayMembership={setDisplayAddDialog}
        customerInfo={setCustomerMembershipAdd}
      />
      {
        displayAddDialog && (
          <AddPlan
            open={displayAddDialog}
            onOpenChange={setDisplayAddDialog}
            customerInfo={CustomerMembershipAdd}
            mutate={mutate}
          />
        )
      }
    </section>
  )
};
