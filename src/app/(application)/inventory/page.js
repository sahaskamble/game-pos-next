"use client";

import { useState, useEffect } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { AddItemDialog } from "@/components/inventory/AddItemDialog";
import { EditItemDialog } from "@/components/inventory/EditItemDialog";
import { useAuth } from "@/lib/context/AuthContext";
import { StatsCard } from "@/components/dashboard/StatsCard";
import DataFilter from "@/components/superAdmin/DataFilter";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("devices");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filteredInventory, setFilteredInventory] = useState({
    devices: [],
    games: [],
    snacks: []
  });
  const { user } = useAuth();

  const isAdminOrSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';
  const isStaff = user?.role === 'Staff';

  const getItemTypeSingular = (type) => {
    switch (type) {
      case 'devices':
        return 'device';
      case 'games':
        return 'game';
      case 'snacks':
        return 'snack';
      default:
        return 'item';
    }
  };

  const {
    data: devices,
    loading: devicesLoading,
    createItem: createDevice,
    updateItem: updateDevice,
    deleteItem: deleteDevice,
  } = useCollection("devices", { expand: "branch_id" });

  const {
    data: games,
    loading: gamesLoading,
    createItem: createGame,
    updateItem: updateGame,
    deleteItem: deleteGame,
  } = useCollection("games", { expand: "branch_id" });

  const {
    data: snacks,
    loading: snacksLoading,
    createItem: createSnack,
    updateItem: updateSnack,
    deleteItem: deleteSnack,
  } = useCollection("snacks", { expand: "branch_id" });

  const {
    data: branches,
    loading: branchesLoading,
  } = useCollection("branches");

  // Filter inventory based on branch
  useEffect(() => {
    if (devices && games && snacks) {
      let filteredDevices = [...devices];
      let filteredGames = [...games];
      let filteredSnacks = [...snacks];

      // Apply branch filter if selected
      if (selectedBranch) {
        filteredDevices = devices.filter(device => device.branch_id === selectedBranch);
        filteredGames = games.filter(game => game.branch_id === selectedBranch);
        filteredSnacks = snacks.filter(snack => snack.branch_id === selectedBranch);
      }

      setFilteredInventory({
        devices: filteredDevices,
        games: filteredGames,
        snacks: filteredSnacks
      });
    }
  }, [devices, games, snacks, selectedBranch]);

  // Calculate snack inventory statistics from filtered snacks
  const snackStats = filteredInventory.snacks?.reduce((stats, snack) => {
    const quantity = snack.quanity || 0;
    if (quantity === 0) {
      stats.emptyStock++;
    } else if (quantity <= 10) {
      stats.lowStock++;
    } else {
      stats.availableStock++;
    }
    return stats;
  }, { lowStock: 0, availableStock: 0, emptyStock: 0 }) || { lowStock: 0, availableStock: 0, emptyStock: 0 };

  const collections = {
    devices: {
      data: devices,
      loading: devicesLoading,
      create: createDevice,
      update: updateDevice,
      delete: deleteDevice,
      fields: [
        { name: "name", type: "text", label: "Name" },
        { name: "type", type: "select", label: "Type", options: ["PS", "SIM", "VR"] },
        { name: "status", type: "select", label: "Status", options: ["open", "booked"] },
        {
          name: "branch_id",
          type: "relation",
          label: "Branch",
          options: branches?.map(branch => ({
            value: branch.id,
            label: branch.name
          })) || []
        }
      ],
    },
    games: {
      data: games,
      loading: gamesLoading,
      create: createGame,
      update: updateGame,
      delete: deleteGame,
      fields: [
        { name: "name", type: "text", label: "Name" },
        { name: "type", type: "select", label: "Type", options: ["PS", "VR"] },
        { name: "popularity_score", type: "number", label: "Popularity Score" },
        { name: "price", type: "number", label: "Price" },
        {
          name: "branch_id",
          type: "relation",
          label: "Branch",
          options: branches?.map(branch => ({
            value: branch.id,
            label: branch.name
          })) || []
        },
      ],
    },
    snacks: {
      data: snacks,
      loading: snacksLoading,
      create: createSnack,
      update: updateSnack,
      delete: deleteSnack,
      fields: [
        { name: "name", type: "text", label: "Name", placeholder: 'Snack Name' },
        { name: "type", type: "select", label: "Type", options: ["eatable", "drinkable"] },
        { name: "price", type: "number", label: "Price", placeholder: 'In Rs.' },
        { name: "quanity", type: "number", label: "Quantity", placeholder: 'In pcs.' },
        {
          name: "branch_id",
          type: "relation",
          label: "Branch",
          options: branches?.map(branch => ({
            value: branch.id,
            label: branch.name
          })) || []
        }
      ],
    },
  };

  return (
    <div className="container px-8 mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <div className="flex items-center gap-4">
          <DataFilter
            onBranchChange={setSelectedBranch}
          />
          {isAdminOrSuperAdmin && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add {getItemTypeSingular(activeTab)}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatsCard
          title="Low Stock"
          value={snackStats.lowStock}
          icon={AlertTriangle}
          className="bg-yellow-50"
        />
        <StatsCard
          title="Available Stock"
          value={snackStats.availableStock}
          icon={CheckCircle2}
          className="bg-green-50"
        />
        <StatsCard
          title="Empty Stock"
          value={snackStats.emptyStock}
          icon={XCircle}
          className="bg-red-50"
        />
      </div>

      <Tabs defaultValue="devices" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="snacks">Snacks</TabsTrigger>
        </TabsList>

        {Object.entries(collections).map(([key, collection]) => (
          <TabsContent key={key} value={key}>
            <InventoryTable
              data={filteredInventory[key]}
              loading={collection.loading}
              fields={collection.fields}
              onEdit={isAdminOrSuperAdmin ? setEditingItem : null}
              onDelete={isAdminOrSuperAdmin ? collection.delete : null}
              canModify={isAdminOrSuperAdmin}
              isReadOnly={isStaff}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Only render dialogs for Admin/SuperAdmin */}
      {isAdminOrSuperAdmin && (
        <>
          <AddItemDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            fields={collections[activeTab].fields}
            onSubmit={collections[activeTab].create}
            type={getItemTypeSingular(activeTab)}
          />

          <EditItemDialog
            open={!!editingItem}
            onOpenChange={(open) => !open && setEditingItem(null)}
            fields={collections[activeTab]?.fields}
            onSubmit={collections[activeTab]?.update}
            initialData={editingItem}
            type={getItemTypeSingular(activeTab)}
          />
        </>
      )}
    </div>
  );
}
