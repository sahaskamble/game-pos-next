'use client';

import React, { useState } from 'react'
import { CustomerTable } from './components/CustomerTable';
import { useCollection } from '@/lib/hooks/useCollection'
import AddCustomerDialog from './components/AddCustomerDialog';
import AddPlan from './components/AddPlan';

export default function CustomersPage() {
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


  if (!customers || !sessions) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <section className='p-10'>
      <div className='flex items-center justify-between'>
        <h1 className='text-4xl font-semibold pb-4'>Customer Management</h1>
        <AddCustomerDialog handleSubmit={addCustomer} mutate={mutate} />
      </div>
      <CustomerTable
        customers={customers}
        sessions={sessions}
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
