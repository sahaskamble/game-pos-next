'use client';

import React, { useState } from 'react'
import { MembershipsTable } from './components/Table';
import { useCollection } from '@/lib/hooks/useCollection'
import AddPlanDialog from './components/AddPlanDialog';
import EditPlanDialog from './components/EditPlanDialog';

export default function MembershipsPage() {
  const [editingPlan, setEditingPlan] = useState(null);

  const {
    data: memberships,
    mutate,
    createItem: addPlan,
    updateItem: update,
    deleteItem: remove,
  } = useCollection("memberships", {
    expand: 'branch_id,user_id',
    sort: '-created'
  });

  if (!memberships) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <section className='p-10'>
      <div className='flex items-center justify-between'>
        <h1 className='text-4xl font-semibold pb-4'>Membership Plans Management</h1>
        <AddPlanDialog handleSubmit={addPlan} mutate={mutate} />
      </div>
      <MembershipsTable
        memberships={memberships}
        onEdit={setEditingPlan}
        onDelete={remove}
        mutate={mutate}
      />
      <EditPlanDialog
        open={!!editingPlan}
        onOpenChange={() => setEditingPlan(null)}
        initialData={editingPlan}
        onSubmit={update}
        mutate={mutate}
      />
    </section>
  )
};
