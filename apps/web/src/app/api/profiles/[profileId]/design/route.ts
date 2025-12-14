import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { profileId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.profile.findFirst({
    where: {
      id: params.profileId,
      userId: session.user.id,
      deletedAt: null,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const body = await request.json();
  const { themeSettings, image } = body;

  const updated = await prisma.profile.update({
    where: { id: params.profileId },
    data: {
      themeSettings: themeSettings || {},
      image: image || null,
    },
  });

  return NextResponse.json({ success: true, profile: updated });
}
