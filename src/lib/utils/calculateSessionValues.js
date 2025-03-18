export function calculateSessionValues(numberOfPlayers, settings) {

  // Calculate session price based on device type
  const pricing = settings.sessions_pricing;
  let pricePerPlayer = 0;

  if (numberOfPlayers === 1 && pricing.single_player) {
    pricePerPlayer = pricing.single_player.price_per_player;
  } else if (numberOfPlayers === 2 && pricing.dual_players) {
    pricePerPlayer = pricing.dual_players.price_per_player;
  } else if (numberOfPlayers > 2 && pricing.group_players) {
    pricePerPlayer = pricing.group_players.price_per_player;
  }

  const totalAmount = pricePerPlayer * numberOfPlayers;

  return {
    totalAmount,
    pricePerPlayer
  };
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
