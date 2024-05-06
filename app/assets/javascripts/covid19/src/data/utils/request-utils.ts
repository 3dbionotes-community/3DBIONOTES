import { AxiosRequestConfig } from "axios";
import { Codec } from "purify-ts/Codec";
import { parseFromCodec } from "./codec";
import { axiosRequest, defaultBuilder, RequestResult } from "../utils/future-axios";
import { Future } from "../utils/future";
import { Maybe } from "../utils/ts-utils";
import { FutureData } from "../../domain/entities/FutureData";
import i18n from "../../utils/i18n";

export type RequestError = { message: string };

const timeout = 75e3;

export function getFromUrl<Data>(url: string): Future<RequestError, Data> {
    return request<Data>({ method: "GET", url, timeout }).map(res => res.data);
}

export function getTextFromUrl(url: string): Future<RequestError, string> {
    return request<string>({
        method: "GET",
        url,
        timeout,
        responseType: "text",
        timeoutErrorMessage: i18n.t("Request timed out: " + timeout / 1000 + " seconds"),
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

export function request<Data>(
    request: AxiosRequestConfig
): Future<RequestError, RequestResult<Data>> {
    return axiosRequest(defaultBuilder, request);
}
