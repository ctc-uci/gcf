import { useCallback, useEffect, useState } from 'react';

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

  const fetchData = useCallback(
    async (path) => {
      try {
        const response = await backend.get(`/update-permissions/${path}`);
        return response.data;
      } catch (error) {
        console.error(
          "Request failed:",
          path,
          error.response?.status,
          error.message
        );
        return [];
      }
    },
    [backend]
  );

  const fetchMediaUpdatesForUser = useCallback(async () => {
    try {
      const response = await backend.get(
        `/mediaChange/${userId}/media-updates`
      );
      return response.data ?? [];
    } catch (error) {
      console.error(
        'Request failed: mediaChange/:userId/media-updates',
        error.response?.status,
        error.message
      );
      return [];
    }
  }, [backend, userId]);

  useEffect(() => {
    if (!userId || !backend) {
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      setIsLoading(true);
      try {
        
        if (role === 'Program Director') {
          const programUpdates = await fetchData(`program-updates/${userId}`);
          setProgramUpdatesData(programUpdates);
          setOriginalProgramUpdatesData(programUpdates);
        }
        else {
          const [mediaUpdates, programUpdates] = await Promise.all([
            fetchMediaUpdatesForUser(),
            fetchData(`program-updates/${userId}`),
          ]);
          setOriginalMediaUpdatesData(mediaUpdates);
          setMediaUpdatesData(mediaUpdates);
          setProgramUpdatesData(programUpdates);
          setOriginalProgramUpdatesData(programUpdates);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId, backend, fetchData, fetchMediaUpdatesForUser, role]);

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
