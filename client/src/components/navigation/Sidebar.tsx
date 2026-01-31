import { Button, Box, VStack, Link, Flex, Icon } from '@chakra-ui/react'
import { MdOutlineNotifications, MdPermMedia } from 'react-icons/md'
import { FaGuitar } from 'react-icons/fa'
import { HiOutlineUser } from 'react-icons/hi'


interface SidebarProps {
    role: "admin" | "regional_director" | "program_director" | string;
}

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
        <Box borderRight="1px solid #e2e8f0" height="100vh" pos="fixed" left={0} pt={"21px"} >
            <VStack>
                <Flex direction="column" gap={5}>
                    {navItems.map((item) => (
                        <Button 
                            key={item.name}
                            bg="white" 
                            href={item.path} 
                            as={Link}
                            leftIcon={item.icon} 
                            height="4.5vh"
                            justifyContent="left"
                            _hover={{textDecoration: "none"}}
                            >
                            {item.name}
                        </Button>
                    ))
                    }
                </Flex>
            </VStack>
        </Box>
    )
};