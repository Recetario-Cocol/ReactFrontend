import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication"
import { API_BASE_URL } from '../../config';

const apiEndpoint = API_BASE_URL + '/Dashboard';

interface request {
  data: any;
}

export const useDashboardService = () => {
  const axiosWithAuthentication = useAxiosWithAuthentication();

  return {
    async getTotales(): Promise<any> {
      return axiosWithAuthentication.get<any, request>(`${apiEndpoint}/totales`);
    },
  };
};

