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
} from "@chakra-ui/react";
import { useState, useEffect } from 'react'
import { useBackendContext } from '@/contexts/hooks/useBackendContext' 
import { useAuthContext } from "@/contexts/hooks/useAuthContext"
import { useRoleContext } from '@/contexts/hooks/useRoleContext'

export const AccountForm = ({ targetUser, isOpen, onClose, onSave }) => {
    const { currentUser } = useAuthContext();
    const { backend } = useBackendContext();
    const { role } = useRoleContext();
    const [currentPrograms, setCurrentPrograms] = useState(null);
    const [currentRegions, setCurrentRegions] = useState(null);
    const userId = currentUser?.uid;
    const targetUserId = targetUser?.id; 

    const [ formData, setFormData ] = useState({
        first_name: '',
        last_name: '',
        role: '',
        email: '',
        password: '',
        programs: [],
        regions: []
    });

    const [isLoading, setIsLoading] = useState(null);

    useEffect(() => {
        if (!targetUser) {
            setFormData({
                first_name: '',
                last_name: '',
                role: '',
                email: '',
                password: '',
                programs: [],
                regions: []
            });
        } else {
            setFormData({
                first_name: targetUser.firstName ?? "",
                last_name: targetUser.lastName ?? "",
                role: targetUser.role ?? "",
                email: targetUser.email ?? "",  
                password: '',
                programs: [],
                regions: []
            });

            if (!targetUser.email && targetUserId) {
                const fetchEmail = async () => {
                    try {
                        const response = await backend.get(`/gcf-users/admin/get-user/${targetUserId}`);
                        setFormData(prev => ({
                            ...prev,
                            email: response.data.email ?? ""
                        }));
                    } catch (error) {
                        console.error("Error loading target user email", error);
                    }
                };
                fetchEmail();
            }
        }
    }, [targetUser, targetUserId, backend]);

    useEffect(() => {
        async function fetchPrograms() {
            try {
                let response;
                if (role === 'Regional Director') {
                    response = await backend.get(`/regional-directors/me/${userId}/programs`);
                } else {
                    response = await backend.get("/program");
                }
                const program_list = response.data;
                setCurrentPrograms(program_list); 
            }
            catch (error) {
                console.error("Error fetching programs", error);
            }
        }
        
        async function fetchRegions() {
            try {
                const response = await backend.get("/region");
                const region_list = response.data;
                setCurrentRegions(region_list);
            }
            catch (error) {
                console.error("Error fetching regions", error);
            }
        }
        
        if (role && userId) {
            fetchPrograms();
            fetchRegions();
        }
    }, [backend, role, userId]);

    useEffect(() => {
    
        if (!targetUserId || !targetUser) return;
        
    
        if (targetUser.role === 'Program Director') {
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
        }
        
        if (targetUser.role === 'Regional Director') {
            const fetchUserRegion = async () => {
                try {
                    const response = await backend.get(`/regional-directors/me/${targetUserId}`);
                    const regionId = response.data.regionId;
                    
                    if (regionId && currentRegions) {
                        const region = currentRegions.find(r => r.id === regionId);
                        setFormData((prev) => ({
                            ...prev,
                            regions: region ? [region] : []
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching user's region:", error);
                }
            };
            fetchUserRegion();
        }
    },  [backend, targetUserId, targetUser, currentRegions]);

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
            onSave();
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
            currentUserId: userId,
            programId: formData.programs.length > 0 ? formData.programs[0].id : null,
            regionId: formData.regions.length > 0 ? formData.regions[0].id : null
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
            currentUserId: userId,
            targetId: targetUserId,
            programId: formData.programs.length > 0 ? formData.programs[0].id : null,
            regionId: formData.regions.length > 0 ? formData.regions[0].id : null
        }

        if (formData.password && formData.password.trim().length > 0) {
            userData.password = formData.password;
        }
        await backend.put('/gcf-users/admin/update-user', userData);

    }

    return (
        <>
            <Drawer 
                isOpen={isOpen}
                placement='right'
                onClose={onClose}
            >
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
                                    {role === 'Admin' && <option value = "Admin">Admin</option>}
                                    {role === 'Admin' && <option value = "Regional Director">Regional Director</option>}
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
                                                p => p.id == selectedProgramId
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
                            {formData.role === 'Regional Director' && (
                                <FormControl>
                                    <FormLabel>Region</FormLabel>
                                    <Select
                                        placeholder = "Select a region"
                                        value={formData.regions.length > 0 ? formData.regions[0].id : ""}
                                        onChange={(e) => {
                                            const selectedRegionId = e.target.value;
                                            if (!selectedRegionId) return;

                                            const selectedRegion = currentRegions.find(
                                                r => r.id == selectedRegionId
                                            );

                                            if (selectedRegion) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    regions: [selectedRegion]
                                                }));
                                            }
                                        }}
                                    >
                                        {currentRegions && currentRegions.map((region) => {
                                            return <option key={region.id} value={region.id}>{region.name}</option>
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