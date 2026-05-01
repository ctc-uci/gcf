import { useEffect, useState } from 'react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import useSWR from 'swr';

const mapUpdatesWithFullName = (items) => {
  return (items || []).map((item) => {
    const fullName = [item.firstName, item.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return { ...item, fullName };
  });
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
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [accountUpdatesData, setAccountUpdatesData] = useState([]);

  const fetchMediaAndPrograms = async (fetchRoute) => {
    try {
      const response = await backend.get(fetchRoute);
      const rows = Array.isArray(response.data) ? response.data : [];
      const mapped = mapUpdatesWithFullName(rows);
      return mapped;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAccounts = async (fetchRoute) => {
    try {
      const response = await backend.get(fetchRoute);
      const rows = Array.isArray(response.data) ? response.data : [];
      return rows;
    } catch (err) {
      console.error(err);
    }
  };

  const {
    data: programUpdatesFromSWR,
    isLoading: isProgramLoading,
    mutate: refetchProgramUpdates,
  } = useSWR(
    role === 'Program Director'
      ? `/update-permissions/program-updates/pd/${userId}`
      : `/update-permissions/program-updates/${userId}`,
    fetchMediaAndPrograms
  );
  const { data: mediaUpdatesFromSWR, isLoading: isMediaLoading } = useSWR(
    role !== 'Program Director' ? `/mediaChange/${userId}/media-updates` : null,
    fetchMediaAndPrograms
  );
  const {
    data: accountUpdatesFromSWR,
    isLoading: isAccountLoading,
    mutate: refetchAccountUpdates,
  } = useSWR(
    role !== 'Program Director' ? `/accountChange` : null,
    fetchAccounts
  );

  const isLoading = isProgramLoading || isMediaLoading || isAccountLoading;

  useEffect(() => {
    if (programUpdatesFromSWR) {
      setProgramUpdatesData(programUpdatesFromSWR);
    }
  }, [programUpdatesFromSWR]);

  useEffect(() => {
    if (mediaUpdatesFromSWR) {
      setMediaUpdatesData(mediaUpdatesFromSWR);
    }
  }, [mediaUpdatesFromSWR]);

  useEffect(() => {
    if (accountUpdatesFromSWR) {
      setAccountUpdatesData(accountUpdatesFromSWR);
    }
  }, [accountUpdatesFromSWR]);

  return {
    userId,
    role,
    programUpdatesData,
    setProgramUpdatesData,
    mediaUpdatesData,
    setMediaUpdatesData,
    accountUpdatesData,
    isLoading,
    isProgramLoading,
    refetchProgramUpdates,
    refetchAccountUpdates,
    originalProgramUpdatesData: programUpdatesFromSWR,
    originalMediaUpdatesData: mediaUpdatesFromSWR,
    originalAccountUpdatesData: accountUpdatesFromSWR,
  };
}
