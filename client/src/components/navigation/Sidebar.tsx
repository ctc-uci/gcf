import { Box, Button, Flex, Icon, Image, Link, VStack } from '@chakra-ui/react';

import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { FaGuitar } from 'react-icons/fa';
import { HiOutlineUser } from 'react-icons/hi';
import { MdOutlineNotifications, MdPermMedia } from 'react-icons/md';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { SIDEBAR_WIDTH } from './layoutConstants';
import logo from '/logo.png';

export const Sidebar = () => {
  const { role } = useRoleContext();
  const location = useLocation();
  interface NavItem {
    name: string;
    icon: React.ReactElement;
    path: string;
  }
  let navItems: NavItem[] = [];

  if (
    role === 'Super Admin' ||
    role === 'Admin' ||
    role === 'Regional Director'
  ) {
    navItems = [
      {
        name: 'Programs',
        icon: <Icon as={FaGuitar} boxSize="20px" />,
        path: '/dashboard',
      },
      {
        name: 'Updates',
        icon: <Icon as={MdOutlineNotifications} boxSize="20px" />,
        path: '/updates',
      },
      {
        name: 'Accounts',
        icon: <Icon as={HiOutlineUser} boxSize="20px" />,
        path: '/account',
      },
    ];
  } else if (role === 'Program Director') {
    navItems = [
      {
        name: 'Programs',
        icon: <Icon as={FaGuitar} boxSize="20px" />,
        path: '/dashboard',
      },
      {
        name: 'Updates',
        icon: <Icon as={MdOutlineNotifications} boxSize="20px" />,
        path: '/updates',
      },
      {
        name: 'Media',
        icon: <Icon as={MdPermMedia} boxSize="20px" />,
        path: '/media',
      },
    ];
  }
  return (
    <Box
      width={SIDEBAR_WIDTH}
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      pt={4}
      pb={6}
      px={4}
      height="95vh"
      display="flex"
      flexDirection="column"
      alignItems="stretch"
    >
      <VStack align="stretch" spacing={5} flex="1">
        <Box display="flex" justifyContent="center" flexShrink={0}>
          <Image src={logo} alt="Logo" objectFit="contain" draggable={false} />
        </Box>
        <Flex direction="column" gap={3} flex="1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' &&
                location.pathname.startsWith(item.path + '/'));
            return (
              <Link
                key={item.name}
                as={RouterLink}
                to={item.path}
                textDecoration="none"
                _hover={{ textDecoration: 'none' }}
                _focus={{ textDecoration: 'none' }}
                _active={{ textDecoration: 'none' }}
                display="block"
                userSelect="none"
                draggable={false}
              >
                <Button
                  bg={isActive ? 'teal.500' : 'white'}
                  color={isActive ? 'white' : undefined}
                  leftIcon={item.icon}
                  height="4.5vh"
                  justifyContent="left"
                  width="100%"
                  px={6}
                  py={5}
                  borderRadius="xl"
                  _hover={{ bg: isActive ? 'teal.600' : 'gray.100' }}
                >
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </Flex>
      </VStack>
    </Box>
  );
};
