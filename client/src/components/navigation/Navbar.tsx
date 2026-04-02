import { useEffect, useRef, useState } from 'react';

import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
  useOutsideClick,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import { NAVBAR_HEIGHT } from './layoutConstants';

const DEFAULT_PROFILE_IMAGE = '/default-profile.png';

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
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: menuRef,
    handler: () => setIsMenuOpen(false),
  });

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
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
  }, [userId, backend, role, currentUser?.displayName]);

  const triggerBg = isMenuOpen || isHovered ? 'gray.300' : 'transparent';

  return (
    <Flex
      height={NAVBAR_HEIGHT}
      align="center"
      w="100%"
      maxW="100%"
      minW={0}
      px={6}
      py={6}
      borderRadius="xl"
      boxShadow="sm"
      bg="white"
    >
      <Flex
        justify="space-between"
        w="100%"
        minW={0}
        px={{ base: 2, md: '2vw' }}
        align="center"
        gap={3}
      >
        <Text
          fontSize="2vh"
          fontWeight="bold"
          noOfLines={1}
          minW={0}
          flexShrink={1}
        >
          {role === 'Super Admin' ? 'Super Admin Dashboard' : ''}
          {role === 'Admin' ? 'Admin Dashboard' : ''}
          {role === 'Regional Director' ? 'Regional Director Dashboard' : ''}
          {role === 'Program Director' ? `${project}` : ''}

          {role === 'Regional Director' ? `: ${region}` : ''}
        </Text>

        <Flex
          gap={2}
          align="center"
          flexShrink={0}
        >
          <Box
            ref={menuRef}
            position="relative"
          >
            <Button
              bg="transparent"
              p={0}
              borderRadius="full"
              _hover={{ bg: 'transparent' }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleMenuToggle}
            >
              <Box
                px={3}
                py={1.5}
                bg={triggerBg}
                borderRadius={isMenuOpen ? '20px 20px 0 0' : '20px'}
                minW="160px"
                maxW={{ base: 'min(200px, 40vw)', md: '280px' }}
                transition="background-color 0.4s ease, border-radius 0.4s ease"
              >
                <HStack
                  spacing={3}
                  justify="center"
                  align="center"
                  minW={0}
                >
                  <Image
                    src={profilePictureUrl ?? DEFAULT_PROFILE_IMAGE}
                    alt="Profile"
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    objectFit="cover"
                    flexShrink={0}
                  />
                  <Text
                    fontSize="2vh"
                    fontWeight="semibold"
                    noOfLines={1}
                    minW={0}
                    flex="1"
                    textAlign="center"
                  >
                    {userName || 'User'}
                  </Text>
                  <ChevronDownIcon
                    boxSize={4}
                    flexShrink={0}
                    transition="transform 0.4s ease"
                    transform={isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                  />
                </HStack>
              </Box>
            </Button>
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              zIndex={10}
              w="100%"
            >
              <Collapse
                in={isMenuOpen}
                animateOpacity
                transition={{
                  enter: { duration: 0.4, delay: 0.15 },
                  exit: { duration: 0.2 },
                }}
              >
                <Box
                  bg="gray.300"
                  borderRadius="0 0 20px 20px"
                  py={2}
                  px={1}
                  w="100%"
                >
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/profile');
                    }}
                    leftIcon={
                      <Icon
                        as={HiOutlineUser}
                        boxSize="2vh"
                      />
                    }
                    w="100%"
                    justifyContent="flex-start"
                    variant="ghost"
                    bg="transparent"
                    _hover={{ bg: 'gray.400' }}
                  >
                    <Text fontSize="2vh">Profile</Text>
                  </Button>
                  <Button
                    onClick={handleLogout}
                    leftIcon={
                      <Icon
                        as={HiOutlineLogout}
                        boxSize="2vh"
                      />
                    }
                    w="100%"
                    justifyContent="flex-start"
                    variant="ghost"
                    bg="transparent"
                    _hover={{ bg: 'gray.400' }}
                  >
                    <Text fontSize="2vh">Log Out</Text>
                  </Button>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};
