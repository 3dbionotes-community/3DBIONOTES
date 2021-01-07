import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { Future } from "./future";

type AxiosRequest = AxiosRequestConfig;

export interface AxiosBuilder<E, D = unknown> {
    mapResponse(response: AxiosResponse<unknown>): ["success", D] | ["error", E];
    mapNetworkError: (request: AxiosRequestConfig, message: string) => E;
}

export function axiosRequest<E, D>(builder: AxiosBuilder<E>, request: AxiosRequest): Future<E, D> {
    return Future.fromComputation<E, D>((resolve, reject) => {
        if (debug) console.debug("->", request.method, request.url);
        const source = axios.CancelToken.source();

        const fullRequest: AxiosRequest = {
            ...request,
            validateStatus: _status => true,
            cancelToken: source.token,
        };

        axios
            .request(fullRequest)
            .then(res => {
                if (debug) console.debug("<-", fullRequest.method, fullRequest.url, res.status);
                const result = builder.mapResponse(res);
                if (result[0] === "success") {
                    resolve(result[1] as D);
                } else {
                    reject(result[1]);
                }
            })
            .catch(err => {
                if (debug) console.debug("<-", fullRequest.method, fullRequest.url, err.message);
                const message = (err && err.message) || "Unknown error";
                reject(builder.mapNetworkError(fullRequest, message));
            });

        return () => source.cancel();
    });
}

// TODO: https://www.npmjs.com/package/debug
let debug = false;

export function setDebug(value: boolean): void {
    debug = value;
}
