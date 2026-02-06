import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  Tag, 
  HStack,
  Heading,
  useDisclosure
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from 'react'
import { useBackendContext } from '@/contexts/hooks/useBackendContext' 
import { useAuthContext } from "@/contexts/hooks/useAuthContext"
import { Form, useParams } from "react-router-dom"


export const AccountForm = () => {
    const { targetUserId } = useParams();
    const [targetUser, setTargetUser] = useState(null);
    const { currentUser } = useAuthContext();
    const [currentDbUser, setCurrentDbUser] = useState(null)
    const { backend } = useBackendContext();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [currentPrograms, setCurrentPrograms] = useState(null) 
    const btnRef = useRef();

    const userId = currentUser.uid;

    const [ formData, setFormData ] = useState({
        first_name: '',
        last_name: '',
        role: '',
        email: '',
        password: '',
        programs: []
    });
    
    useEffect(() => {
        if (!userId) return;
        // fetch current users data to see role and what peromissions they have
        const fetchData = async () => {
            try {
                const currentUserResponse = await backend.get(`/gcf-users/${userId}`);
                const currentUserData = currentUserResponse.data;
                setCurrentDbUser(currentUserData);
            } catch (error) {
                console.error("Error loading current user:", error)
            }
        };
        fetchData();
    }, [backend, userId]);

    useEffect(() => {
        if (!targetUserId) return;
        const fetchData = async () => {
            try {
                const targetUserResponse = await backend.get(`/gcf-users/${targetUserId}`);
                const targetUserData = targetUserResponse.data;
                console.log('test target')
                console.log(targetUserData);
                setTargetUser(targetUserData);
            }   
            catch (error){
                console.error("Error loading target user: ", error)
            }
        };
        fetchData();
    }, [backend, targetUserId]);

    useEffect(() => {
        if (!targetUser) return;
        setFormData({
            first_name: targetUser.firstName ?? "",
            last_name: targetUser.lastName ?? "",
            role: targetUser.role ?? "",
            email: '',
            password: '',
            programs: []
        });
    }, [targetUser]);

    useEffect(() => {
        async function fetchPrograms() {
            try {
               const response = await backend.get("/program");
                const program_list = response.data;
                setCurrentPrograms(program_list); 
            }
            catch (error) {
                console.error("Error fetching programs")
            }
        }
        fetchPrograms();
    }, [backend]);

    useEffect(() => {
        console.log("🔍 Programs fetch check:", { 
            targetUserId, 
            targetUser, 
            role: targetUser?.role 
        });
    
        if (!targetUserId || !targetUser) return;
        
    
        if (targetUser.role !== 'Program Director') return;
        
    
        const fetchUserPrograms = async () => {
            try {
                const response = await backend.get(`/program-directors/me/${targetUserId}/program`);
                const program = response.data;
                
                setFormData((prev) => ({
                    ...prev,
                    programs: [program]
                }));
            } catch (error) {
                console.error("Error fetching user's programs:", error);
            }
        };
    
        fetchUserPrograms();
    },  [backend, targetUserId, targetUser]);

    if (!currentUser) return <div>Please sign in</div>;
    
    if (currentDbUser && currentDbUser.role === "Admin") {
        return <div>Access denied. Admins only.</div>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({...prev, [name]: value}))
    };

    console.log("Current Programs:", currentPrograms);
    console.log("Selected Programs:", formData.programs);

    return (
        <> 
            <Button ref = { btnRef } colorScheme='teal' onClick={onOpen}>Update</Button>
            <Drawer 
                isOpen={isOpen}
                placement='right'
                onClose={onClose}
                finalFocusRef={btnRef}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        {targetUserId ? 'Edit Account' : 'Create Account'}
                    </DrawerHeader>

                    <DrawerBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>First Name</FormLabel>
                                <Input
                                    name="first_name"
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        
                            <FormControl isRequired>
                                <FormLabel>Last Name</FormLabel>
                                <Input
                                    name="last_name"
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        
                            <FormControl isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        
                            <FormControl isRequired>
                                <FormLabel>Password</FormLabel>
                                <Input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        
                            <FormControl>
                                <FormLabel>User Type</FormLabel>
                                <Select
                                    name="role"
                                    placeholder="Select User Type"
                                    onChange={handleChange}
                                    value={formData.role}
                                >
                                    <option value = "admin">Admin</option>
                                    <option value = "regional_director">Regional Director</option>
                                    <option value = "program_director">Program Director</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Program(s)</FormLabel>
                                <Button size="sm" onClick={() => console.log("Add clicked!")}>
                                    + Add
                                </Button>
                                    {/* Selected programs displayed as chips */}
                                <HStack spacing={2} mt={2}>
                                    {formData.programs.map((program) => (
                                    <Tag key={program.id} colorScheme="blue">
                                        {program.name}
                                    </Tag>
                                    ))}
                                </HStack>
                            </FormControl>
                            <Button colorScheme="blue" width="100%">
                                Save
                            </Button>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};