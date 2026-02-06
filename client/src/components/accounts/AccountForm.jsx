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
  Heading,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from 'react'
import { useBackendContext } from '@/contexts/hooks/useBackendContext' 
import { useAuthContext } from "@/contexts/hooks/useAuthContext"
import { useParams } from "react-router-dom"


export const AccountForm = () => {
    const { accountId } = useParams();
    const { currentUser } = useAuthContext();
    const { backend } = useBackendContext();
    //const [currentUser, setCurrentUser] = useState(null);
    if (!currentUser) return <div>Please sign in</div>;
    const userId = currentUser.uid;


    const [ formData, setFormData ] = useState({
        first_name: '',
        last_name: '',
        role: 'Program Director',
        email: ''
    });
    
    useEffect(() => {
        if (!currentUser) return;
        // fetch current users data to see role and what peromissions they have
        const fetchData = async () => {
            try {
                const currentUserResponse = await backend.get(`/gcf-users/${userId}`);
                const userData = currentUserResponse.data;
                setCurrentUser(userData);
            } catch (error) {
                console.error("Error loading current user:", error)
            }
        };
        fetchData();
    }, [backend, userId]);

    return (
        <VStack p={8} width='35%' borderWidth="1px" borderColor="lightblue">
            <Heading>
                Account
            </Heading>
        </VStack>
    )
};
