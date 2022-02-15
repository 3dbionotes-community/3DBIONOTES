import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { Future } from "./future";

type AxiosRequest = AxiosRequestConfig;

export interface AxiosBuilder<E, D = unknown> {
    mapResponse(response: AxiosResponse<unknown>): ["success", D] | ["error", E];
    mapNetworkError: (request: AxiosRequestConfig, message: string) => E;
}

export interface HttpResponse {
    status: number;
    location: string | undefined;
}

export type RequestResult<Data> = { data: Data; response: HttpResponse };

export function axiosRequest<E, D>(
    builder: AxiosBuilder<E>,
    request: AxiosRequest
): Future<E, RequestResult<D>> {
    return Future.fromComputation<E, RequestResult<D>>((resolve, reject) => {
        const source = axios.CancelToken.source();

        const fullRequest: AxiosRequest = {
            ...request,
            validateStatus: _status => true,
            cancelToken: source.token,
        };

        axios
            .request(fullRequest)
            .then(response => {
                const result = builder.mapResponse(response);
                if (result[0] === "success") {
                    const httpResponse: HttpResponse = {
                        status: response.status,
                        location: response.headers.location,
                    };
                    resolve({ response: httpResponse, data: result[1] as D });
                } else {
                    reject(result[1]);
                }
            })
            .catch(err => {
                const message = (err && err.message) || "Unknown error";
                reject(builder.mapNetworkError(fullRequest, message));
            });

        return () => source.cancel();
    });
}

export type DefaultError = { message: string };

export const defaultBuilder: AxiosBuilder<DefaultError> = {
    mapResponse: res => {
        if (res.status >= 200 && res.status < 300) {
            return ["success", res.data];
        } else {
            return ["error", { message: JSON.stringify(res.data) }];
        }
    },
    mapNetworkError: (_req, message) => ({ message }),
};
