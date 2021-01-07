import { Future as GenericFuture } from "../../utils/future";

type Error = { message: string };

export type FutureData<Data> = GenericFuture<Error, Data>;
