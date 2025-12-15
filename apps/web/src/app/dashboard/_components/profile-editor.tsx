'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { CheckCircle2, MoreHorizontal } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Switch,
  cn,
  toast,
} from '@acme/ui';

import {
  ProfilePreview,
  type PreviewLink,
  type PreviewProfile,
} from '@/components/profile-preview';
import { slugify } from '@/lib/slugs';
import type { ThemeSettings } from '@/lib/theme-settings';

import {
  archiveLinkAction,
  checkProfileSlugAvailabilityAction,
  createLinkAction,
  createProfileAction,
  duplicateProfileAction,
  exportProfileAction,
  reorderLinksAction,
  updateLinkAction,
  updateProfileAction,
} from '../actions';

import { IconPicker } from './icon-picker';
import { LinksDndList } from './links-dnd-list';

export type EditorProfile = {
  id: string;
  slug: string;
  displayName: string | null;
  bio: string | null;
  image: string | null;
  status: 'ACTIVE' | 'DISABLED';
  themeSettings: ThemeSettings;
};

export type EditorLink = {
  id: string;
  profileId: string;
  slug: string;
  title: string;
  url: string;
  position: number;
  status: 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
  metadata: Prisma.JsonValue;
};

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function downloadTextFile(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getLinkMetadata(link: Pick<EditorLink, 'metadata'>): Record<string, any> {
  if (!link.metadata || typeof link.metadata !== 'object') return {};
  return link.metadata as Record<string, any>;
}

function toLocalDatetimeValue(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function toISOStringOrUndefined(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function ProfileEditor({
  user,
  profiles,
  profile,
  links,
}: {
  user: { id: string; email: string; name: string | null };
  profiles: Array<{
    id: string;
    slug: string;
    displayName: string | null;
    image?: string | null;
    status: 'ACTIVE' | 'DISABLED';
  }>;
  profile: EditorProfile;
  links: EditorLink[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [profileState, setProfileState] = useState(profile);
  const [linksState, setLinksState] = useState<EditorLink[]>(links);

  const [switchingProfile, setSwitchingProfile] = useState(false);

  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkUrlTouched, setNewLinkUrlTouched] = useState(false);
  const [addingLink, setAddingLink] = useState(false);

  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [createName, setCreateName] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSlugStatus, setCreateSlugStatus] = useState<{
    loading: boolean;
    available: boolean | null;
    message: string | null;
  }>({ loading: false, available: null, message: null });

  const [duplicateName, setDuplicateName] = useState('');
  const [duplicateSlug, setDuplicateSlug] = useState('');
  const [duplicateSubmitting, setDuplicateSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [duplicateSlugStatus, setDuplicateSlugStatus] = useState<{
    loading: boolean;
    available: boolean | null;
    message: string | null;
  }>({ loading: false, available: null, message: null });

  const [exporting, setExporting] = useState(false);

  const isPublished = profileState.status === 'ACTIVE';
  const profilesUsedText = `${profiles.length}/5 profiles used`;
  const atProfileLimit = profiles.length >= 5;

  const newUrlValid = isValidHttpUrl(newLinkUrl.trim());

  const previewProfile: PreviewProfile = useMemo(
    () => ({
      slug: profileState.slug,
      displayName: profileState.displayName,
      bio: profileState.bio,
      image: profileState.image,
      themeSettings: profileState.themeSettings,
    }),
    [profileState],
  );

  const previewLinks: PreviewLink[] = useMemo(
    () =>
      linksState.map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        status: l.status,
        metadata: l.metadata,
      })),
    [linksState],
  );

  function updateProfileDraft(patch: Partial<EditorProfile>) {
    setProfileState((prev) => ({ ...prev, ...patch }));
  }

  function saveProfile(patch: Partial<EditorProfile>) {
    const optimistic = { ...profileState, ...patch };
    setProfileState(optimistic);

    startTransition(async () => {
      const result = await updateProfileAction(profile.id, {
        slug: optimistic.slug,
        displayName: optimistic.displayName,
        bio: optimistic.bio,
        image: optimistic.image,
        status: optimistic.status,
        themeSettings: optimistic.themeSettings,
      });

      if (!result.ok) {
        toast({
          title: 'Could not save profile',
          description: result.error,
          variant: 'destructive',
        });
        router.refresh();
      }
    });
  }

  async function handleCreateLink() {
    const title = newLinkTitle.trim();
    const url = newLinkUrl.trim();

    if (!title) return;

    if (!url || !isValidHttpUrl(url)) {
      setNewLinkUrlTouched(true);
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL (e.g., https://instagram.com/yourname)',
        variant: 'destructive',
      });
      return;
    }

    setAddingLink(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticLink: EditorLink = {
      id: tempId,
      profileId: profile.id,
      slug: 'temp',
      title,
      url,
      position: linksState.length,
      status: 'ACTIVE',
      metadata: {},
    };

    setLinksState((prev) => [...prev, optimisticLink]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkUrlTouched(false);

    const result = await createLinkAction({
      profileId: profile.id,
      title,
      url,
      status: 'ACTIVE',
      metadata: {},
    });

    if (!result.ok) {
      setLinksState((prev) => prev.filter((l) => l.id !== tempId));
      toast({ title: 'Could not add link', description: result.error, variant: 'destructive' });
      setAddingLink(false);
      return;
    }

    setLinksState((prev) => prev.map((l) => (l.id === tempId ? (result.link as any) : l)));
    setAddingLink(false);
    toast({ title: 'Link added', description: 'Your link has been saved.' });
    router.refresh();
  }

  function handleUpdateLink(linkId: string, patch: Partial<EditorLink>) {
    if (typeof patch.url === 'string' && patch.url && !isValidHttpUrl(patch.url.trim())) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL (e.g., https://instagram.com/yourname)',
        variant: 'destructive',
      });
      return;
    }

    setLinksState((prev) => prev.map((l) => (l.id === linkId ? { ...l, ...patch } : l)));

    startTransition(async () => {
      const result = await updateLinkAction(linkId, {
        title: patch.title,
        url: patch.url,
        status: patch.status,
        metadata: patch.metadata,
      });

      if (!result.ok) {
        toast({ title: 'Could not save link', description: result.error, variant: 'destructive' });
        router.refresh();
      }
    });
  }

  function handleArchiveLink(linkId: string) {
    const existing = linksState.find((l) => l.id === linkId);
    setLinksState((prev) => prev.filter((l) => l.id !== linkId));

    startTransition(async () => {
      const result = await archiveLinkAction(linkId);
      if (!result.ok) {
        toast({
          title: 'Could not delete link',
          description: result.error,
          variant: 'destructive',
        });
        if (existing)
          setLinksState((prev) => [...prev, existing].sort((a, b) => a.position - b.position));
        return;
      }

      toast({ title: 'Link deleted' });
      router.refresh();
    });
  }

  function handleReorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderLinksAction({
        profileId: profile.id,
        orderedLinkIds: orderedIds,
      });
      if (!result.ok) {
        toast({
          title: 'Could not reorder links',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  }

  function handleSwitchProfile(nextProfileId: string) {
    if (nextProfileId === profile.id) return;
    const next = profiles.find((p) => p.id === nextProfileId);

    setSwitchingProfile(true);
    toast({
      title: 'Switched profile',
      description: `Switched to ${next?.displayName || next?.slug || 'profile'}`,
    });

    window.location.href = `/dashboard?profile=${nextProfileId}`;
  }

  async function handleExport(format: 'links-csv' | 'full-json') {
    setExporting(true);
    try {
      const result = await exportProfileAction(profile.id, format);
      if (!result.ok) {
        toast({ title: 'Export failed', description: result.error, variant: 'destructive' });
        return;
      }

      downloadTextFile(result.content, result.mimeType, result.filename);
      toast({ title: 'Export started', description: 'Your download should begin immediately.' });
      setExportOpen(false);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    if (!createOpen) return;
    const fallbackName = user.name || user.email || 'My Profile';
    setCreateName('');
    setCreateSlug(slugify(fallbackName));
    setCreateError(null);
    setCreateSlugStatus({ loading: false, available: null, message: null });
  }, [createOpen, user.email, user.name]);

  useEffect(() => {
    if (!duplicateOpen) return;
    const baseName = profileState.displayName || profileState.slug;
    setDuplicateName(`${baseName} Copy`);
    setDuplicateSlug(`${profileState.slug}-copy`);
    setDuplicateError(null);
    setDuplicateSlugStatus({ loading: false, available: null, message: null });
  }, [duplicateOpen, profileState.displayName, profileState.slug]);

  useEffect(() => {
    if (!createOpen) return;
    const candidate = createSlug.trim();

    if (candidate.length < 2) {
      setCreateSlugStatus({ loading: false, available: null, message: null });
      return;
    }

    setCreateSlugStatus((prev) => ({ ...prev, loading: true }));
    const handle = setTimeout(async () => {
      const res = await checkProfileSlugAvailabilityAction(candidate);
      if (res.ok) {
        setCreateSlugStatus({ loading: false, available: res.available, message: res.message });
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [createSlug, createOpen]);

  useEffect(() => {
    if (!duplicateOpen) return;
    const candidate = duplicateSlug.trim();

    if (candidate.length < 2) {
      setDuplicateSlugStatus({ loading: false, available: null, message: null });
      return;
    }

    setDuplicateSlugStatus((prev) => ({ ...prev, loading: true }));
    const handle = setTimeout(async () => {
      const res = await checkProfileSlugAvailabilityAction(candidate);
      if (res.ok) {
        setDuplicateSlugStatus({ loading: false, available: res.available, message: res.message });
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [duplicateSlug, duplicateOpen]);

  async function submitCreateProfile() {
    setCreateSubmitting(true);
    setCreateError(null);

    try {
      const result = await createProfileAction({
        slug: createSlug.trim(),
        displayName: createName.trim() || undefined,
      });

      if (!result.ok) {
        const message = result.error || 'Could not create profile';
        setCreateError(message);
        toast({ title: 'Create profile failed', description: message, variant: 'destructive' });
        return;
      }

      toast({
        title: 'Profile created',
        description: `Profile created! You're now editing ${result.profile.displayName || result.profile.slug}.`,
      });

      setCreateOpen(false);
      router.push(`/dashboard?profile=${result.profile.id}`);
      router.refresh();
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function submitDuplicateProfile() {
    setDuplicateSubmitting(true);
    setDuplicateError(null);

    try {
      const result = await duplicateProfileAction(profile.id, {
        slug: duplicateSlug.trim(),
        displayName: duplicateName.trim() || undefined,
      });

      if (!result.ok) {
        const message = result.error || 'Could not duplicate profile';
        setDuplicateError(message);
        toast({ title: 'Duplicate failed', description: message, variant: 'destructive' });
        return;
      }

      toast({
        title: 'Profile duplicated',
        description: `Profile duplicated! You're now editing ${result.profile.displayName || result.profile.slug}.`,
      });

      setDuplicateOpen(false);
      setActionsOpen(false);
      router.push(`/dashboard?profile=${result.profile.id}`);
      router.refresh();
    } finally {
      setDuplicateSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Dialog: actions */}
      <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile actions</DialogTitle>
            <DialogDescription>Duplicate this profile or export your data.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button type="button" variant="outline" onClick={() => setDuplicateOpen(true)}>
              Duplicate This Profile
            </Button>
            <Button type="button" variant="outline" onClick={() => setExportOpen(true)}>
              Export Profile Data
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setActionsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>Profiles are limited to 5 per account.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {createError && <p className="text-destructive text-sm">{createError}</p>}

            <div className="space-y-1">
              <Label htmlFor="create-name">Profile name</Label>
              <Input
                id="create-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="My new profile"
                disabled={createSubmitting}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="create-slug">Username / slug</Label>
              <Input
                id="create-slug"
                value={createSlug}
                onChange={(e) => setCreateSlug(slugify(e.target.value))}
                placeholder="my-username"
                disabled={createSubmitting}
              />
              <div className="text-xs">
                {createSlugStatus.loading ? (
                  <span className="text-muted-foreground">Checking…</span>
                ) : createSlugStatus.available === true ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ {createSlugStatus.message}
                  </span>
                ) : createSlugStatus.available === false ? (
                  <span className="text-destructive">✗ {createSlugStatus.message}</span>
                ) : (
                  <span className="text-muted-foreground">
                    Username can only contain letters, numbers, and hyphens
                  </span>
                )}
              </div>
            </div>

            <div className="text-muted-foreground text-xs">{profilesUsedText}</div>

            {atProfileLimit && (
              <p className="text-destructive text-sm">Maximum 5 profiles reached</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitCreateProfile()}
              disabled={createSubmitting || atProfileLimit || createSlugStatus.available === false}
            >
              {createSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="text-current" /> Creating profile…
                </span>
              ) : (
                'Create profile'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: duplicate */}
      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate {profileState.displayName || profileState.slug}</DialogTitle>
            <DialogDescription>
              Duplicates links and design settings (not analytics).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {duplicateError && <p className="text-destructive text-sm">{duplicateError}</p>}

            <div className="space-y-1">
              <Label htmlFor="dup-name">New profile name</Label>
              <Input
                id="dup-name"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                disabled={duplicateSubmitting}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dup-slug">New username / slug</Label>
              <Input
                id="dup-slug"
                value={duplicateSlug}
                onChange={(e) => setDuplicateSlug(slugify(e.target.value))}
                disabled={duplicateSubmitting}
              />
              <div className="text-xs">
                {duplicateSlugStatus.loading ? (
                  <span className="text-muted-foreground">Checking…</span>
                ) : duplicateSlugStatus.available === true ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ {duplicateSlugStatus.message}
                  </span>
                ) : duplicateSlugStatus.available === false ? (
                  <span className="text-destructive">✗ {duplicateSlugStatus.message}</span>
                ) : null}
              </div>
            </div>

            <div className="text-muted-foreground text-xs">{profilesUsedText}</div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDuplicateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitDuplicateProfile()}
              disabled={
                duplicateSubmitting || atProfileLimit || duplicateSlugStatus.available === false
              }
            >
              {duplicateSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="text-current" /> Duplicating…
                </span>
              ) : (
                'Duplicate profile'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: export */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export options</DialogTitle>
            <DialogDescription>Download your data immediately.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={exporting}
              onClick={() => void handleExport('links-csv')}
            >
              {exporting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="text-current" /> Exporting…
                </span>
              ) : (
                'Export links only (CSV)'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={exporting}
              onClick={() => void handleExport('full-json')}
            >
              {exporting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="text-current" /> Exporting…
                </span>
              ) : (
                'Export full profile (JSON)'
              )}
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExportOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>
                  Select a profile, manage links, and publish when ready.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActionsOpen(true)}
                  disabled={switchingProfile}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="ml-2">Actions</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="space-y-1">
                <Label>Current profile</Label>
                <Select
                  value={profile.id}
                  onValueChange={handleSwitchProfile}
                  disabled={switchingProfile}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => {
                      const label = p.displayName || p.slug;
                      const initial = (label || 'P').slice(0, 1).toUpperCase();
                      return (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs',
                                p.id === profile.id && 'border-primary',
                              )}
                            >
                              {initial}
                            </span>
                            <span>
                              {label} {p.status === 'DISABLED' ? '(Draft)' : ''}
                            </span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <div className="text-muted-foreground text-xs">{profilesUsedText}</div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={isPublished ? 'default' : 'secondary'}
                  className={cn(
                    'justify-center',
                    isPublished
                      ? 'bg-green-600 text-white dark:bg-green-500'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {isPublished ? '🟢 Published' : '⚪ Draft'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="displayName">Profile name</Label>
                <Input
                  id="displayName"
                  value={profileState.displayName ?? ''}
                  onChange={(e) => updateProfileDraft({ displayName: e.target.value })}
                  onBlur={() => saveProfile({ displayName: profileState.displayName })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="slug">Username / slug</Label>
                <Input
                  id="slug"
                  value={profileState.slug}
                  onChange={(e) => updateProfileDraft({ slug: slugify(e.target.value) })}
                  onBlur={() => saveProfile({ slug: profileState.slug })}
                />
                <div className="text-muted-foreground text-xs">
                  Public URL: /{profileState.slug}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="border-input bg-background min-h-[96px] w-full rounded-md border px-3 py-2 text-sm"
                value={profileState.bio ?? ''}
                onChange={(e) => updateProfileDraft({ bio: e.target.value })}
                onBlur={() => saveProfile({ bio: profileState.bio })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="avatarUrl">Avatar Image URL</Label>
              <Input
                id="avatarUrl"
                value={profileState.image ?? ''}
                onChange={(e) => updateProfileDraft({ image: e.target.value })}
                onBlur={() =>
                  saveProfile({
                    image: profileState.image?.trim() ? profileState.image.trim() : null,
                  })
                }
                placeholder="Paste image URL (ImgBB, Imgur, etc.)"
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div>
                <div className="font-medium">Published</div>
                <div className="text-muted-foreground text-xs">
                  Turn off to hide your profile temporarily.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-xs font-medium',
                    isPublished ? 'text-green-600' : 'text-muted-foreground',
                  )}
                >
                  {isPublished ? 'Published' : 'Draft'}
                </span>
                <Switch
                  checked={isPublished}
                  onCheckedChange={(checked) => {
                    toast({
                      title: checked ? 'Profile published' : 'Profile set to draft',
                      description: checked
                        ? 'Your profile is now live.'
                        : 'Your profile is hidden (visitors will see a 404).',
                    });
                    saveProfile({ status: checked ? 'ACTIVE' : 'DISABLED' });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="links">
          <CardHeader>
            <CardTitle>📝 Manage Links</CardTitle>
            <CardDescription>Add, edit, reorder your links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="space-y-1">
                <Label htmlFor="newTitle">Title</Label>
                <Input
                  ref={titleInputRef}
                  id="newTitle"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Instagram"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="newUrl">URL</Label>
                <div className="relative">
                  <Input
                    id="newUrl"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onBlur={() => setNewLinkUrlTouched(true)}
                    placeholder="https://instagram.com/yourname"
                    className={cn(newLinkUrlTouched && !newUrlValid && 'border-destructive')}
                  />
                  {newLinkUrl.trim() && newUrlValid ? (
                    <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600 dark:text-green-400" />
                  ) : null}
                </div>
                {newLinkUrlTouched && newLinkUrl.trim() && !newUrlValid ? (
                  <p className="text-destructive text-xs">
                    Please enter a valid URL (e.g., https://instagram.com/yourname)
                  </p>
                ) : null}
              </div>

              <Button
                type="button"
                onClick={() => void handleCreateLink()}
                disabled={!newLinkTitle.trim() || !newLinkUrl.trim() || !newUrlValid || addingLink}
              >
                {addingLink ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="text-current" /> Adding…
                  </span>
                ) : (
                  'Add link'
                )}
              </Button>
            </div>

            {linksState.length === 0 ? (
              <div className="rounded-lg border p-6 text-center">
                <h3 className="text-lg font-semibold">Add your first link</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Example: “Instagram” → https://instagram.com/yourname
                </p>
                <Button
                  type="button"
                  className="mt-4"
                  onClick={() => titleInputRef.current?.focus()}
                >
                  Add your first link
                </Button>
              </div>
            ) : (
              <LinksDndList
                links={linksState}
                onLinksChange={setLinksState}
                onReorder={(orderedIds) => handleReorder(orderedIds)}
                renderLink={(link, { dragHandle, isDragging }) => {
                  const md = getLinkMetadata(link);
                  const schedule = md.schedule as
                    | { startsAt?: string; endsAt?: string }
                    | undefined;

                  return (
                    <div
                      className={cn(
                        'border-border bg-card rounded-lg border p-3',
                        isDragging && 'ring-ring ring-2',
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="pt-1">{dragHandle}</div>

                        <div className="grid flex-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label htmlFor={`title-${link.id}`}>Title</Label>
                            <Input
                              id={`title-${link.id}`}
                              value={link.title}
                              onChange={(e) =>
                                setLinksState((prev) =>
                                  prev.map((l) =>
                                    l.id === link.id ? { ...l, title: e.target.value } : l,
                                  ),
                                )
                              }
                              onBlur={() => handleUpdateLink(link.id, { title: link.title })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`url-${link.id}`}>URL</Label>
                            <Input
                              id={`url-${link.id}`}
                              value={link.url}
                              onChange={(e) =>
                                setLinksState((prev) =>
                                  prev.map((l) =>
                                    l.id === link.id ? { ...l, url: e.target.value } : l,
                                  ),
                                )
                              }
                              onBlur={() => handleUpdateLink(link.id, { url: link.url })}
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label htmlFor={`display-${link.id}`}>Display</Label>
                              <select
                                id={`display-${link.id}`}
                                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                                value={md.display || 'button'}
                                onChange={(e) => {
                                  const next = {
                                    ...md,
                                    display: e.target.value,
                                  };
                                  handleUpdateLink(link.id, { metadata: next as any });
                                }}
                              >
                                <option value="button">Button</option>
                                <option value="icon">Icon</option>
                              </select>
                            </div>
                            <IconPicker
                              id={`icon-${link.id}`}
                              value={md.icon}
                              onChange={(value) => {
                                const next = { ...md } as Record<string, any>;
                                if (value) {
                                  next.icon = value;
                                } else {
                                  delete next.icon;
                                }
                                handleUpdateLink(link.id, { metadata: next as any });
                              }}
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label htmlFor={`startsAt-${link.id}`}>Starts</Label>
                              <Input
                                id={`startsAt-${link.id}`}
                                type="datetime-local"
                                value={toLocalDatetimeValue(schedule?.startsAt)}
                                onChange={(e) => {
                                  const iso = toISOStringOrUndefined(e.target.value);
                                  const nextSchedule = { ...(schedule ?? {}) } as Record<
                                    string,
                                    any
                                  >;

                                  if (iso) {
                                    nextSchedule.startsAt = iso;
                                  } else {
                                    delete nextSchedule.startsAt;
                                  }

                                  const next = { ...md } as Record<string, any>;
                                  if (!nextSchedule.startsAt && !nextSchedule.endsAt) {
                                    delete next.schedule;
                                  } else {
                                    next.schedule = nextSchedule;
                                  }

                                  handleUpdateLink(link.id, { metadata: next as any });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`endsAt-${link.id}`}>Ends</Label>
                              <Input
                                id={`endsAt-${link.id}`}
                                type="datetime-local"
                                value={toLocalDatetimeValue(schedule?.endsAt)}
                                onChange={(e) => {
                                  const iso = toISOStringOrUndefined(e.target.value);
                                  const nextSchedule = { ...(schedule ?? {}) } as Record<
                                    string,
                                    any
                                  >;

                                  if (iso) {
                                    nextSchedule.endsAt = iso;
                                  } else {
                                    delete nextSchedule.endsAt;
                                  }

                                  const next = { ...md } as Record<string, any>;
                                  if (!nextSchedule.startsAt && !nextSchedule.endsAt) {
                                    delete next.schedule;
                                  } else {
                                    next.schedule = nextSchedule;
                                  }

                                  handleUpdateLink(link.id, { metadata: next as any });
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={link.status === 'ACTIVE'}
                              onChange={(e) =>
                                handleUpdateLink(link.id, {
                                  status: e.target.checked ? 'ACTIVE' : 'HIDDEN',
                                })
                              }
                            />
                            <span>Enabled</span>
                          </label>

                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleArchiveLink(link.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            )}

            <div className="text-muted-foreground text-xs">
              Tip: drag the handle to reorder links. Hidden links won’t show on your public page.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
            <CardDescription>Create up to 5 profiles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground text-sm">{profilesUsedText}</div>
            <Button type="button" onClick={() => setCreateOpen(true)} disabled={atProfileLimit}>
              + Create New Profile
            </Button>
          </CardContent>
          {atProfileLimit ? (
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm">Maximum 5 profiles reached</p>
            </CardContent>
          ) : null}
        </Card>

        {isPending ? (
          <div className="text-muted-foreground text-sm" aria-live="polite">
            Saving changes…
          </div>
        ) : null}
      </div>

      <div className="border-border bg-card rounded-lg border">
        <div className="border-border border-b p-3">
          <div className="text-sm font-medium">Live preview</div>
          <div className="text-muted-foreground text-xs">What your visitors see</div>
        </div>
        <div className="max-h-[calc(100vh-220px)] overflow-auto">
          <ProfilePreview
            profile={previewProfile}
            links={previewLinks}
            showQr
            className="min-h-0"
          />
        </div>
      </div>
    </div>
  );
}
