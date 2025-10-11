import prisma from "../../../shared/prisma";
import { TPlan } from "./plan.interface";

const createPlanIntoDb = async (payload: TPlan) => {
  const result = await prisma.plan.create({
    data: payload,
  });
  return result;
};

const getPlansFromDb = async () => {
  const Plan = await prisma.plan.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });

  return Plan;
};

const getSinglePlan = async (id: string) => {
  const PlanProfile = await prisma.plan.findUnique({
    where: { id, isDeleted: false },
  });
  return PlanProfile;
};

const updatePlan = async (payload: Partial<TPlan>, PlanId: string) => {
  const result = await prisma.plan.update({
    where: { id: PlanId, isDeleted: false },
    data: payload,
  });
  return result;
};

const deletePlan = async (id: string) => {
  await prisma.plan.update({
    where: { id },
    data: { isDeleted: true },
  });
  return { message: "Plan deleted successfully" };
};

export const PlanService = {
  createPlanIntoDb,
  getPlansFromDb,
  getSinglePlan,
  updatePlan,
  deletePlan,
};
