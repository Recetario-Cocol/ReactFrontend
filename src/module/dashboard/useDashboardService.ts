import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { AxiosResponse } from "axios";
import { API_BASE_URL } from "../../config";

const apiEndpoint = API_BASE_URL + "/recetario/dashboard";

interface DashboardData {
  unidades: number;
  productos: number;
  recetas: number;
}

export const useDashboardService = () => {
  const axiosWithAuthentication = useAxiosWithAuthentication();

  return {
    async getTotales(): Promise<DashboardData> {
      return axiosWithAuthentication
        .get<DashboardData, AxiosResponse<DashboardData>>(`${apiEndpoint}/totales/`)
        .then((reponse) => reponse.data);
    },
  };
};
