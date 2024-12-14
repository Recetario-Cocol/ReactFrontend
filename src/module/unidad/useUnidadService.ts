import { Unidad } from './Unidad';
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication"
import { API_BASE_URL } from '../../config';

const apiEndpoint = API_BASE_URL + '/unidad';

interface request {
  data: any;
}

export const useUnidadService = () => {
  const axiosWithAuthentication = useAxiosWithAuthentication();

  return {
    async getUnidades(): Promise<any> {
      return axiosWithAuthentication.get<any, request>(apiEndpoint);
    },

    async getUnidad(id: number): Promise<request> {
      return axiosWithAuthentication.get<any, request>(`${apiEndpoint}/${id}`, {
        params: { projection: 'unidadProjection' },
      });
    },

    async crearUnidad(unidad: Unidad): Promise<Unidad> {
      const respuesta = await axiosWithAuthentication.post(apiEndpoint, unidad);
      return respuesta.data;
    },

    async actualizarUnidad(id: number, unidad: Unidad): Promise<Unidad> {
      console.log(unidad.toJSON());
      const respuesta = await axiosWithAuthentication.put(
        `${apiEndpoint}/${id}`,
        unidad.toJSON(),
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return respuesta.data;
    },

    async eliminarUnidad(id: number): Promise<void> {
      await axiosWithAuthentication.delete(`${apiEndpoint}/${id}`);
    },
  };
};
