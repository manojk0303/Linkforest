'use client';

import { useState, type ReactNode } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

import { Button, cn } from '@acme/ui';

export function SplitViewEditor({
  editor,
  preview,
  className,
}: {
  editor: ReactNode;
  preview: ReactNode;
  className?: string;
}) {
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className={cn('grid gap-6 lg:grid-cols-5', className)}>
      <div className="lg:col-span-3">{editor}</div>

      <div className="lg:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-muted-foreground text-sm font-medium">Preview</div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={viewport === 'mobile' ? 'default' : 'outline'}
              onClick={() => setViewport('mobile')}
            >
              <Smartphone className="mr-1.5 h-4 w-4" />
              Mobile
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewport === 'desktop' ? 'default' : 'outline'}
              onClick={() => setViewport('desktop')}
            >
              <Monitor className="mr-1.5 h-4 w-4" />
              Desktop
            </Button>
          </div>
        </div>

        <div
          className={cn(
            'border-input bg-background overflow-hidden rounded-xl border p-4',
            viewport === 'mobile' ? 'mx-auto w-[375px] max-w-full' : 'w-full',
          )}
        >
          {preview}
        </div>
      </div>
    </div>
  );
}
