export type GcfUserRole = 'Regional Director' | 'Program Director' | 'Admin';

export interface GcfUserAccount {
  id: number;
  role: GcfUserRole;
  email: string;
  firstName: string;
  lastName: string;
  dateCreated: string;
  createdBy?: number | null;
}