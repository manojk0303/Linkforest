'use client';

import { Input, Label } from '@acme/ui';

function normalizeHex(input: string) {
  const value = input.trim();
  if (!value) return '';
  if (value.startsWith('#')) return value;
  return `#${value}`;
}

export function ColorInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string | null | undefined;
  onChange: (next: string | null) => void;
}) {
  const normalized = value ? normalizeHex(value) : '';

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={`${id}-picker`}
          type="color"
          value={normalized || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 p-1"
        />
        <Input
          id={id}
          value={normalized}
          onChange={(e) => {
            const next = e.target.value;
            onChange(next.trim() ? normalizeHex(next) : null);
          }}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
