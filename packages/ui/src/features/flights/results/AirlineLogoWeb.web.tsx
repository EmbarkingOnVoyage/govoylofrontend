import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import { AIRLINE_LOGO_XML } from '../../../assets/airlines/airlineLogos';

// Figma shows square airline marks, so the web tries the logo CDN's square
// mark first, then the bundled brand wordmark, then a plain plane badge.
export const AirlineLogoWeb: React.FC<{ airlineCode: string; size?: number; className?: string }> = ({
  airlineCode,
  size = 28,
  className = '',
}) => {
  const [cdnFailed, setCdnFailed] = useState(false);
  const localXml = AIRLINE_LOGO_XML[airlineCode];
  const box = { width: size, height: size };

  if (airlineCode && !cdnFailed) {
    return (
      <img
        src={`https://pics.avs.io/200/200/${airlineCode}.png`}
        alt=""
        className={`rounded-[1.6px] bg-white object-contain shrink-0 ${className}`}
        style={box}
        onError={() => setCdnFailed(true)}
      />
    );
  }

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

  return (
    <span className={`inline-flex items-center justify-center rounded-[1.6px] bg-[#3A469D] shrink-0 ${className}`} style={box}>
      <Plane size={size * 0.6} color="#FFFFFF" strokeWidth={2} />
    </span>
  );
};
