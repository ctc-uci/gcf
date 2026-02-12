import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Button, Box, VStack, Link, Flex, Icon } from '@chakra-ui/react'
import { MdOutlineNotifications, MdPermMedia } from 'react-icons/md'
import { FaGuitar } from 'react-icons/fa'
import { HiOutlineUser } from 'react-icons/hi'
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from './layoutConstants'


interface SidebarProps {
    role: "admin" | "regional_director" | "program_director" | string;
}

// TODO(login): Replace role prop with useRoleContext() or AuthContext; remove SidebarProps.role.
export const Sidebar: React.FC<SidebarProps> = ({role}) => {
    const location = useLocation();
    interface NavItem {
        name: string;
        icon: React.ReactElement;
        path: string;
    }
    let navItems: NavItem[] = [];
    // TODO(login): update the paths here to use AuthContext (currentUser?.uid) instead of hardcoded 1.
    if (role === "Admin" || role === "Regional Director") {
        navItems = [
            { name: 'Programs', icon: <Icon as={FaGuitar} boxSize="20px" />, path: "/dashboard/1"},
            { name: 'Updates', icon: <Icon as={MdOutlineNotifications} boxSize="20px" />, path: "/updates/1" },
            { name: 'Accounts', icon: <Icon as={HiOutlineUser} boxSize="20px" />, path: "/account/1" },
        ];
    } else if (role === "program_director") {
        navItems = [
            { name: 'Programs', icon: <Icon as={FaGuitar} boxSize="20px" />, path: "/dashboard/1" },
            { name: 'Updates', icon: <Icon as={MdOutlineNotifications} boxSize="20px" />, path: "/updates/1" },
            { name: 'Media', icon: <Icon as={MdPermMedia} boxSize="20px" />, path: "/media/1" },
        ];
    }
    return (
        <Box
            position="fixed"
            top={NAVBAR_HEIGHT}
            left={0}
            width={SIDEBAR_WIDTH}
            height={`calc(100vh - ${NAVBAR_HEIGHT})`}
            borderRight="1px solid #e2e8f0"
            bg="white"
            pt="18px"
            zIndex={9}
        >
            <VStack>
                <Flex direction="column" gap={3}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                        return (
                        <Link
                            key={item.name}
                            as={RouterLink}
                            to={item.path}
                            textDecoration="none"
                            _hover={{ textDecoration: "none" }}
                            _focus={{ textDecoration: "none" }}
                            _active={{ textDecoration: "none" }}
                            display="block"
                        >
                            <Button
                                bg={isActive ? "blue.50" : "white"}
                                color={isActive ? "blue.700" : undefined}
                                leftIcon={item.icon}
                                height="4.5vh"
                                justifyContent="left"
                                width="100%"
                                px={6}
                                py={5}
                                _hover={{ bg: isActive ? "blue.100" : "gray.100" }}
                            >
                                {item.name}
                            </Button>
                        </Link>
                    );})}
                </Flex>
            </VStack>
        </Box>
    )
};