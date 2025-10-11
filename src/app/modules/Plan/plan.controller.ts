import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PlanService } from "./plan.service";

const createPlan = catchAsync(async (req, res) => {
  const result = await PlanService.createPlanIntoDb(req.body);
  sendResponse(res, {
    message: "Plan created successfully!",
    data: result,
  });
});

const getPlans = catchAsync(async (req, res) => {
  const result = await PlanService.getPlansFromDb();
  sendResponse(res, {
    message: "Plans retrieved successfully!",
    data: result,
  });
});

const getSinglePlan = catchAsync(async (req, res) => {
  const result = await PlanService.getSinglePlan(req.params.id);
  sendResponse(res, {
    message: "Plan retrieved successfully",
    data: result,
  });
});

const updatePlan = catchAsync(async (req, res) => {
  const result = await PlanService.updatePlan(req.body, req.params.id);
  sendResponse(res, {
    message: "Plan updated successfully!",
    data: result,
  });
});

const deletePlan = catchAsync(async (req, res) => {
  const result = await PlanService.deletePlan(req.params.id);
  sendResponse(res, {
    message: "Plan deleted successfully",
    data: result,
  });
});

export const PlanController = {
  createPlan,
  getPlans,
  getSinglePlan,
  updatePlan,
  deletePlan,
};
