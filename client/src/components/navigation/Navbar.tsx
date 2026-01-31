import { Flex, Text, Icon, Image, Button, Link } from '@chakra-ui/react'
import logo from '/logo.png'
import { HiOutlineUser } from 'react-icons/hi'

interface NavbarProps {
    role: "admin" | "regional_director" | "program_director" | string;
}

export const Navbar: React.FC<NavbarProps> = ({ role }) => {
    const region = "North America"; // placeholder for region
    const project = "Royal Kids Family Camp"; // placeholder for project
    return (
        <Flex height={"6vh"} align="center" w="100vw" pl="1.4vw" borderBottom="1px solid #e2e8f0">
            
            <Image src={logo} alt="Logo" width={"9vw"} maxH="10vh" objectFit="contain"/>
            
            <Flex justify="space-between" w="100%" px="2vw" align="center">
                <Text fontSize="2vh">
                    {role === "admin" ? "Admin Dashboard" : ""}
                    {role === "regional_director" ? "Regional Director Dashboard" : ""}
                    {role === "program_director" ? `${project}` : ""}
                    
                    {role === "regional_director" ? `: ${region}` : ""}
                </Text>
                
                <Button
                    bg="white" 
                    as={Link} 
                    href="/profile"
                    leftIcon={<Icon as={HiOutlineUser} boxSize="2vh"/>} 
                    _hover={ {variant: "outline" }}
                    >
                    <Text fontSize="2vh">
                        User
                    </Text>
                </Button>
            </Flex>
        </Flex>
    )
}