

"use client";

import { useEffect, useState } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const defaultConfig = {
  session_pricing: {
    single_player: { price_per_player: 120 },
    dual_players: { price_per_player: 70 },
    group_players: { price_per_player: 60 }
  },
  ggpoints_config: {
    reward_percentage: 6,
    points_to_rupee_ratio: 10
  },
  currency_symbol: "₹"
};

export default function Settings() {
  const { data: settings, loading, createItem, updateItem } = useCollection("settings");
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    const initializeSettings = async () => {
      if (settings?.length > 0) {
        // If settings exist, use them
        setConfig(settings[0]);
      } else {
        // If no settings exist, create default settings
        try {
          const newSettings = await createItem(defaultConfig);
          setConfig(newSettings);
        } catch (error) {
          console.error("Failed to create default settings:", error);
          toast.error("Failed to initialize settings");
        }
      }
    };

    if (!loading) {
      initializeSettings();
    }
  }, [settings, loading, createItem]);

  const handleSave = async () => {
    try {
      if (settings?.length > 0) {
        await updateItem(settings[0].id, config);
      } else {
        await createItem(config);
      }
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to update settings");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>

      <div className="grid gap-6">
        {/* Session Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle>Session Pricing</CardTitle>
            <CardDescription>Configure pricing for different player counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Single Player Price (per player)</Label>
              <div className="flex items-center gap-2">
                <span>{config.currency_symbol}</span>
                <Input
                  type="number"
                  value={config.session_pricing?.single_player?.price_per_player ?? 120}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      session_pricing: {
                        ...config.session_pricing,
                        single_player: {
                          ...config.session_pricing?.single_player,
                          price_per_player: Number(e.target.value)
                        }
                      }
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dual Players Price (per player)</Label>
              <div className="flex items-center gap-2">
                <span>{config.currency_symbol}</span>
                <Input
                  type="number"
                  value={config.session_pricing?.dual_players?.price_per_player ?? 70}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      session_pricing: {
                        ...config.session_pricing,
                        dual_players: {
                          ...config.session_pricing?.dual_players,
                          price_per_player: Number(e.target.value)
                        }
                      }
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Group Players Price (3+ players, per player)</Label>
              <div className="flex items-center gap-2">
                <span>{config.currency_symbol}</span>
                <Input
                  type="number"
                  value={config.session_pricing?.group_players?.price_per_player ?? 60}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      session_pricing: {
                        ...config.session_pricing,
                        group_players: {
                          ...config.session_pricing?.group_players,
                          price_per_player: Number(e.target.value)
                        }
                      }
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GG Points Card */}
        <Card>
          <CardHeader>
            <CardTitle>GG Points Configuration</CardTitle>
            <CardDescription>Configure GG Points reward system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reward Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={config.ggpoints_config?.reward_percentage ?? 6}
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
                <span>%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Points to Rupee Ratio</Label>
              <div className="flex flex-col justify-center items-start gap-2">
                <Input
                  type="number"
                  value={config.ggpoints_config?.points_to_rupee_ratio ?? 10}
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
                <span>{config?.ggpoints_config?.points_to_rupee_ratio} GGpoints = {config.currency_symbol}1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
