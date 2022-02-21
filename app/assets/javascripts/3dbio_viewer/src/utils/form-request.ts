import { FutureData } from "../domain/entities/FutureData";
import _ from "lodash";
import { AxiosRequestConfig } from "axios";
import { request } from "../data/request-utils";
import { RequestResult } from "./future-axios";

type Params = Record<string, string | File | undefined>;

export function postFormRequest<ResponseData>(options: {
    url: string;
    params: Params;
}): FutureData<RequestResult<ResponseData>> {
    const { url, params } = options;
    const data = new FormData();
    const headers = {
        "content-type": "multipart/form-data",
        accept: "application/json",
    };

    _(params).forEach((value, key) => {
        if (value !== undefined && value !== null) {
            data.append(key, value);
        }
    });

    const reqOpts: AxiosRequestConfig = { method: "POST", url, data, headers };

    return request<ResponseData>(reqOpts);
}
