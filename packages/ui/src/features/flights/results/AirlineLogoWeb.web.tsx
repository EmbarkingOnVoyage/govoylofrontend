import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import { AIRLINE_LOGO_XML } from '../../../assets/airlines/airlineLogos';

// Same order as the mobile AirlineLogo: the bundled brand mark, then the
// logo CDN keyed by IATA code, then a plain plane badge.
export const AirlineLogoWeb: React.FC<{ airlineCode: string; size?: number; className?: string }> = ({
  airlineCode,
  size = 28,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  const localXml = AIRLINE_LOGO_XML[airlineCode];
  const box = { width: size, height: size };

  if (localXml) {
    return (
      <span className={`inline-flex items-center justify-center rounded bg-white shrink-0 ${className}`} style={box}>
        <img
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(localXml)}`}
          alt=""
          className="w-[82%] h-[82%] object-contain"
        />
      </span>
    );
  }

  if (failed || !airlineCode) {
    return (
      <span className={`inline-flex items-center justify-center rounded bg-[#3B3F99] shrink-0 ${className}`} style={box}>
        <Plane size={size * 0.6} color="#FFFFFF" strokeWidth={2} />
      </span>
    );
  }

  return (
    <img
      src={`https://pics.avs.io/200/200/${airlineCode}.png`}
      alt=""
      className={`rounded bg-white object-contain shrink-0 ${className}`}
      style={box}
      onError={() => setFailed(true)}
    />
  );
};
