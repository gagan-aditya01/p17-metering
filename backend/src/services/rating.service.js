/**
 * Rating Service: Calculates cost of usage events based on plan pricing tiers
 */

exports.calculateUsageCost = (units, usageTiers = []) => {
  if (!units || units <= 0) return 0;
  if (!usageTiers || usageTiers.length === 0) return 0;

  let remainingUnits = units;
  let totalCost = 0;
  let previousLimit = 0;

  // Sort tiers by limit ascending
  const sortedTiers = [...usageTiers].sort((a, b) => {
    if (a.upTo === null) return 1;
    if (b.upTo === null) return -1;
    return a.upTo - b.upTo;
  });

  for (const tier of sortedTiers) {
    if (remainingUnits <= 0) break;

    const currentLimit = tier.upTo;
    let tierCapacity;

    if (currentLimit === null || currentLimit === undefined) {
      // Uncapped tier
      tierCapacity = remainingUnits;
    } else {
      tierCapacity = Math.max(0, currentLimit - previousLimit);
    }

    const unitsInThisTier = Math.min(remainingUnits, tierCapacity);
    totalCost += unitsInThisTier * tier.unitPrice;

    remainingUnits -= unitsInThisTier;
    if (currentLimit !== null) {
      previousLimit = currentLimit;
    }
  }

  // Round cost to 6 decimal places for precision
  return Math.round(totalCost * 1000000) / 1000000;
};
