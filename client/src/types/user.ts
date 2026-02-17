export type User = {
  id: number;
  email: string;
  firebaseUid: string;
  role: "Regional Director" | "Program Director" | "Admin";
};
