export type User = {
  id: number;
  email: string;
  firebaseUid: string;
  role: "user" | "admin";
};
