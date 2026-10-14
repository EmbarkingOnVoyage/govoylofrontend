import { useEffect, useState } from 'react';
import { AUTH_BASE_URL } from '@workspace/api';

// Airline marks are square SVGs by IATA code, served by the API at
// /airline-logos/<CODE>.svg (GoVoylo.Api/AirlineLogos — the same files the
// e-ticket PDF draws). A code with no file falls back to the plane badge.
export function airlineLogoUrl(airlineCode: string): string | null {
  const code = (airlineCode ?? '').trim().toUpperCase();
  return /^[A-Z0-9]{2}$/.test(code) ? `${AUTH_BASE_URL}/airline-logos/${code}.svg` : null;
}

// React Native has no <img> for SVG, so the mobile app fetches the markup and
// draws it with SvgXml. One request per airline for the app's lifetime, shared
// by every card showing it.
const logoXml = new Map<string, Promise<string | null>>();

function loadLogoXml(url: string): Promise<string | null> {
  let pending = logoXml.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((response) => (response.ok ? response.text() : null))
      .then((text) => (text && text.includes('<svg') ? text : null))
      .catch(() => {
        // A network blip shouldn't stick: let the next card try again.
        logoXml.delete(url);
        return null;
      });
    logoXml.set(url, pending);
  }
  return pending;
}

// undefined while loading, null when the airline has no logo.
export function useAirlineLogoXml(airlineCode: string): string | null | undefined {
  const url = airlineLogoUrl(airlineCode);
  const [xml, setXml] = useState<string | null | undefined>(url ? undefined : null);

  useEffect(() => {
    if (!url) {
      setXml(null);
      return;
    }
    let active = true;
    setXml(undefined);
    loadLogoXml(url).then((result) => {
      if (active) setXml(result);
    });
    return () => {
      active = false;
    };
  }, [url]);

  return xml;
}
