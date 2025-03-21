'use client';

import { use, useEffect, useState } from 'react';
import { useCollection } from '@/lib/hooks/useCollection';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddPlan from '../components/AddPlan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionsTable } from '@/components/sessions/SessionsTable';
import { MembershipLogsTable } from '../../logs/memberships/components/LogsTable';

function CustomerInfoPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { data: customerInfo, updateItem: updateCustomerInfo, deleteItem: deleteCustomer, mutate } = useCollection('customers', {
    filter: `id="${id}"`,
    expand: 'branch_id,user_id'
  });
  const { data: sessions } = useCollection('sessions', {
    filter: `customer_id="${id}"`,
    expand: 'customer_id,branch_id,device_id,game_id,session_snacks.snack_id,user_id,billed_by',
    sort: '-created',
  });
  const { data: logs } = useCollection('membershipLog', {
    filter: `customer="${id}"`,
    expand: 'customer,branch_id,user_id,plan_id',
    sort: '-created',
  });


  const { data: memberships } = useCollection('memberships')
  const router = useRouter();

  // <--- State Variables --->
  const [customer, setCustomer] = useState({});
  const [displayText, setdisplayText] = useState('Add Plan');
  const [displayPlanAddDialog, setdisplayPlanAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(customerInfo);
    if (customerInfo?.[0]) {
      setCustomer(customerInfo[0]);
      const membershipPlans = memberships.find((plan) => plan.customer === customer?.id);
      if (membershipPlans?.id && customerInfo?.[0]?.isMember) {
        setdisplayText('Extend Plan');
      } else if (membershipPlans?.id) {
        setdisplayText('Renew Plan');
      }

      setLoading(false);
    }
  }, [customerInfo]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!customer?.customer_name || !customer?.customer_contact || !customer?.wallet || !customer?.total_rewards) {
        toast.warning('Please fill all the fields');
        return;
      }
      await updateCustomerInfo(customer.id, {
        customer_name: customer?.customer_name,
        customer_contact: customer?.customer_contact,
        total_rewards: Number(customer?.total_rewards) || 0,
        wallet: Number(customer?.wallet) || 0,
        isMember: customer?.isMember || false
      });
      toast.success("Customer Info Updated Successfully");
      mutate();
    } catch (error) {
      toast.error('Error Updating Customer Info');
      console.log(error);
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    const action = confirm(`Are you sure you want to delete ${customer?.customer_name} info?`);
    if (action === true) {
      try {
        await deleteCustomer(customer?.id);
        toast.success("Customer Info Deleted Successfully");
        router.replace('/customers')
      } catch (error) {
        toast.error('Error Deleting Customer Info');
        console.log(error);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className='p-6'>
      <div className='border rounded-xl p-4'>
        <CardHeader>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <CardTitle> Customer Info </CardTitle>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 md:justify-between gap-4'>
            <div className="md:col-span-3 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2 w-full">
                <Label> Customer Name </Label>
                <Input
                  type="text"
                  value={customer?.customer_name}
                  onChange={(e) => setCustomer({ ...customer, customer_name: e.target.value })}
                />
              </div>
              <div className="space-y-2 w-full">
                <Label> Contact </Label>
                <Input
                  type="text"
                  value={customer?.customer_contact}
                  onChange={(e) => setCustomer({ ...customer, customer_contact: e.target.value })}
                  minLength={10}
                  maxLength={10}
                />
              </div>
            </div>
            <div className="md:col-span-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2 w-full">
                <Label> Wallet </Label>
                <Input
                  type="number"
                  value={customer?.wallet}
                  onChange={(e) => setCustomer({ ...customer, wallet: e.target.value })}
                />
              </div>
              <div className="space-y-2 w-full">
                <Label> GG Points </Label>
                <Input
                  type="number"
                  value={customer?.total_rewards}
                  onChange={(e) => setCustomer({ ...customer, total_rewards: e.target.value })}
                  minLength={10}
                  maxLength={10}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label> Membership </Label>
              <Select
                value={customer?.isMember}
                onValueChange={(value) => setCustomer({ ...customer, isMember: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={true}>Taken</SelectItem>
                  <SelectItem value={false}>Not Taken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label> Branch </Label>
              <Input
                type="text"
                disabled={true}
                value={customer?.expand?.branch_id?.name}
              />
            </div>
            <div className="space-y-2">
              <Label> Created By </Label>
              <Input
                type="text"
                disabled={true}
                value={customer?.expand?.user_id?.username}
              />
            </div>
          </div>
        </CardHeader>
        <div className='flex items-center gap-2 p-4'>
          <Button onClick={handleUpdate} className='font-semibold'>
            <Pencil className='w-4 h-4' /> Edit
          </Button>
          <Button onClick={handleDelete} variant='destructive'>
            <Trash2 className='w-4 h-4' />
            Delete
          </Button>
          <Button onClick={() => setdisplayPlanAddDialog(true)} variant='outline'>
            <Plus className='w-4 h-4' />
            {displayText}
          </Button>
        </div>

        <Tabs defaultValue="account" className="w-full pt-8">
          <TabsList className='w-full p-4'>
            <TabsTrigger className='w-full' value="sessions">Sessions</TabsTrigger>
            <TabsTrigger className='w-full' value="memberships">Memberships</TabsTrigger>
          </TabsList>
          <TabsContent value="sessions">
            <SessionsTable
              data={sessions}
              displayEditDel={false}
            />
          </TabsContent>
          <TabsContent value="memberships">
            <MembershipLogsTable
              logs={logs}
            />
          </TabsContent>
        </Tabs>
      </div>
      {
        displayPlanAddDialog && (
          <AddPlan
            open={displayPlanAddDialog}
            onOpenChange={setdisplayPlanAddDialog}
            customerInfo={customer}
            mutate={mutate}
            displayText={displayText}
          />
        )
      }
    </section>
  )
}

export default CustomerInfoPage;
