import { AxiosRequestConfig } from "axios";
import { Future } from "../utils/future";
import { DefaultError, axiosRequest, defaultBuilder } from "../utils/future-axios";

export function request<Params, Data>(url: string, params: Params): Future<DefaultError, Data> {
    const request: AxiosRequestConfig = { url, params };
    return axiosRequest<DefaultError, Data>(defaultBuilder, request);
}
