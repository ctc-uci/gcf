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
  const [isProgramUpdatesLoading, setIsProgramUpdatesLoading] = useState(false);

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

  const refetchProgramUpdates = useCallback(async () => {
    setIsProgramUpdatesLoading(true);
    try {
      const programUpdates = await fetchData(`program-updates/${userId}`);
      const mappedProgram = (programUpdates || []).map(item => ({
        ...item,
        fullName: `${item.firstName} ${item.lastName}`,
      }));
      setProgramUpdatesData(mappedProgram);
      setOriginalProgramUpdatesData(mappedProgram);
    } catch (error) {
      console.error('Error refetching program updates:', error);
    } finally {
      setIsProgramUpdatesLoading(false);
    }
  }, [fetchData, userId]);

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
          const mappedProgram = (programUpdates || []).map(item => ({
            ...item,
            fullName: `${item.firstName} ${item.lastName}`,
          }));
          setProgramUpdatesData(mappedProgram);
          setOriginalProgramUpdatesData(mappedProgram);
        }
        else {
          const [mediaUpdates, programUpdates] = await Promise.all([
            fetchMediaUpdatesForUser(),
            fetchData(`program-updates/${userId}`),
          ]);
          const mappedMedia = (mediaUpdates || []).map(item => ({
            ...item,
            fullName: `${item.firstName} ${item.lastName}`,
          }));
          const mappedProgram = (programUpdates || []).map(item => ({
            ...item,
            fullName: `${item.firstName} ${item.lastName}`,
          }));
          setOriginalMediaUpdatesData(mappedMedia);  
          setMediaUpdatesData(mappedMedia);
          setProgramUpdatesData(mappedProgram);
          setOriginalProgramUpdatesData(mappedProgram);
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
          isLoading={isLoading || isProgramUpdatesLoading}
          onSave={refetchProgramUpdates}
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
            isLoading={isLoading || isProgramUpdatesLoading}
            onSave={refetchProgramUpdates}
          />
        </>
      )}
    </>
  );
};
