'use client';

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceInput } from './PriceInput';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSettingsInitialisation } from './initialiseSettings';

export default function SimulatorSettings({ settings, updateSettings = () => { }, branchId } = {}) {
  const [formData, setFormData] = useState({
    single: 0,
    duo: 0,
    group: 0,
    rewardPercentage: 0,
    priceConversion: 0,
  });
  const [isExists, setIsExists] = useState(false);
  const { initialiseExistingSettings } = useSettingsInitialisation();

  useEffect(() => {
    if (settings) {
      setIsExists(true);
      setFormData({
        single: settings?.sessions_pricing?.single_player?.price_per_player ?? 10,
        duo: settings?.sessions_pricing?.dual_players?.price_per_player ?? 0,
        group: settings?.sessions_pricing?.group_players?.price_per_player ?? 0,
        rewardPercentage: settings?.ggpoints_config?.reward_percentage ?? 0,
        priceConversion: settings?.ggpoints_config?.points_to_rupee_ratio ?? 0,
      });
    } else {
      setIsExists(false);
    }
  }, [settings]);

  const handleUpdate = async () => {
    try {
      if (!settings?.id) {
        toast.error('Settings Not Found, initialise first');
        return;
      }

      const updatedData = {
        ...settings,
        branch_id: branchId,
        sessions_pricing: {  // Changed from session_pricing to sessions_pricing
          single_player: {
            max_players: 1,
            min_players: 1,
            price_per_player: Number(formData?.single) || 0,
          },
          dual_players: {
            max_players: 2,
            min_players: 2,
            price_per_player: Number(formData?.duo) || 0,
          },
          group_players: {
            max_players: 4,
            min_players: 3,
            price_per_player: Number(formData?.group) || 0,
          }
        },
        ggpoints_config: {
          reward_percentage: Number(formData?.rewardPercentage) || 0,
          points_to_rupee_ratio: Number(formData?.priceConversion) || 0
        },
      };

      updateSettings(settings.id, updatedData);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Error making changes. Please try again later');
    }
  };

  if (!isExists) {
    return (
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle>Simulator Session Pricing</CardTitle>
          <CardDescription>
            No Settings found, You need to initialize settings for your application to work properly.
          </CardDescription>
        </CardHeader>
        <Button
          onClick={() => initialiseExistingSettings({ type: 'SIM', branch_id: branchId })}
          className="m-4"
        >
          Initialize Settings
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      {/* Pricings */}
      <CardHeader className="bg-muted/50">
        <CardTitle>Simulator Session Pricing</CardTitle>
        <CardDescription>Set pricing tiers for Simulator gaming sessions</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 p-6">
        <PriceInput
          label="Single Player Price"
          value={formData.single}
          onChange={(e) => setFormData({ ...formData, single: e.target.value })}
        />
        <PriceInput
          label="Dual Players Price (per player)"
          value={formData.duo}
          onChange={(e) => setFormData({ ...formData, duo: e.target.value })}
        />
        <PriceInput
          label="Group Players Price (2+ players)"
          value={formData.group}
          onChange={(e) => setFormData({ ...formData, group: e.target.value })}
        />
      </CardContent>

      {/* GG Points Settings */}
      <CardHeader className="bg-muted/50">
        <CardTitle>GG Points Configuration</CardTitle>
        <CardDescription>Configure reward points and conversion rates</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 p-6">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Reward Percentage</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">%</span>
            <Input
              type="number"
              value={formData.rewardPercentage}
              onChange={(e) => setFormData({ ...formData, rewardPercentage: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Points to Rupee Ratio</Label>
          <div className="space-y-2">
            <Input
              type="number"
              value={formData.priceConversion}
              onChange={(e) => setFormData({ ...formData, priceConversion: e.target.value })}
            />
            {
              settings?.ggpoints_config && (
                <p className="text-sm text-muted-foreground">
                  {settings?.ggpoints_config?.points_to_rupee_ratio} GGpoints = {settings.currency_symbol}1
                </p>
              )
            }
          </div>
        </div>
      </CardContent>


      <Button onClick={handleUpdate} className="gap-2 m-4">
        <Save size={16} />
        Save Changes
      </Button>
    </Card>
  )
};
