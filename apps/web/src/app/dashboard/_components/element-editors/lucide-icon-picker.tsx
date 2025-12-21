'use client';

import { useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button, Input, cn } from '@acme/ui';

const ALL_ICON_NAMES = Object.keys(LucideIcons)
  .filter((name) => {
    const value = (LucideIcons as Record<string, unknown>)[name];
    return typeof value === 'function' && /^[A-Z]/.test(name);
  })
  .sort();

export function LucideIconPicker({
  value,
  onChange,
  className,
}: {
  value: string | null | undefined;
  onChange: (next: string | null) => void;
  className?: string;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICON_NAMES;
    return ALL_ICON_NAMES.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  const SelectedIcon = value
    ? (((LucideIcons as Record<string, unknown>)[value] as unknown) as LucideIcon)
    : null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Icon</div>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <div className={cn('border-input bg-background flex h-10 w-10 items-center justify-center rounded-md border')}>
          {SelectedIcon ? <SelectedIcon className="h-4 w-4" /> : <span className="text-xs opacity-60">None</span>}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons…"
        />
      </div>

      <div className="border-input bg-background max-h-64 overflow-auto rounded-md border p-2">
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          <button
            type="button"
            onClick={() => onChange(null)}
            className={cn(
              'hover:bg-accent flex h-10 w-10 items-center justify-center rounded-md border text-xs transition-colors',
              !value ? 'border-primary bg-primary/10' : 'border-transparent',
            )}
          >
            None
          </button>
          {filtered.map((name) => {
            const Icon = (LucideIcons as Record<string, unknown>)[name] as LucideIcon;
            const selected = name === value;

            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name)}
                title={name}
                className={cn(
                  'hover:bg-accent flex h-10 w-10 items-center justify-center rounded-md border transition-colors',
                  selected ? 'border-primary bg-primary/10' : 'border-transparent',
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
