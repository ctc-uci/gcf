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
  if (!userId) return;

  const fetchPdfs = async () => {
    console.log('userId:', userId);
    console.log('url:', `/fileChanges/${userId}/files`);
    try {
      const res = await backend.get(`/fileChanges/${userId}/files`);

        if (!res) return;

        const transformedFiles = await Promise.all(
          res.data.files.map(async (file) => {
            const urlResponse = await backend.get(
              `/images/url/${encodeURIComponent(file.s3Key)}`
            );

            if (!urlResponse) return;

            return {
              id: file.id,
              s3_key: file.s3Key,
              file_name: file.fileName,
              file_type: file.fileType,
              imageUrl: urlResponse.data.url,
            };
          })
        );

        setPdfs(transformedFiles);
        setProgramName(res.data.programName);
      } catch (err) {
        console.error('Error fetching PDFs:', err);
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