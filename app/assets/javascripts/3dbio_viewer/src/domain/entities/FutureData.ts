import { Future } from "../../utils/future";

type Error = { message: string };

export type FutureData<Data> = Future<Error, Data>;
