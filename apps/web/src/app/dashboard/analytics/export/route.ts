import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const profileId = searchParams.get('profile');
  const range = searchParams.get('range') || '7';
  const daysAgo = parseInt(range);

  if (!profileId) {
    return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({
    where: { id: profileId, userId: session.user.id, deletedAt: null },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const startDate =
    daysAgo === 0 ? new Date(0) : new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  const analytics = await prisma.analytics.findMany({
    where: {
      link: { profileId },
      clickedAt: { gte: startDate },
    },
    include: {
      link: {
        select: {
          title: true,
          url: true,
        },
      },
    },
    orderBy: { clickedAt: 'desc' },
  });

  const csvRows = [
    ['Date', 'Time', 'Link Title', 'Link URL', 'Country', 'Device Type', 'Referrer'].join(','),
  ];

  analytics.forEach((entry) => {
    const date = entry.clickedAt.toLocaleDateString();
    const time = entry.clickedAt.toLocaleTimeString();
    const title = `"${entry.link.title.replace(/"/g, '""')}"`;
    const url = `"${entry.link.url.replace(/"/g, '""')}"`;
    const country = entry.country || 'Unknown';
    const device = entry.deviceType;
    const referrer = entry.referrer ? `"${entry.referrer.replace(/"/g, '""')}"` : 'Direct';

    csvRows.push([date, time, title, url, country, device, referrer].join(','));
  });

  const csv = csvRows.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analytics-${profile.slug}-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
