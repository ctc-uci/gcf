import { useEffect, useRef } from 'react';

import { Box, Button, Flex, Icon, Image, Link, VStack } from '@chakra-ui/react';

import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { useTranslation } from 'react-i18next';
import { BsMap } from 'react-icons/bs';
import { FaGuitar } from 'react-icons/fa';
import { HiOutlineUser } from 'react-icons/hi';
import {
  MdOutlineHome,
  MdOutlineNotifications,
  MdPermMedia,
} from 'react-icons/md';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { SIDEBAR_WIDTH } from './layoutConstants';
import logo from '/logo.png';

const AutoFitText = ({ children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.fontSize = '1rem';
    const ratio = el.clientWidth / el.scrollWidth;
    if (ratio < 1) {
      el.style.fontSize = `${Math.max(ratio, 0.6)}rem`;
    }
  }, [children]);

  return (
    <Box
      ref={ref}
      whiteSpace="nowrap"
      overflowX="hidden"
      overflowY="visible"
      width="100%"
    >
      {children}
    </Box>
  );
};

export const Sidebar = () => {
  const { t } = useTranslation();
  const { role } = useRoleContext();
  const location = useLocation();
  let navItems = [];

  if (role === 'Super Admin' || role === 'Admin') {
    navItems = [
      {
        name: t('sidebar.programs'),
        icon: (
          <Icon
            as={FaGuitar}
            boxSize="20px"
          />
        ),
        path: '/dashboard',
      },
      {
        name: t('sidebar.updates'),
        icon: (
          <Icon
            as={MdOutlineNotifications}
            boxSize="20px"
          />
        ),
        path: '/updates',
      },
      {
        name: t('sidebar.accounts'),
        icon: (
          <Icon
            as={HiOutlineUser}
            boxSize="20px"
          />
        ),
        path: '/account',
      },
      {
        name: t('sidebar.regions'),
        icon: (
          <Icon
            as={BsMap}
            boxSize="20px"
          />
        ),
        path: '/regions',
      },
    ];
  } else if (role === 'Regional Director') {
    navItems = [
      {
        name: t('sidebar.programs'),
        icon: (
          <Icon
            as={FaGuitar}
            boxSize="20px"
          />
        ),
        path: '/dashboard',
      },
      {
        name: t('sidebar.updates'),
        icon: (
          <Icon
            as={MdOutlineNotifications}
            boxSize="20px"
          />
        ),
        path: '/updates',
      },
      {
        name: t('sidebar.accounts'),
        icon: (
          <Icon
            as={HiOutlineUser}
            boxSize="20px"
          />
        ),
        path: '/account',
      },
    ];
  } else if (role === 'Program Director') {
    navItems = [
      {
        name: t('sidebar.home'),
        icon: (
          <Icon
            as={MdOutlineHome}
            boxSize="20px"
          />
        ),
        path: '/dashboard',
      },
      {
        name: t('sidebar.updates'),
        icon: (
          <Icon
            as={MdOutlineNotifications}
            boxSize="20px"
          />
        ),
        path: '/updates',
      },
      {
        name: t('sidebar.media'),
        icon: (
          <Icon
            as={MdPermMedia}
            boxSize="20px"
          />
        ),
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
      minHeight="95vh"
      display="flex"
      flexDirection="column"
      alignItems="stretch"
    >
      <VStack
        align="stretch"
        spacing={5}
        flex="1"
      >
        <Box
          display="flex"
          justifyContent="center"
          flexShrink={0}
        >
          <Link
            as={RouterLink}
            to="/dashboard"
          >
            <Image
              src={logo}
              alt={t('sidebar.logoAlt')}
              objectFit="contain"
              draggable={false}
            />
          </Link>
        </Box>
        <Flex
          direction="column"
          gap={3}
          flex="1"
        >
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' &&
                location.pathname.startsWith(item.path + '/'));
            return (
              <Link
                key={item.path}
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
                  fontSize="clamp(0.6rem, 1vw, 1rem)"
                  transition="background-color 0.4s ease, transform 0.4s ease"
                  _hover={{
                    bg: isActive ? 'teal.600' : 'gray.100',
                    transform: 'translateX(2px)',
                  }}
                >
                  <AutoFitText>{item.name}</AutoFitText>
                </Button>
              </Link>
            );
          })}
        </Flex>
      </VStack>
    </Box>
  );
};
