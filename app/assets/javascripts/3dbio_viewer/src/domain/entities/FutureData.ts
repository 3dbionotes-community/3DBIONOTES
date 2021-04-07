import { Future } from "../../utils/future";

export type Error = { message: string };

export type FutureData<Data> = Future<Error, Data>;
