import { AxiosRequestConfig } from "axios";
import { Codec } from "purify-ts/Codec";
import xml2js from "xml2js";
import { FutureData } from "../domain/entities/FutureData";
import { parseFromCodec } from "../utils/codec";
import { Future } from "../utils/future";
import { axiosRequest, defaultBuilder, RequestResult } from "../utils/future-axios";
import { Maybe } from "../utils/ts-utils";
import { getStorageCache, hashUrl, setStorageCache } from "./storage-cache";

export type RequestError = { message: string };

const timeout = 30e3;

export function getFromUrl<Data>(url: string): Future<RequestError, Data> {
    return request<Data>({ method: "GET", url, timeout }).map(res => res.data);
}

export function getTextFromUrl(url: string): Future<RequestError, string> {
    return request<string>({
        method: "GET",
        url,
        timeout,
        responseType: "text",
        transformResponse: [data => data],
    }).map(res => res.data);
}

export function getJSONData<Data>(url: string): FutureData<Data> {
    return getFromUrl<Data>(url);
}

export function getJSON<Data>(url: string): Future<RequestError, Maybe<Data>> {
    const data$ = getFromUrl<Data>(url) as Future<RequestError, Maybe<Data>>;

    return data$.flatMapError(_err => {
        console.debug(`Cannot get data: ${url}`);
        return Future.success(undefined);
    });
}

export function getValidatedJSON<Data>(
    url: string,
    codec: Codec<Data>
): Future<RequestError, Maybe<Data>> {
    const text$ = getTextFromUrl(url) as Future<RequestError, Maybe<string>>;

    return text$
        .flatMapError(_err => {
            console.debug(`No data: ${url}`);
            return Future.success(undefined) as Future<RequestError, Maybe<string>>;
        })
        .flatMap(s => {
            return s ? parseFromCodec(codec, s) : Future.success(undefined);
        });
}

export function getXML<Data>(url: string): Future<RequestError, Data | undefined> {
    const data$ = getJSON<string>(url);

    return data$.flatMap(xml => {
        return xml ? xmlToJs<Data>(xml) : Future.success(undefined);
    });
}

function xmlToJs<Data>(xml: string): Future<RequestError, Data> {
    const parser = new xml2js.Parser();

    return Future.fromComputation((resolve, reject) => {
        parser.parseString(xml, (err: any, result: Data) => {
            if (err) {
                reject({ message: err ? err.toString() : "Unknown error" });
            } else {
                resolve(result);
            }
        });
        return () => {};
    });
}

export function request<Data>(
    request: AxiosRequestConfig
): Future<RequestError, RequestResult<Data>> {
    if (!request.url) {
        return axiosRequest(defaultBuilder, request);
    }

    const params = request.params
        ? JSON.stringify(request.params, Object.keys(request.params).sort())
        : "";

    const cacheKey = hashUrl(request.url + params);
    const cachedResult = getStorageCache<RequestResult<Data>>(cacheKey);
    if (cachedResult) return Future.success(cachedResult);

    return axiosRequest<RequestError, Data>(defaultBuilder, request).map(result => {
        if (result.response.status >= 200 && result.response.status < 300) {
            setStorageCache(cacheKey, result);
        }
        return result;
    });
}
