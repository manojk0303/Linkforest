import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { AnalyticsCharts } from './_components/analytics-charts';
import { TopLinks } from './_components/top-links';
import { GeographicBreakdown } from './_components/geographic-breakdown';
import { DeviceBreakdown } from './_components/device-breakdown';
import { ReferrerSources } from './_components/referrer-sources';
import { DateRangeSelector } from './_components/date-range-selector';

interface AnalyticsPageProps {
  searchParams: { range?: string; profile?: string };
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const user = await requireAuth();
  const range = searchParams.range || '7';
  const daysAgo = parseInt(range);

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      slug: true,
      displayName: true,
    },
  });

  const selectedProfileId =
    searchParams.profile && profiles.some((p) => p.id === searchParams.profile)
      ? searchParams.profile
      : profiles[0]?.id;

  if (!selectedProfileId || !profiles.length) {
    return (
      <div className="space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Analytics', href: '/dashboard/analytics' },
          ]}
        />
        <div className="text-center">
          <h1 className="text-3xl font-bold">No profiles found</h1>
          <p className="text-muted-foreground mt-2">Create a profile to view analytics</p>
        </div>
      </div>
    );
  }

  const startDate =
    daysAgo === 0 ? new Date(0) : new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  const [totalClicks, analytics, topLinks, countries, devices, referrers] = await Promise.all([
    prisma.analytics.count({
      where: {
        link: { profileId: selectedProfileId },
        clickedAt: { gte: startDate },
      },
    }),
    prisma.analytics.findMany({
      where: {
        link: { profileId: selectedProfileId },
        clickedAt: { gte: startDate },
      },
      orderBy: { clickedAt: 'asc' },
      select: {
        clickedAt: true,
      },
    }),
    prisma.analytics.groupBy({
      by: ['linkId'],
      where: {
        link: { profileId: selectedProfileId },
        clickedAt: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.analytics.groupBy({
      by: ['country'],
      where: {
        link: { profileId: selectedProfileId },
        clickedAt: { gte: startDate },
        country: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.analytics.groupBy({
      by: ['deviceType'],
      where: {
        link: { profileId: selectedProfileId },
        clickedAt: { gte: startDate },
      },
      _count: { id: true },
    }),
    prisma.analytics.groupBy({
      by: ['referrer'],
      where: {
        link: { profileId: selectedProfileId },
        clickedAt: { gte: startDate },
        referrer: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ]);

  const linkIds = topLinks.map((l) => l.linkId);
  const links = await prisma.link.findMany({
    where: { id: { in: linkIds } },
    select: { id: true, title: true, url: true },
  });

  const topLinksData = topLinks.map((tl) => {
    const link = links.find((l) => l.id === tl.linkId);
    return {
      id: tl.linkId,
      title: link?.title || 'Unknown',
      url: link?.url || '#',
      clicks: tl._count.id,
    };
  });

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Analytics', href: '/dashboard/analytics' },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your link performance and audience insights</p>
        </div>
        <div className="flex gap-2">
          <DateRangeSelector currentRange={range} profileId={selectedProfileId} />
          <Button variant="outline" asChild>
            <a href={`/dashboard/analytics/export?profile=${selectedProfileId}&range=${range}`}>
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Clicks</CardTitle>
          <CardDescription>{daysAgo === 0 ? 'All time' : `Last ${daysAgo} days`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalClicks.toLocaleString()}</div>
        </CardContent>
      </Card>

      <AnalyticsCharts analytics={analytics} range={daysAgo} />

      <div className="grid gap-6 md:grid-cols-2">
        <TopLinks links={topLinksData} />
        <GeographicBreakdown countries={countries} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DeviceBreakdown devices={devices} />
        <ReferrerSources referrers={referrers} />
      </div>
    </div>
  );
}
