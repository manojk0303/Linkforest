'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui';
import { Check } from 'lucide-react';

const includedFeatures = [
  'Unlimited links',
  'Full analytics (clicks, countries, devices, referrers)',
  'Full customization (themes, colors, fonts, custom CSS)',
  'No Linkforest branding',
  'Profile duplication & export',
];

export function FeatureComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Everything included</CardTitle>
        <CardDescription>Linkforest has one plan: $5/month for all features.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          {includedFeatures.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
