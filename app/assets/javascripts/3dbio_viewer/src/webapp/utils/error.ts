import _ from "lodash";
import { Error } from "../../domain/entities/FutureData";

export function setFromError(setError: (msg: string) => void, err: Error, baseMsg: string) {
    const parts = [baseMsg, err.message];
    setError(_.compact(parts).join(" - "));
}
