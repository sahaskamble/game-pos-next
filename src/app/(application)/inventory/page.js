"use client";

import { useState } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { AddItemDialog } from "@/components/inventory/AddItemDialog";
import { EditItemDialog } from "@/components/inventory/EditItemDialog";
import { useAuth } from "@/lib/context/AuthContext";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("devices");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { user } = useAuth();

  const isAdminOrSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

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
        { name: "game_avatar", type: "file", label: "Game Avatar", maxSelect: 1 }
      ],
    },
    snacks: {
      data: snacks,
      loading: snacksLoading,
      create: createSnack,
      update: updateSnack,
      delete: deleteSnack,
      fields: [
        { name: "name", type: "text", label: "Name" },
        { name: "type", type: "select", label: "Type", options: ["eatable", "drinkable"] },
        { name: "price", type: "number", label: "Price" },
        { name: "quanity", type: "number", label: "Quantity" },
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
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        {isAdminOrSuperAdmin && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add {getItemTypeSingular(activeTab)}
          </Button>
        )}
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
              data={collection.data}
              loading={collection.loading}
              fields={collection.fields}
              onEdit={isAdminOrSuperAdmin ? setEditingItem : null}
              onDelete={isAdminOrSuperAdmin ? collection.delete : null}
              canModify={isAdminOrSuperAdmin}
            />
          </TabsContent>
        ))}
      </Tabs>

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
