const { calculateUsageCost } = require('../src/services/rating.service');

describe('P17 Rating Engine & Integration Tests', () => {
  describe('calculateUsageCost Service', () => {
    it('should return 0 cost for free tier usage', () => {
      const tiers = [
        { upTo: 10000, unitPrice: 0 },
        { upTo: null, unitPrice: 0.005 }
      ];
      const cost = calculateUsageCost(5000, tiers);
      expect(cost).toBe(0);
    });

    it('should accurately calculate multi-tier usage costs', () => {
      const tiers = [
        { upTo: 10000, unitPrice: 0 },      // First 10k free
        { upTo: 50000, unitPrice: 0.001 },   // Next 40k @ $0.001
        { upTo: null, unitPrice: 0.005 }     // Remainder @ $0.005
      ];
      
      // 60,000 units = (10k * 0) + (40k * 0.001) + (10k * 0.005) = 0 + 40 + 50 = $90
      const cost = calculateUsageCost(60000, tiers);
      expect(cost).toBe(90);
    });
  });
});
