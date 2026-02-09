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
    const [currentDbUser, setCurrentDbUser] = useState(null);
    const { backend } = useBackendContext();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [currentPrograms, setCurrentPrograms] = useState(null);
    const btnRef = useRef();

    const userId = currentUser?.uid;

    const [ formData, setFormData ] = useState({
        first_name: '',
        last_name: '',
        role: '',
        email: '',
        password: '',
        programs: []
    });

    const [isLoading, setIsLoading] = useState(null);
    
    useEffect(() => {
        if (!userId) return;
        // fetch current users data to see role and what permissions they have
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
            password: '',
            programs: []
        });
    }, [targetUser]);

    useEffect(() => {
        if (!targetUserId) return;
        const fetchEmail = async () => {
            try {
                const targetUserResponse = await backend.get(`/gcf-users/admin/get-user/${targetUserId}`);
                const { email } = targetUserResponse.data;

                setFormData(prev => ({
                    ...prev,
                    email: email ?? "",
                }));
            } catch (error) {
                console.error("Error loading target user email", error);
            }
        }
        fetchEmail();
    }, [backend, targetUserId]);

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
    
    if (!currentDbUser) {
        return <div>Loading...</div>;
    }

    if (!currentDbUser.role) {
        return <div>Your account is not set up in the database. Please contact an administrator.</div>;
    }

    if (currentDbUser && currentDbUser.role !== "Admin") {
        return <div>Access denied. Admins only.</div>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({...prev, [name]: value}))
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            if (!targetUserId) {
                await handleCreateUser();
            }

            else {
                await handleUpdateUser();
            }

            alert("User saved successfully!");
            onClose();

        }
        catch (error) {
            console.error("Error fetching user: ", error)
            
            const errorMessage = error.response?.data?.error || error.message;
        
            if (errorMessage.includes('email-already-exists') || errorMessage.includes('email address is already in use')) {
                alert("This email is already registered. Please use a different email address.");
            } else {
                alert(`Error: ${errorMessage}`);
            }
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleCreateUser = async () => {
        if (!formData.first_name || !formData.last_name || !formData.role || !formData.email || !formData.password) {
            throw new Error("Please fill in all fields on the form.");
        }

        const userData = {
            email: formData.email,
            password: formData.password,
            firstName: formData.first_name,
            lastName: formData.last_name,
            role: formData.role,
            currentUserId: currentDbUser.id,
            programId: formData.programs.length > 0 ? formData.programs[0].id : null
        }
        await backend.post('/gcf-users/admin/create-user', userData);
    };

    const handleUpdateUser = async () => {
        if (!formData.first_name || !formData.last_name || !formData.role || !formData.email) {
            throw new Error("Please fill in all fields on the form.");
        }
        const userData = {
            email: formData.email,
            firstName: formData.first_name,
            lastName: formData.last_name,
            role: formData.role,
            currentUserId: currentDbUser.id,
            targetId: targetUserId,
            programId: formData.programs.length > 0 ? formData.programs[0].id : null
        }

        if (formData.password && formData.password.trim().length > 0) {
            userData.password = formData.password;
        }
        await backend.put('/gcf-users/admin/update-user', userData);

    }

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
                                    placeholder = {targetUserId ? "Leave blank to keep currrent" : "Password"}
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
                                    <option value = "Admin">Admin</option>
                                    <option value = "Regional Director">Regional Director</option>
                                    <option value = "Program Director">Program Director</option>
                                </Select>
                            </FormControl>
                            {formData.role === 'Program Director' && (
                                <FormControl>
                                    <FormLabel>Program(s)</FormLabel>
                                    <Select
                                        placeholder = "Select a program"
                                        value={formData.programs.length > 0 ? formData.programs[0].id : ""}
                                        onChange={(e) => {
                                            const selectedProgramId = e.target.value;
                                            if (!selectedProgramId) return;

                                            const selectedProgram = currentPrograms.find(
                                                p => p.id === selectedProgramId
                                            );

                                            if (selectedProgram) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    programs: [selectedProgram]
                                                }));
                                            }
                                        }}
                                    >
                                        {currentPrograms && currentPrograms.map((program) => {
                                            return <option key={program.id} value={program.id}>{program.name}</option>
                                        })}
                                    </Select>
                                </FormControl>
                            )}
                            <Button colorScheme="teal" width="100%" onClick = {handleSubmit} isLoading = {isLoading}>
                                Save
                            </Button>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};