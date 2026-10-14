import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import { airlineLogoUrl } from '../../../assets/airlines/airlineLogos';

// The airline's square mark from the API (see airlineLogos.ts), or a plain
// plane badge when there's none for the code.
export const AirlineLogoWeb: React.FC<{ airlineCode: string; size?: number; className?: string }> = ({
  airlineCode,
  size = 28,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  const url = airlineLogoUrl(airlineCode);
  const box = { width: size, height: size };

  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        className={`rounded-[1.6px] object-contain shrink-0 ${className}`}
        style={box}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={`inline-flex items-center justify-center rounded-[1.6px] bg-[#3A469D] shrink-0 ${className}`} style={box}>
      <Plane size={size * 0.6} color="#FFFFFF" strokeWidth={2} />
    </span>
  );
};
