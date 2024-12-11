import { Router } from 'express';
import multer from 'multer';
import { login, getUserProfile, createUserController, getAllUsersController, updateUserController,softDeleteUser,
    createMeterReading, updateMeterReading, addMeterReading, deleteMeterReading, getAllMeterReadings, getSpecificUserMeterReadings,
    superAdminUpdateRole,monthlyConsumption,yearlyConsumption, getMonthlyCreatedUsers,
    getYearlyCreatedUsers,getMonthlyCreatedMeters,getYearlyCreatedMeters,userDashboardReadings , getAllUserMeterMappingData,uploadCsvController} from '../controllers/authControllers.js';


import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validate.js';
import { loginSchema, userSchema, updateUserSchema,addMeterReadingSchema, updateMeterReadingSchema} from '../validations.js';
import { ROLES } from '../constants.js';
import { ROUTES } from '../routesConstants.js';
const authRoutes = Router();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

authRoutes.post(ROUTES.LOGIN, validateRequest(loginSchema),login);
authRoutes.post(ROUTES.CREATE_USER,validateRequest(userSchema), createUserController);
authRoutes.get(ROUTES.USER_PROFILE, verifyToken, verifyRole(ROLES.ADMIN, ROLES.USER, ROLES.SUPER_ADMIN), getUserProfile);
authRoutes.get(ROUTES.GET_ALL_USERS, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), getAllUsersController);
authRoutes.put(ROUTES.UPDATE_USER, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN),validateRequest(updateUserSchema) ,updateUserController);
authRoutes.delete(ROUTES.DELETE_USER,verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), softDeleteUser); 
authRoutes.post(ROUTES.CREATE_METER_READING, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), createMeterReading);
authRoutes.post(ROUTES.ADD_METER_READING, verifyToken, verifyRole(ROLES.ADMIN,ROLES.USER,ROLES.SUPER_ADMIN),validateRequest(addMeterReadingSchema), addMeterReading);
authRoutes.put(ROUTES.UPDATE_METER_READING, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN),validateRequest(updateMeterReadingSchema), updateMeterReading);
authRoutes.delete(ROUTES.DELETE_METER_READING, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), deleteMeterReading);
authRoutes.get(ROUTES.GET_ALL_METER_READINGS, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), getAllMeterReadings);
authRoutes.get(ROUTES.GET_SPECIFIC_USER_METER_READINGS, verifyToken, verifyRole(ROLES.ADMIN,ROLES.USER,ROLES.SUPER_ADMIN), getSpecificUserMeterReadings);
authRoutes.put(ROUTES.UPDATE_ROLE, verifyToken, verifyRole(ROLES.SUPER_ADMIN), superAdminUpdateRole);
authRoutes.get(ROUTES.MONTHLY_CONSUMPTION, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), monthlyConsumption);
authRoutes.get(ROUTES.YEARLY_CONSUMPTION, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN),yearlyConsumption);
authRoutes.get(ROUTES.MONTHLY_USER_CHART, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), getMonthlyCreatedUsers);
authRoutes.get(ROUTES.YEARLY_USER_CHART, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), getYearlyCreatedUsers);
authRoutes.get(ROUTES.MONTHLY_METER_CHART, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), getMonthlyCreatedMeters);
authRoutes.get(ROUTES.YEARLY_METER_CHART, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), getYearlyCreatedMeters);
authRoutes.get(ROUTES.USER_DASHBOARD_READINGS, verifyToken, verifyRole(ROLES.ADMIN,ROLES.USER,ROLES.SUPER_ADMIN), userDashboardReadings);
authRoutes.get(ROUTES.GET_ALL_USER_METER_MAPPING, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), getAllUserMeterMappingData);
authRoutes.post(ROUTES.UPLOAD_CSV, verifyToken, verifyRole(ROLES.ADMIN,ROLES.SUPER_ADMIN), upload.single('file'),uploadCsvController);

export default authRoutes;