import { Flex, Text, Icon, Image, Button, Link, ButtonGroup, HStack } from '@chakra-ui/react'
import logo from '/logo.png'
import { HiOutlineUser, HiOutlineLogout } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { NAVBAR_HEIGHT } from './layoutConstants'
import { useAuthContext } from '@/contexts/hooks/useAuthContext'
import { useDevRoleContext } from '@/contexts/hooks/useDevRoleContext'
import { DEV_ROLE_USER_IDS, type DevRole } from '@/contexts/DevRoleContext'

const DEV_ROLES: { value: DevRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "regionalDirector", label: "Regional Director" },
  { value: "programDirector", label: "Program Director" },
]

interface NavbarProps {
    role: "admin" | "regional_director" | "program_director" | string;
}

// TODO(login): Replace role prop with useRoleContext() or AuthContext; remove NavbarProps.role.
export const Navbar: React.FC<NavbarProps> = ({ role }) => {
    const region = "North America"; // placeholder for region
    const project = "Royal Kids Family Camp"; // placeholder for project
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const { devRole, setDevRole } = useDevRoleContext()

    const handleDevRoleChange = (newRole: DevRole) => {
        setDevRole(newRole)
        const newUserId = DEV_ROLE_USER_IDS[newRole]
        navigate(`/dashboard/${newUserId}`)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <Flex
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={10}
            height={NAVBAR_HEIGHT}
            align="center"
            w="100%"
            pl="1.4vw"
            borderBottom="1px solid #e2e8f0"
            bg="white"
        >
            
            <Image src={logo} alt="Logo" width={"9vw"} maxH="10vh" objectFit="contain"/>
            
            <Flex justify="space-between" w="100%" px="2vw" align="center">
                <HStack spacing={4}>
                    <Text fontSize="2vh">
                        {role === "admin" ? "Admin Dashboard" : ""}
                        {role === "regional_director" ? "Regional Director Dashboard" : ""}
                        {role === "program_director" ? `${project}` : ""}
                        {role === "regionalDirector" ? "Regional Director Dashboard" : ""}
                        {role === "programDirector" ? `${project}` : ""}
                        {role === "regional_director" || role === "regionalDirector" ? `: ${region}` : ""}
                    </Text>
                    <ButtonGroup size="sm" isAttached variant="outline">
                        {DEV_ROLES.map(({ value, label }) => (
                            <Button
                                key={value}
                                onClick={() => handleDevRoleChange(value)}
                                colorScheme={devRole === value ? "teal" : "gray"}
                                variant={devRole === value ? "solid" : "outline"}
                            >
                                {label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </HStack>
                
                <Flex gap={2} align="center">
                    {/* TODO: Add profile page */}
                    <Button
                        bg="white"
                        as={Link}
                        href="/profile"
                        leftIcon={<Icon as={HiOutlineUser} boxSize="2vh"/>}
                        _hover={{ variant: "outline" }}
                    >
                        <Text fontSize="2vh">
                            User
                        </Text>
                    </Button>
                    {/* TODO: Remove logout button when auth flow is finalized */}
                    <Button
                        bg="white"
                        leftIcon={<Icon as={HiOutlineLogout} boxSize="2vh"/>}
                        _hover={{ variant: "outline" }}
                        onClick={handleLogout}
                    >
                        <Text fontSize="2vh">
                            Logout
                        </Text>
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    )
}