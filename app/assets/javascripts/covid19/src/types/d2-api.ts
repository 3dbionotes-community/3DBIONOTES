import { D2Api } from "d2-api/2.32";
import { getMockApiFromClass } from "d2-api";

export * from "d2-api/2.32";
export const getMockApi = getMockApiFromClass(D2Api);
