
export const ROUTES = {
    LOGIN: '/login',
    CREATE_USER: '/create-user',
    USER_PROFILE: '/user-profile',
    GET_ALL_USERS: '/admin-getAllUsers',
    UPDATE_USER: '/admin-updateUsers/:user_id',
    DELETE_USER: '/admin-deleteUser/:user_id',
    CREATE_METER_READING: '/admin-create-meter-reading/:user_id',
    ADD_METER_READING: '/admin-add-meter-reading/:user_id/:meter_number',
    UPDATE_METER_READING: '/admin-update-meter-reading/:reading_id',
    DELETE_METER_READING: '/admin-delete-meter-reading/:reading_id',
    GET_ALL_METER_READINGS: '/admin-get-all-meter-readings',
    GET_SPECIFIC_USER_METER_READINGS: '/admin-get-specific-user-meter-readings/:user_id/:meter_number',
    UPDATE_ROLE: '/superadmin-update-role/:user_id',
    MONTHLY_CONSUMPTION: '/monthly-consumption-chart',
    YEARLY_CONSUMPTION: '/yearly-consumption-chart',
    MONTHLY_USER_CHART: '/monthly-user-chart',
    YEARLY_USER_CHART: '/yearly-user-chart',
    MONTHLY_METER_CHART: '/monthly-meter-chart',
    YEARLY_METER_CHART: '/yearly-meter-chart',
    USER_DASHBOARD_READINGS: '/user-dashboard-readings/:user_id',
    GET_ALL_USER_METER_MAPPING: '/admin-get-all-user-meter-mapping-data',
    UPLOAD_CSV: '/upload-csv',
  };
  