import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_APP_URL ?? "http://localhost:4000";

//define the access token and getter and setter
let access_token: string | null = null;

export const set_access_token = (token: string | null) => {
  access_token = token;
};

export const get_access_token = () => access_token;

//create an API Error handler to add status by extending Error
//will help add context to component errors - show which kind of error happened (status codes)
export class Api_Error extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "Api_Error";
  }
}

let on_auth_failure: (() => void) | null = null; //set as null to start
export const set_on_auth_failure = (handler: () => void) => {
  //authContext will call this and set onAuthFailure to function - avoids cricular dependency
  on_auth_failure = handler;
};

//instantiate axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }, //tells server that body is JSON on each request
});

//use interceptors to attach access token right before a request goes out
api.interceptors.request.use((config) => {
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

//need to add a retry for request (e.g. if access token expires, it must be refreshed and the request can then be retried again)
//however this makes an infinite loop of retries, therefore I need to add a flag to say I have retried to premade typescript type for request
//must extend request config
interface Retryable extends InternalAxiosRequestConfig {
  retried?: boolean;
}

//for multiple api calls at once when access token expires and needs refreshed
let refresh_happening: Promise<boolean> | null = null;

//perform refresh
const refresh_attempt = async (): Promise<boolean> => {
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) return false;

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refresh_token,
    });
    set_access_token(response.data.access_token); //stores new access token
    return true;
  } catch {
    return false;
  }
};

//retry logic
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string }>) => {
    const config = error.config as Retryable | undefined; //saves original request config

    if (error.response?.status === 401 && config && !config.retried) {
      //401 = unauthorised - token rejecetd, have original req and havnt already retried it
      config.retried = true; //stops infinite loop

      if (!refresh_happening) {
        //checks if refresh already underway, if not launch new one. If so, wait for it
        refresh_happening = refresh_attempt().finally(() => {
          refresh_happening = null;
        });
      }
      const refreshed = await refresh_happening;

      if (refreshed) {
        //if refresh worked, try original request w/ new token
        return api(config);
      }
      on_auth_failure?.(); //runs if refresh fails - logs user out
    }

    //convert axios error into api error for consistency
    const message =
      error.response?.data?.error ?? error.message ?? "Somethng went wrong";
    throw new Api_Error(error.response?.status ?? 0, message);
  },
);
