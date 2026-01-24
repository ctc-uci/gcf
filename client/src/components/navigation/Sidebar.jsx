import { Button, Box, VStack, Link, Flex, Image } from '@chakra-ui/react'
import guitar from '/guitar.png'
import bell from '/bell.png'
import guy from '/guy.png'
import media from '/media.png'

export const Sidebar = ({role}) => {
    let navItems = [];
    if (role === "admin" || role === "regional_director") {
        navItems = [
            { name: 'Programs', icon: <Image src={guitar} alt="Guitar" boxSize="20px" />, path: "/dashboard" },
            { name: 'Updates', icon: <Image src={bell} alt="Bell" boxSize="20px" />, path: "/updates" },
            { name: 'Accounts', icon: <Image src={guy} alt="Guy" boxSize="20px" />, path: "/accounts" },
        ];
    } else if (role === "project_director") {
        navItems = [
            { name: 'Programs', icon: <Image src={guitar} alt="Guitar" boxSize="20px" />, path: "/dashboard" },
            { name: 'Updates', icon: <Image src={bell} alt="Bell" boxSize="20px" />, path: "/updates" },
            { name: 'Media', icon: <Image src={media} alt="Media" boxSize="20px" />, path: "/media" },
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