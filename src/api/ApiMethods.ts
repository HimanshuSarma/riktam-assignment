import axios, { AxiosResponse, AxiosError } from "axios";

import { url } from "../api/api.config";

import { getItem } from "../utils/localStorage/allLocalStorageHandlers";
import { errorToastMessage } from "../utils/userNotifications/toastUtils";

const ApiGet = async (endpoint: string, params?: Object, domain?: string) => {
  try {
    const res: AxiosResponse = await axios.get((domain ? domain : url) + endpoint, {
      params,
      headers: {
        Authorization: `Bearer ${getItem('user')?.token}`
      }
    });
    if (res.status === 200) {
      return res.data;
    } else {
      throw new Error(res.data?.message);
    }
  } catch (err: any) {
    errorToastMessage(err?.response?.data?.errorMessage || 'Some error occured');
    return null;
  }
};

const ApiPost = async (endpoint: string, body: Object, params?: Object, domain?: string) => {
    try {
      const res = await axios.post((domain ? domain : url) + endpoint, body, {
        params,
        headers: {
          Authorization: `Bearer ${getItem('user')?.token}`
        }
      });
  
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error(res.data?.message);
      }
    } catch (err: any) {
      errorToastMessage(err?.response?.data?.errorMessage || 'Some error occured');
      return err;
    }
};

const ApiPostNoAuth = async (endpoint: string, body: Object, params?: Object, domain?: string) => {
  try {
    const res = await axios.post((domain ? domain : url) + endpoint, body, {
      params,
    });

    if (res.status === 200) {
      return res.data;
    } else {
      throw new Error(res.data?.message);
    }
  } catch (err: any) {
    errorToastMessage(err?.response?.data?.errorMessage || 'Some error occured');
    return null;
  }
};

const ApiPut = async (endpoint: string, body: Object, params?: Object, domain?: string) => {
  try {
    const res = await axios.put((domain ? domain : url) + endpoint, body, {
      params,
      headers: {
        Authorization: `Bearer ${getItem('user')?.token}`
      }
    });

    if (res.status === 200) {
      return res.data;
    } else {
      throw new Error(res.data?.message);
    }
  } catch (err: any) {
    errorToastMessage(err?.response?.data?.errorMessage || 'Some error occured');
    return null;
  }
};

export { ApiGet, ApiPost, ApiPostNoAuth, ApiPut };
