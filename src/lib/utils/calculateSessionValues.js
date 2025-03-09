export function calculateSessionValues(numberOfPlayers, settings) {
  console.log("calculateSessionValues input:", { numberOfPlayers, settings });

  // Change session_pricing to sessions_pricing to match the settings object
  if (!settings?.sessions_pricing) {
    console.error("Pricing configuration is missing in settings");
    return {
      totalAmount: 0,
      ggPoints: 0,
      ggPointsValue: 0
    };
  }

  // Calculate session price
  const pricing = settings.sessions_pricing; // Changed from session_pricing to sessions_pricing
  let pricePerPlayer = 0;

  if (numberOfPlayers === 1 && pricing.single_player) {
    pricePerPlayer = pricing.single_player.price_per_player;
  } else if (numberOfPlayers === 2 && pricing.dual_players) {
    pricePerPlayer = pricing.dual_players.price_per_player;
  } else if (numberOfPlayers > 2 && pricing.group_players) {
    pricePerPlayer = pricing.group_players.price_per_player;
  }

  const totalAmount = pricePerPlayer * numberOfPlayers;

  // Calculate GG Points
  const ggConfig = settings.ggpoints_config;
  const ggPoints = Math.floor((totalAmount * (ggConfig?.reward_percentage || 0)) / 100);
  const ggPointsValue = Math.floor(ggPoints / (ggConfig?.points_to_rupee_ratio || 1));

  const result = {
    totalAmount,
    ggPoints,
    ggPointsValue
  };

  console.log("calculateSessionValues result:", result);
  return result;
}

export function calculateSessionClosePrice({ ggPoints, settings, total_amount }) {
  // Calculate GG Points
  const ggConfig = settings.ggpoints_config;
  const maxGGPriceToBeUsed = (total_amount * (ggConfig?.points_to_rupee_ratio || 1)) * 0.5;
  const ggPrice = Math.floor(ggPoints / (ggConfig?.points_to_rupee_ratio || 1));
  return {
    ggPrice,
    maxGGPriceToBeUsed
  }
}
