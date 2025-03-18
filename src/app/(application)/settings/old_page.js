"use client";

import { useState, useEffect } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, AlertTriangle } from "lucide-react";

export default function Settings() {
  const { data: settings, loading, createItem, updateItem } = useCollection("settings");
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (settings && settings.length > 0) {
      setConfig(settings[0]);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      if (!config) {
        return;
      }

      if (settings?.length > 0) {
        // Update existing settings
        await updateItem(settings[0].id, config);
        toast.success("Settings updated successfully");
      } else {
        // Create new settings
        await createItem(config);
        toast.success("Settings created successfully");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const initializeNewSettings = () => {
    setConfig({
      session_pricing: {
        ps: {
          single_player: { price_per_player: 0 },
          dual_players: { price_per_player: 0 },
          group_players: { price_per_player: 0 }
        },
        car_simulator: {
          single_player: { price_per_player: 0 },
          dual_players: { price_per_player: 0 },
          group_players: { price_per_player: 0 }
        }
      },
      ggpoints_config: {
        reward_percentage: 0,
        points_to_rupee_ratio: 0
      },
      currency_symbol: "₹"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="container max-w-5xl mx-auto p-8">
        <Card className="text-center p-8">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
            <CardTitle>No Settings Found</CardTitle>
            <CardDescription>
              You need to initialize settings for your application to work properly.
            </CardDescription>
            <Button onClick={initializeNewSettings} className="mt-4">
              Initialize Settings
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const PriceInput = ({ value, onChange, label }) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{config.currency_symbol}</span>
        <Input
          type="number"
          value={value}
          onChange={onChange}
          className="max-w-[200px]"
        />
      </div>
    </div>
  );

  return (
    <div className="container max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Settings</h2>
        <Button onClick={handleSave} className="gap-2">
          <Save size={16} />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-8">
        {/* PS Session Pricing Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle>PlayStation Session Pricing</CardTitle>
            <CardDescription>Set pricing tiers for PlayStation gaming sessions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-6">
            <PriceInput
              label="Single Player Price"
              value={config.session_pricing?.ps?.single_player?.price_per_player ?? 0}
              onChange={(e) =>
                setConfig({
                  ...config,
                  session_pricing: {
                    ...config.session_pricing,
                    ps: {
                      ...config.session_pricing?.ps,
                      single_player: { price_per_player: Number(e.target.value) }
                    }
                  }
                })
              }
            />
            <PriceInput
              label="Dual Players Price (per player)"
              value={config.session_pricing?.ps?.dual_players?.price_per_player ?? 0}
              onChange={(e) =>
                setConfig({
                  ...config,
                  session_pricing: {
                    ...config.session_pricing,
                    ps: {
                      ...config.session_pricing?.ps,
                      dual_players: { price_per_player: Number(e.target.value) }
                    }
                  }
                })
              }
            />
            <PriceInput
              label="Group Players Price (3+ players)"
              value={config.session_pricing?.ps?.group_players?.price_per_player ?? 0}
              onChange={(e) =>
                setConfig({
                  ...config,
                  session_pricing: {
                    ...config.session_pricing,
                    ps: {
                      ...config.session_pricing?.ps,
                      group_players: { price_per_player: Number(e.target.value) }
                    }
                  }
                })
              }
            />
          </CardContent>
        </Card>

        {/* Car Simulator Pricing Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle>Car Simulator Pricing</CardTitle>
            <CardDescription>Set pricing tiers for Car Simulator sessions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-6">
            <PriceInput
              label="Single Player Price"
              value={config.session_pricing?.car_simulator?.single_player?.price_per_player ?? 0}
              onChange={(e) =>
                setConfig({
                  ...config,
                  session_pricing: {
                    ...config.session_pricing,
                    car_simulator: {
                      ...config.session_pricing?.car_simulator,
                      single_player: { price_per_player: Number(e.target.value) }
                    }
                  }
                })
              }
            />
            <PriceInput
              label="Dual Players Price (per player)"
              value={config.session_pricing?.car_simulator?.dual_players?.price_per_player ?? 0}
              onChange={(e) =>
                setConfig({
                  ...config,
                  session_pricing: {
                    ...config.session_pricing,
                    car_simulator: {
                      ...config.session_pricing?.car_simulator,
                      dual_players: { price_per_player: Number(e.target.value) }
                    }
                  }
                })
              }
            />
            <PriceInput
              label="Group Players Price (3+ players)"
              value={config.session_pricing?.car_simulator?.group_players?.price_per_player ?? 0}
              onChange={(e) =>
                setConfig({
                  ...config,
                  session_pricing: {
                    ...config.session_pricing,
                    car_simulator: {
                      ...config.session_pricing?.car_simulator,
                      group_players: { price_per_player: Number(e.target.value) }
                    }
                  }
                })
              }
            />
          </CardContent>
        </Card>

        {/* GG Points Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle>GG Points Configuration</CardTitle>
            <CardDescription>Configure reward points and conversion rates</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Reward Percentage</Label>
              <div className="flex items-center gap-2 max-w-[200px]">
                <Input
                  type="number"
                  value={config.ggpoints_config?.reward_percentage ?? 0}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ggpoints_config: {
                        ...config.ggpoints_config,
                        reward_percentage: Number(e.target.value)
                      }
                    })
                  }
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Points to Rupee Ratio</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  className="max-w-[200px]"
                  value={config.ggpoints_config?.points_to_rupee_ratio ?? 0}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ggpoints_config: {
                        ...config.ggpoints_config,
                        points_to_rupee_ratio: Number(e.target.value)
                      }
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  {config?.ggpoints_config?.points_to_rupee_ratio} GGpoints = {config.currency_symbol}1
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
