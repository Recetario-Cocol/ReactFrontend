import Producto from './Producto';
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication"
import { API_BASE_URL } from '../../config';

const apiEndpoint = API_BASE_URL + '/paquete';

interface request {
  data: any;
}

export const useProductoService = () => {
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

    async crear(paquete: Producto): Promise<Producto> {
      const respuesta = await axiosWithAuthentication.post(apiEndpoint, paquete);
      return respuesta.data;
    },

    async actualizar(id: number, paquete: Producto): Promise<Producto> {
      const respuesta = await axiosWithAuthentication.put(
        `${apiEndpoint}/${id}`,
        paquete.toJSON(),
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
  };
};

