import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';
import { ChevronDownIcon } from '@chakra-ui/icons';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import { NAVBAR_HEIGHT } from './layoutConstants';

export const Navbar = () => {
  const { role } = useRoleContext();
  const { logout } = useAuthContext();
  const { currentUser } = useAuthContext();
  const { backend } = useBackendContext();
  const userId = currentUser?.uid;
  const [region, setRegion] = useState(''); // placeholder for region
  const [project, setProject] = useState(''); // placeholder for project
  const [userName, setUserName] = useState(currentUser?.displayName ?? '');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHoverActive, setIsHoverActive] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState(160);
  const navigate = useNavigate();

  const clearAllTimeouts = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
      hoverDelayRef.current = null;
    }
  };

  const openMenu = () => {
    clearAllTimeouts();
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
    setIsMenuOpen(true);
    hoverDelayRef.current = setTimeout(() => {
      setIsHoverActive(true);
      hoverDelayRef.current = null;
    }, 20);
  };

  const closeMenuDelayed = () => {
    clearAllTimeouts();
    closeTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      closeTimeoutRef.current = setTimeout(() => {
        setIsHoverActive(false);
        closeTimeoutRef.current = null;
      }, 0);
    }, 0);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async (table: string, path: string) => {
      try {
        const response = await backend.get(`/${table}/${path}`);
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

    const loadData = async () => {
      try {
        if (role === 'Regional Director') {
          const regionData = await fetchData(
            'region',
            `get-region-name/${userId}`
          );
          setRegion(regionData?.name ?? '');
          setProject('');
        } else if (role === 'Program Director') {
          const projectData = await fetchData(
            'program',
            `get-program-name/${userId}`
          );
          setProject(projectData?.name ?? '');
          setRegion('');
        } else {
          setRegion('');
          setProject('');
        }

        if (userId) {
          try {
            const userResponse = await backend.get(`/gcf-users/${userId}`);
            const userData = userResponse.data;
            if (userData?.firstName || userData?.lastName) {
              const fullName = `${userData.firstName ?? ''} ${
                userData.lastName ?? ''
              }`.trim();
              setUserName(fullName || currentUser?.displayName || '');
            } else if (currentUser?.displayName) {
              setUserName(currentUser.displayName);
            }
            if (userData?.picture && userData.picture.trim() !== '') {
              const urlResponse = await backend.get(
                `/images/url/${encodeURIComponent(userData.picture)}`
              );
              setProfilePictureUrl(urlResponse.data.url);
            } else {
              setProfilePictureUrl(DEFAULT_PROFILE_IMAGE);
            }
          } catch {
            setProfilePictureUrl(DEFAULT_PROFILE_IMAGE);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    loadData();
  }, [userId, backend, role]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
    };
  }, []);

  const boxBg = !isMenuOpen
    ? 'transparent'
    : isHoverActive
      ? 'gray.300'
      : 'white';

  return (
    <Flex
      height={NAVBAR_HEIGHT}
      align="center"
      w="80vw"
      px={6}
      py={4}
      borderRadius="xl"
      boxShadow="sm"
      bg="white"
    >
      <Flex justify="space-between" w="100%" px="2vw" align="center">
        <Text fontSize="2vh">
          {role === 'Super Admin' ? 'Super Admin Dashboard' : ''}
          {role === 'Admin' ? 'Admin Dashboard' : ''}
          {role === 'Regional Director' ? 'Regional Director Dashboard' : ''}
          {role === 'Program Director' ? `${project}` : ''}

          {role === 'Regional Director' ? `: ${region}` : ''}
        </Text>

        <Flex gap={2} align="center">
          <Menu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            placement="bottom-end"
            offset={[0, 0]}
          >
            <MenuButton
              as={Button}
              bg="transparent"
              p={0}
              borderRadius="full"
              _hover={{ bg: 'transparent' }}
              onMouseEnter={openMenu}
              onMouseLeave={closeMenuDelayed}
            >
              <Box
                ref={triggerRef}
                px={3}
                py={2}
                bg={boxBg}
                borderRadius={isMenuOpen ? '20px 20px 0 0' : '20px'}
                minW="160px"
              >
                <HStack spacing={3} justify="center" align="center">
                  <Image
                    src={profilePictureUrl ?? DEFAULT_PROFILE_IMAGE}
                    alt="Profile"
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    objectFit="cover"
                  />
                  <Text fontSize="2vh" fontWeight="semibold">
                    {userName || 'User'}
                  </Text>
                  <ChevronDownIcon boxSize={4} />
                </HStack>
              </Box>
            </MenuButton>
            <MenuList
              onMouseEnter={openMenu}
              onMouseLeave={closeMenuDelayed}
              p={0}
              minW={triggerWidth}
              w={triggerWidth}
              bg="transparent"
              border="none"
              boxShadow="none"
              mt="-1px"
            >
              <Box
                bg={boxBg}
                borderRadius="0 0 20px 20px"
                py={2}
                px={1}
                overflow="hidden"
                w="100%"
              >
                <MenuItem
                  onClick={() => navigate('/profile')}
                  icon={<Icon as={HiOutlineUser} boxSize="2vh" />}
                  bg={boxBg}
                  _hover={{ bg: isHoverActive ? 'gray.400' : 'gray.100' }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  icon={<Icon as={HiOutlineLogout} boxSize="2vh" />}
                  bg={boxBg}
                  _hover={{ bg: isHoverActive ? 'gray.400' : 'gray.100' }}
                >
                  Log Out
                </MenuItem>
              </Box>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Flex>
  );
};
