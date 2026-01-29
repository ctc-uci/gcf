import { Flex, Text, Image, Button, Link } from '@chakra-ui/react'
import logo from '/logo.png'
import guy from '/public/guy.png'

export const Navbar = ({role}) => {
    const region = "North America"; // placeholder for region
    const project = "Royal Kids Family Camp"; // placeholder for project
    return (
        <Flex height={"6vh"} align="center" w="100vw" pl="1.4vw" borderBottom="1px solid #e2e8f0">
            
            <Image src={logo} alt="Logo" width={"9vw"} maxH="6vh" objectFit="cover"/>
            
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
                    to={"/profile"} 
                    leftIcon={<Image src={guy} alt="User Icon" boxSize="2.5vh"/>} 
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