

export type TPost = {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  isDeleted: boolean;
  expirationOtp?: Date;
  otp?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IPostFilterRequest = {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
};
