import { useEffect, useState } from 'react';

import { Center, Spinner } from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';

import { MediaUpdatesTable } from './MediaUpdatesTable';
import { ProgramUpdatesTable } from './ProgramUpdatesTable';

export const UpdatesPage = () => {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role } = useRoleContext();
  const { backend } = useBackendContext();

  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [originalMediaUpdatesData, setOriginalMediaUpdatesData] = useState([]);
  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  const [originalProgramUpdatesData, setOriginalProgramUpdatesData] = useState(
    []
  );

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (path) => {
    try {
      const response = await backend.get(`/update-permissions/${path}`);
      return response.data;
    } catch (error) {
      console.error(
        'Request failed:',
        path,
        error.response?.status,
        error.message
      );
      return [];
    }
  };

  useEffect(() => {
    if (!userId || !backend) {
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [mediaUpdates, programUpdates] =
          await Promise.all([
            fetchData(`media-updates/${userId}`),
            fetchData(`program-updates/${userId}`),
          ]);
        const mappedMedia = mediaUpdates.map(item => ({
          ...item,
          fullName: `${item.firstName} ${item.lastName}`,
        }));

        const mappedProgram = programUpdates.map(item => ({
          ...item,
          fullName: `${item.firstName} ${item.lastName}`,
        }));

        setOriginalMediaUpdatesData(mappedMedia);
        setMediaUpdatesData(mappedMedia);
        setProgramUpdatesData(mappedProgram);
        setOriginalProgramUpdatesData(mappedProgram);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId, backend]);

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="gray.500" />
      </Center>
    );
  }

  return (
    <>
      {role === 'Program Director' ? (
        <ProgramUpdatesTable
          data={programUpdatesData}
          setData={setProgramUpdatesData}
          originalData={originalProgramUpdatesData}
          isLoading={isLoading}
        />
      ) : (
        <>
          <MediaUpdatesTable
            data={mediaUpdatesData}
            setData={setMediaUpdatesData}
            originalData={originalMediaUpdatesData}
            isLoading={isLoading}
          />
          <ProgramUpdatesTable
            data={programUpdatesData}
            setData={setProgramUpdatesData}
            originalData={originalProgramUpdatesData}
            isLoading={isLoading}
          />
        </>
      )}
    </>
  );
};
