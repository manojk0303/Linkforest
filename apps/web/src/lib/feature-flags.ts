export interface FeatureFlags {
  basicAnalytics: boolean;
  linkTracking: boolean;
  customDomains: boolean;
  advancedAnalytics: boolean;
  scheduledLinks: boolean;
  apiAccess: boolean;
  teamMembers: boolean;
  customBranding: boolean;
  dedicatedSupport: boolean;
  maxLinks: number;
}

// Linkforest has a single tier ($5/mo) and all features are included.
export const FULL_FEATURES: FeatureFlags = {
  basicAnalytics: true,
  linkTracking: true,
  customDomains: true,
  advancedAnalytics: true,
  scheduledLinks: true,
  apiAccess: true,
  teamMembers: true,
  customBranding: true,
  dedicatedSupport: true,
  maxLinks: -1, // unlimited
};

export function getFeatureFlags(): FeatureFlags {
  return FULL_FEATURES;
}

export function hasFeature(feature: keyof FeatureFlags): boolean {
  const value = FULL_FEATURES[feature];
  if (typeof value === 'boolean') return value;
  return value > 0;
}

export function canCreateLinks(currentCount: number): boolean {
  if (FULL_FEATURES.maxLinks === -1) return true;
  return currentCount < FULL_FEATURES.maxLinks;
}
