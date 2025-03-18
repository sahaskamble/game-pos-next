'use client';

import { toast } from "sonner"
import { useCollection } from "@/lib/hooks/useCollection";

export function useSettingsInitialisation() {
  const { data, createItem } = useCollection("settings");

  const initialiseNewSettings = async ({ onSave = () => { } }) => {
    // implementation
  };

  const initialiseExistingSettings = async ({ type = 'SIM', branch_id }) => {
    try {
      console.log(branch_id, type);
      data.map((setting) => {
        console.log(setting.branch_id === branch_id && setting.type === type)
      })
      const existingSettings = data?.find((setting) =>
        setting.type === type && setting.branch_id === branch_id
      );

      if (!existingSettings) {
        const formData = { ...initialData, type, branch_id };
        await createItem(formData);
        toast.success('Settings initialized successfully');
        return;
      }
      toast.info('Settings already exist for this branch');
    } catch (error) {
      toast.error('Error initialising settings');
    }
  };

  return { initialiseNewSettings, initialiseExistingSettings };
}

const initialData = {
  currency_symbol: "₹",
  sessions_pricing: {
    single_player: {
      max_players: 1,
      min_players: 1,
      price_per_player: 100,
    },
    dual_players: {
      max_players: 2,
      min_players: 2,
      price_per_player: 50,
    },
    group_players: {
      max_players: 4,
      min_players: 3,
      price_per_player: 30,
    }
  },
  ggpoints_config: {
    reward_percentage: 10,
    points_to_rupee_ratio: 10
  },
}
