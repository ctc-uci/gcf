import { useCallback, useEffect, useState } from 'react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';

const mapUpdatesWithFullName = (items) => {
  return (items || []).map((item) => ({
    ...item,
    fullName: `${item.firstName} ${item.lastName}`,
  }));
};

/**
 * Loads program / media / account updates and exposes refetch + derived splits for the Updates page.
 */
export function useUpdatesPageData() {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role } = useRoleContext();
  const { backend } = useBackendContext();

  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  const [originalProgramUpdatesData, setOriginalProgramUpdatesData] = useState(
    []
  );
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [originalMediaUpdatesData, setOriginalMediaUpdatesData] = useState([]);
  const [accountUpdatesData, setAccountUpdatesData] = useState([]);
  const [originalAccountUpdatesData, setOriginalAccountUpdatesData] = useState(
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
          'Request failed:',
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
      const mappedProgram = mapUpdatesWithFullName(programUpdates);
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
          const mappedProgram = mapUpdatesWithFullName(programUpdates);
          setProgramUpdatesData(mappedProgram);
          setOriginalProgramUpdatesData(mappedProgram);
        } else {
          const [mediaUpdates, programUpdates] = await Promise.all([
            fetchMediaUpdatesForUser(),
            fetchData(`program-updates/${userId}`),
          ]);
          const mappedMedia = mapUpdatesWithFullName(mediaUpdates);
          const mappedProgram = mapUpdatesWithFullName(programUpdates);
          setOriginalMediaUpdatesData(mappedMedia);
          setMediaUpdatesData(mappedMedia);
          setProgramUpdatesData(mappedProgram);
          setOriginalProgramUpdatesData(mappedProgram);

          // Account updates placeholder — no backend route yet
          setAccountUpdatesData([]);
          setOriginalAccountUpdatesData([]);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId, backend, fetchData, fetchMediaUpdatesForUser, role]);

  return {
    userId,
    role,
    programUpdatesData,
    setProgramUpdatesData,
    originalProgramUpdatesData,
    mediaUpdatesData,
    setMediaUpdatesData,
    originalMediaUpdatesData,
    accountUpdatesData,
    originalAccountUpdatesData,
    isLoading,
    isProgramUpdatesLoading,
    refetchProgramUpdates,
  };
}
