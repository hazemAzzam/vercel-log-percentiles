import type * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Filters } from '@/domain/types'
import { ALL_NAMESPACES, WINDOW_LABELS, type TimeWindow } from './useFilters'

const field = 'h-9 rounded-[10px] border-control text-[13px]'

export function FiltersBar({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center gap-2.5', className)} {...props} />
}

export function FiltersSearch({
  value,
  onChange,
  className,
  ...props
}: { value: string; onChange: (v: string) => void } & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'>) {
  return (
    <div>
      <label htmlFor="endpoint-search" className="sr-only">Search endpoints</label>
      <Input
        id="endpoint-search"
        type="search"
        placeholder="Search endpoints"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(field, 'w-[200px] bg-field px-3 md:text-[13px]', className)}
        {...props}
      />
    </div>
  )
}

export function FiltersSource({
  value,
  onChange,
  className,
  ...props
}: { value: Filters['source']; onChange: (v: Filters['source']) => void } & Omit<React.ComponentProps<typeof ToggleGroup>, 'value' | 'onValueChange' | 'onChange'>) {
  const items: [Filters['source'], string][] = [['all', 'All'], ['app', 'App'], ['vercel', 'Vercel']]
  return (
    <ToggleGroup
      aria-label="Source"
      value={[value]}
      onValueChange={(v) => v[0] && onChange(v[0] as Filters['source'])}
      spacing={0}
      className={cn('h-9 gap-0 rounded-[10px] bg-track p-[3px]', className)}
      {...props}
    >
      {items.map(([id, label]) => (
        <ToggleGroupItem
          key={id}
          value={id}
          className="h-full rounded-[7px] px-3 text-[13px] hover:bg-transparent aria-pressed:bg-ink aria-pressed:text-on-ink data-[pressed]:bg-ink data-[pressed]:text-on-ink"
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

type SelectTriggerProps = Omit<React.ComponentProps<typeof SelectTrigger>, 'value' | 'onChange'>

function FilterSelect({
  label, value, items, onChange, className, ...props
}: { label: string; value: string; items: Record<string, string>; onChange: (v: string) => void } & SelectTriggerProps) {
  return (
    <Select value={value} items={items} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger aria-label={label} className={cn(field, 'bg-surface', className)} {...props}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {Object.entries(items).map(([v, l]) => (
          <SelectItem key={v} value={v}>{l}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function FiltersNamespace({
  value, namespaces, onChange, ...props
}: { value: string; namespaces: readonly string[]; onChange: (v: string) => void } & SelectTriggerProps) {
  const items = { [ALL_NAMESPACES]: 'All namespaces', ...Object.fromEntries(namespaces.map((n) => [n, n])) }
  return <FilterSelect label="Namespace" value={value} items={items} onChange={onChange} {...props} />
}

export function FiltersWindow({
  value, onChange, ...props
}: { value: TimeWindow; onChange: (v: TimeWindow) => void } & SelectTriggerProps) {
  return <FilterSelect label="Time window" value={value} items={WINDOW_LABELS} onChange={(v) => onChange(v as TimeWindow)} {...props} />
}
