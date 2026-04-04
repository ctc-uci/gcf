import { useEffect, useState } from 'react';

import { Image } from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

export function DirectorAvatar({ picture, name = '', boxSize = '36px' }) {
  const { backend } = useBackendContext();
  const [src, setSrc] = useState(DEFAULT_PROFILE_IMAGE);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!picture || String(picture).trim() === '') {
        if (!cancelled) setSrc(DEFAULT_PROFILE_IMAGE);
        return;
      }
      try {
        const urlResponse = await backend.get(
          `/images/url/${encodeURIComponent(picture)}`
        );
        const url = urlResponse.data?.url;
        if (!cancelled)
          setSrc(
            url && String(url).trim() !== '' ? url : DEFAULT_PROFILE_IMAGE
          );
      } catch {
        if (!cancelled) setSrc(DEFAULT_PROFILE_IMAGE);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [picture, backend]);

  const displayName = `${name}`.trim() || 'Director';

  return (
    <Image
      src={src}
      alt={displayName}
      fallbackSrc={DEFAULT_PROFILE_IMAGE}
      boxSize={boxSize}
      borderRadius="full"
      objectFit="cover"
      flexShrink={0}
    />
  );
}
