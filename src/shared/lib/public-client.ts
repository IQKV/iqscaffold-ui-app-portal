import axios from "axios";
import { getConfig } from "@/app/config";
import { ENV_KEYS } from "@/shared/constants";

export const publicApi = axios.create({
  withCredentials: true,
});

publicApi.interceptors.request.use(
  (config) => {
    const baseUrl = getConfig(ENV_KEYS.API_URL_SERVER);
    config.baseURL = `${baseUrl}/public`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.defaults.withCredentials = true;
