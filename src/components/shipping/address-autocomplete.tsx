"use client"

import { useEffect, useRef, useState } from "react"

type Suggestion = { id: string; label: string; coordinates: [number, number] }

export function AddressAutocomplete({ value, onChange, onSelect, placeholder }: { value: string; onChange: (value: string) => void; onSelect: (suggestion: Suggestion) => void; placeholder?: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    const query = value.trim()
    if (query.length < 3) { window.setTimeout(() => { setSuggestions([]); setOpen(false) }, 0); return }
    const id = ++requestId.current
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/maptiler/geocoding?q=${encodeURIComponent(query)}`, { signal: controller.signal, cache: "no-store" })
        if (!response.ok) throw new Error("Address search unavailable")
        const data = await response.json()
        if (id !== requestId.current) return
        setSuggestions((data.features ?? []).map((feature: { id: string; place_name?: string; text?: string; center?: [number, number] }) => ({ id: feature.id, label: feature.place_name ?? feature.text ?? query, coordinates: feature.center ?? [0, 0] })))
        setOpen(true)
      } catch { setSuggestions([]) }
    }, 280)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [value])

  return <div className="relative">
    <input value={value} onChange={(event) => onChange(event.target.value)} onFocus={() => suggestions.length > 0 && setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 150)} placeholder={placeholder} className="h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none focus:border-primary" />
    {open && suggestions.length > 0 && <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg">{suggestions.map((suggestion) => <button type="button" key={suggestion.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(suggestion.label); onSelect(suggestion); setOpen(false) }} className="block w-full px-3 py-2 text-left text-sm hover:bg-accent">{suggestion.label}</button>)}</div>}
  </div>
}
