export type TPurchasedPlan = {
  id: string;
  paymentId: string;
  amount: number;
  activePlan: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  planId: string;
};

export type IPurchasedPlanFilterRequest = {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
};
