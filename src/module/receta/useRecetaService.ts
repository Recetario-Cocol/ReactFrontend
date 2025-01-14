import Receta from './Receta';
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication"
import { API_BASE_URL } from '../../config';

const apiEndpoint = API_BASE_URL + '/receta';

interface request {
  data: any;
}

export const useRecetaService = () => {
  const axiosWithAuthentication = useAxiosWithAuthentication();

  return {
    async getAll(): Promise<any> {
      return axiosWithAuthentication.get<any, request>(apiEndpoint);
    },

    async get(id: number): Promise<any> {
      return axiosWithAuthentication.get(`${apiEndpoint}/${id}`, {
        params: { projection: 'unidadProjection' },
      });
    },

    async crear(receta: Receta): Promise<Receta> {
      const respuesta = await axiosWithAuthentication.post(apiEndpoint, receta);
      return respuesta.data;
    },

    async actualizar(id: number, receta: Receta): Promise<Receta> {
      console.log(receta.toJSON());
      const respuesta = await axiosWithAuthentication.put(
        `${apiEndpoint}/${id}`,
        receta.toJSON(),
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return respuesta.data;
    },

    async eliminar(id: number): Promise<void> {
      await axiosWithAuthentication.delete(`${apiEndpoint}/${id}`);
    },
    
    async getGrilla(): Promise<any> {
      return axiosWithAuthentication.get<any, request>(apiEndpoint + '/grilla');
    },
  };
};

