import axios from 'axios'
import { API_BASE_URL } from '../../config';
const apiEndpoint = '/auth/login';
const apiLogout = 'api/logout';


interface request {
  username: String;
  password: String;
}

interface response{
  "type": String,
  "title": String,
  "status": Number,
  "detail": String,
  "instance": String,
  "description": String
}

export const LoginService = {
  async Login(data: request): Promise<any> {

    try {
      const respuesta = await axios.post<request, response>(
        `${API_BASE_URL}${apiEndpoint}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            credentials: 'include',
          },
        }
      );
      return respuesta;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const reponse = error.response;
        switch (status) {
          case 401:
            console.error('Error 401: Unauthorized. Please check your credentials.');
            return reponse;
          case 500:
            console.error('Error 500: Internal Server Error. Try again later.');
            return reponse;
          case 404:
            console.error('Error 404: Endpoint not found.');
            return reponse;
          default:
            console.error(`Error ${status || 'unknown'}: ${error.message}`);
            return reponse;
        }
      } else {
        console.error('An unexpected non-Axios error occurred:', error);
        return error;
      }
    }
  },
  
  logout(): void {
    localStorage.removeItem('auth_token'); // O sessionStorage.removeItem('auth_token')
    window.location.href = '/login';  
  },
};
