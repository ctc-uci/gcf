export type GcfUserRole = 'Regional Director' | 'Program Director' | 'Admin';

export interface GcfUserAccount {
    id: string;
    role: GcfUserRole;
    firstName: string;
    lastName: string;
    createdBy?: string | null;
}