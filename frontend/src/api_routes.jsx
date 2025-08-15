const DOMAIN    =   'http://localhost/TravelAndTour'
const FVM  =   DOMAIN + '/fleet_service/public'
export const api = {
    vehicles: FVM + '/api/vehicles',
    register: FVM + '/api/vehicles/register',
    update: FVM + '/api/vehicles/change'
}
