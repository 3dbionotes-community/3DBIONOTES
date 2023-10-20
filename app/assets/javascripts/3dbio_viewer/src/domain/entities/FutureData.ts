import { Future } from "../../utils/future";

export type Error = { message: string };

export type FutureData<Data> = Future<Error, Data>;

export function fromPromise<Data>(res: Promise<Data>): Future<Error, Data> {
    return Future.fromComputation((resolve, reject) => {
        res.then(resolve).catch(err => {
            return reject({ message: err.toString() });
        });

        return () => {};
    });
}
