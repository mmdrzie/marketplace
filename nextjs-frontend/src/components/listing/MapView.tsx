'use client';

import { useEffect, useRef, useState } from 'react';

interface MapViewProps {
  address?: string;
  title?: string;
  lat?: number;
  lng?: number;
  className?: string;
}

export function MapView({ address, title, lat, lng, className }: MapViewProps) {
  const [L, setL] = useState<typeof import('leaflet') | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    (async () => {
      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      setL(() => leaflet);
    })();
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || instanceRef.current) return;

    const defaultLat = lat ?? 35.6892;
    const defaultLng = lng ?? 51.3890;
    const zoom = lat && lng ? 14 : 5;

    const map = L.map(mapRef.current, { zoomControl: false }).setView([defaultLat, defaultLng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    if (lat && lng) {
      const icon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 24 36" fill="none"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="var(--color-primary, #e05e2a)" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="white"/></svg>`,
        className: '',
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      });
      L.marker([lat, lng], { icon }).addTo(map);
    }

    mapRef.current?.querySelector('.leaflet-control-zoom')?.remove();
    instanceRef.current = map;

    return () => {
      map.remove();
      instanceRef.current = null;
    };
  }, [L, lat, lng]);

  return (
    <div className={`relative glass rounded-2xl overflow-hidden border border-border ${className || 'h-48 w-full'}`}>
      <div ref={mapRef} className="w-full h-full" />
      {(address || title) && (
        <div className="absolute bottom-3 right-3 left-3 z-[1000] bg-background/80 backdrop-blur-md rounded-xl px-3 py-2 border border-border/50 text-xs">
          {title && <p className="font-medium text-foreground truncate">{title}</p>}
          {address && <p className="text-muted-foreground text-[11px] truncate">{address}</p>}
        </div>
      )}
    </div>
  );
}
