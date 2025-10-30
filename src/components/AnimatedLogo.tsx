import React, { useState } from 'react';

type Props = {
  src: string;
  size?: number;
};

const AnimatedLogo: React.FC<Props> = ({ src, size = 80 }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="mx-auto rounded-full bg-white/5 p-2 inline-flex items-center justify-center"
      style={{ width: size + 16, height: size + 16 }}
    >
      {!failed ? (
        <img
          src={src}
          alt="logo"
          style={{ width: size, height: size }}
          className="transform transition duration-700 ease-out"
          onError={(e) => {
            // mark failed so fallback UI is shown and log to console for debugging
            console.error('AnimatedLogo failed to load:', src, e);
            setFailed(true);
          }}
        />
      ) : (
        // simple fallback so the header isn't blank when the image fails
        <div
          className="flex items-center justify-center bg-gray-100 text-gfg-text-dark font-bold"
          style={{ width: size, height: size, borderRadius: size / 6 }}
        >
          ACM
        </div>
      )}
    </div>
  );
};

export default AnimatedLogo;
