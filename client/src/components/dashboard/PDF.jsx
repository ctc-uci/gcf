import { useEffect, useState } from 'react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

import { MediaGrid } from '../media/MediaGrid';

const PDF = () => {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { backend } = useBackendContext();
  const [pdfs, setPdfs] = useState([]);
  const [programName, setProgramName] = useState('');

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const res = await backend.get(`/mediaChange/${userId}/pdf`);

        const transformedMedia = await Promise.all(
          res.data.media.map(async (media) => {
            const urlResponse = await backend.get(
              `/images/url/${encodeURIComponent(media.s3Key)}`
            );
            return {
              id: media.id,
              s3_key: media.s3Key,
              file_name: media.fileName,
              file_type: media.fileType,
              is_thumbnail: media.isThumbnail,
              imageUrl: urlResponse.data.url,
            };
          })
        );

        setPdfs(transformedMedia);
        setProgramName(res.data.programName);
      } catch (err) {
        console.error('Error saving uploaded files:', err);
      }
    };

    fetchPdfs();
  }, [userId, backend]);

  return (
    <MediaGrid
      mediaItems={pdfs}
      programName={programName}
    />
  );
};

export default PDF;
