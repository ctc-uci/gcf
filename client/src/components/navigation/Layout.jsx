import { useEffect } from 'react';

import { Box, Flex } from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import i18n, { isAppLocale } from '@/i18n';
import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const { currentUser } = useAuthContext();
  const { backend } = useBackendContext();

  useEffect(() => {
    if (!currentUser?.uid) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await backend.get(`/gcf-users/${currentUser.uid}`);
        if (cancelled) return;
        const pref = data?.preferredLanguage;
        if (pref && isAppLocale(String(pref))) {
          await i18n.changeLanguage(String(pref));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, backend]);

  return (
    <Flex
      bg="gray.50"
      h="100vh"
      minW={0}
      w="100%"
      maxW="100%"
      padding={6}
      gap={6}
      overflow="hidden"
    >
      <Sidebar />
      <Box
        flex="1"
        minW={0}
        display="flex"
        flexDirection="column"
        minH={0}
      >
        <Navbar />
        <Box
          as="main"
          mt={6}
          flex="1"
          minW={0}
          minH={0}
          overflowY="auto"
        >
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};
