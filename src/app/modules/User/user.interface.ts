

// export type TUser = {
//   id?: string;
//   email: string;
//   password: string;
//   age: number;
//   isStudent: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// };

export type IUserFilterRequest = {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
};
