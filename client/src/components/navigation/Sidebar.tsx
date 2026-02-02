import { Link as RouterLink } from 'react-router-dom'
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
    interface NavItem {
        name: string;
        icon: React.ReactElement;
        path: string;
    }
    let navItems: NavItem[] = [];
    if (role === "admin" || role === "regional_director") {
        navItems = [
            { name: 'Programs', icon: <Icon as={FaGuitar} boxSize="20px" />, path: "/dashboard"},
            { name: 'Updates', icon: <Icon as={MdOutlineNotifications} boxSize="20px" />, path: "/updates" },
            { name: 'Accounts', icon: <Icon as={HiOutlineUser} boxSize="20px" />, path: "/accounts" },
        ];
    } else if (role === "program_director") {
        navItems = [
            { name: 'Programs', icon: <Icon as={FaGuitar} boxSize="20px" />, path: "/dashboard" },
            { name: 'Updates', icon: <Icon as={MdOutlineNotifications} boxSize="20px" />, path: "/updates" },
            { name: 'Media', icon: <Icon as={MdPermMedia} boxSize="20px" />, path: "/media" },
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
                    {navItems.map((item) => (
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
                                bg="white"
                                leftIcon={item.icon}
                                height="4.5vh"
                                justifyContent="left"
                                width="100%"
                                px={6}
                                py={5}
                                _hover={{ bg: "gray.100" }}
                            >
                                {item.name}
                            </Button>
                        </Link>
                    ))
                    }
                </Flex>
            </VStack>
        </Box>
    )
};