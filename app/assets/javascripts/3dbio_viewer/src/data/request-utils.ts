import { AxiosRequestConfig } from "axios";
import xml2js from "xml2js";
import { Future } from "../utils/future";
import { axiosRequest, defaultBuilder } from "../utils/future-axios";

export type RequestError = { message: string };

function getFromUrl<Data>(url: string): Future<RequestError, Data> {
    return request<Data>({ method: "GET", url });
}

export function getJSON<Data>(url: string): Future<RequestError, Data | undefined> {
    const data$ = getFromUrl<Data>(url) as Future<RequestError, Data | undefined>;

    return data$.flatMapError(_err => {
        console.debug(`Cannot get data: ${url}`);
        return Future.success(undefined);
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

export function request<Data>(request: AxiosRequestConfig): Future<RequestError, Data> {
    return axiosRequest<RequestError, Data>(defaultBuilder, request);
}
