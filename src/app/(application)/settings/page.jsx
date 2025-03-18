"use client";

import { useState, useEffect } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaystationSettings from "./components/PlaystationSettings";
import SimulatorSettings from "./components/SimulatorSettings";
import DataFilter from "@/components/superAdmin/DataFilter";

export default function Settings() {
  const { data: settings, loading, updateItem } = useCollection("settings");

  const [selectedBranch, setSelectedBranch] = useState('');
  const [playstationSettings, setPlaystationSettings] = useState();
  const [simulatorSettings, setSimulatorSettings] = useState();

  useEffect(() => {
    if (settings) {
      let filtered = [...settings];
      // Apply branch filter if selected
      if (selectedBranch) {
        filtered = filtered.filter(setting => setting.branch_id === selectedBranch);
      }
      setPlaystationSettings(filtered?.find((setting) => setting?.type === 'PS') || null);
      setSimulatorSettings(filtered?.find((setting) => setting?.type === 'SIM') || null);

    }
  }, [settings, selectedBranch]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings && !loading) {
    return (
      <div className="container max-w-5xl mx-auto p-8">
        <Card className="text-center p-8">
          <Button onClick={initializeNewSettings}>Initialize Settings</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Settings</h2>
        <DataFilter
          onBranchChange={setSelectedBranch}
        />
      </div>

      <Tabs className="w-full">
        <TabsList>
          <TabsTrigger value="playstation">Playstation Pricing</TabsTrigger>
          <TabsTrigger value="car_simulator">Simulator Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="playstation">
          {
            selectedBranch ? (
              <PlaystationSettings
                settings={playstationSettings}
                updateSettings={updateItem}
                branchId={selectedBranch}
              />
            ) : (
              <Card>
                <CardHeader className='text-destructive'>Please select a branch before entering</CardHeader>
              </Card>
            )
          }
        </TabsContent>
        <TabsContent value="car_simulator">
          {
            selectedBranch ? (
              <SimulatorSettings
                settings={simulatorSettings}
                updateSettings={updateItem}
                branchId={selectedBranch}
              />
            ) : (
              <Card>
                <CardHeader className='text-destructive'>Please select a branch before entering</CardHeader>
              </Card>
            )
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}
