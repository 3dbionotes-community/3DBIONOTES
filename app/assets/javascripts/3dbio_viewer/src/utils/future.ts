import * as fluture from "fluture";
import _ from "lodash";

export class Future<E, D> {
    private constructor(private instance: fluture.FutureInstance<E, D>) {}

    run(onSuccess: Fn<D>, onError: Fn<E>): Cancel {
        return fluture.fork(onError)(onSuccess)(this.instance);
    }

    map<D2>(mapper: (data: D) => D2): Future<E, D2> {
        const instance2 = fluture.map(mapper)(this.instance);
        return new Future(instance2);
    }

    bimap<E2, D2>(dataMapper: (data: D) => D2, errorMapper: (error: E) => E2): Future<E2, D2> {
        const instance2 = fluture.bimap(errorMapper)(dataMapper)(this.instance);
        return new Future(instance2);
    }

    flatMap<D2>(mapper: (data: D) => Future<E, D2>): Future<E, D2> {
        const chainMapper = fluture.chain<E, D, D2>(data => mapper(data).instance);
        return new Future(chainMapper(this.instance));
    }

    flatMapError<E2>(mapper: (error: E) => Future<E2, D>): Future<E2, D> {
        const chainRejMapper = fluture.chainRej<E, E2, D>(error => mapper(error).instance);
        return new Future(chainRejMapper(this.instance));
    }

    toPromise(): Promise<D> {
        return new Promise((resolve, reject) => {
            this.run(resolve, reject);
        });
    }

    tap(effectFn: (data: D) => void): Future<E, D> {
        return this.map(data => {
            effectFn(data);
            return data;
        });
    }

    /* Static methods */

    static fromComputation<E, D>(computation: Computation<E, D>): Future<E, D> {
        return new Future(fluture.Future((reject, resolve) => computation(resolve, reject)));
    }

    static success<D, E = unknown>(data: D): Future<E, D> {
        return new Future<E, D>(fluture.resolve(data));
    }

    static error<E, D = unknown>(error: E): Future<E, D> {
        return new Future<E, D>(fluture.reject(error));
    }

    static join2<E, D1, D2>(future1: Future<E, D1>, future2: Future<E, D2>): Future<E, [D1, D2]> {
        const instance = fluture.both(future1.instance)(future2.instance);
        return new Future(instance);
    }

    static parallel<E, D>(
        futures: Array<Future<E, D>>,
        options: { maxConcurrency?: number } = {}
    ): Future<E, Array<D>> {
        const { maxConcurrency = 10 } = options;
        const parallel = fluture.parallel(maxConcurrency);
        const instance = parallel(futures.map(future => future.instance));
        return new Future(instance);
    }

    static joinObj<FuturesObj extends Record<string, Future<any, any>>>(
        futuresObj: FuturesObj,
        options: { maxConcurrency?: number } = {}
    ): JoinObj<FuturesObj> {
        const { maxConcurrency = 10 } = options;
        const parallel = fluture.parallel(maxConcurrency);
        const keys = _.keys(futuresObj);
        const futures = _.values(futuresObj);
        const flutures = parallel(futures.map(future => future.instance));
        const futureObj = new Future(flutures).map(values => _.zipObject(keys, values));
        return futureObj as JoinObj<FuturesObj>;
    }
}

type JoinObj<Futures extends Record<string, Future<any, any>>> = Future<
    ExtractFutureError<Futures[keyof Futures]>,
    { [K in keyof Futures]: ExtractFutureData<Futures[K]> }
>;

type ExtractFutureData<F> = F extends Future<any, infer D> ? D : never;
type ExtractFutureError<F> = F extends Future<infer E, any> ? E : never;

type Fn<T> = { (value: T): void };

export type Cancel = { (): void };

export const noCancel: Cancel = () => {};

export type Computation<E, D> = (resolve: Fn<D>, reject: Fn<E>) => fluture.Cancel;

export function wait<E>(ms: number): Future<E, void> {
    return Future.fromComputation(resolve => {
        const timeoutId = setTimeout(resolve, ms);
        return () => clearTimeout(timeoutId);
    });
}
