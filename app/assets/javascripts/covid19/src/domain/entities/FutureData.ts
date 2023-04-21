import { Future } from "../../data/utils/future";

export type Error = { message: string };

export type FutureData<Data> = Future<Error, Data>;
