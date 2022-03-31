import { FutureData, Error } from "../domain/entities/FutureData";
import { Future } from "./future";

export function readFile(file: File): FutureData<string> {
    return Future.fromComputation<Error, string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onabort = () => reject({ message: "File reading was aborted" });

        reader.onerror = () => reject({ message: "File reading has failed" });

        reader.onload = () => {
            const { result } = reader;

            if (typeof result !== "string") {
                reject({ message: "Invalid result type" });
            } else {
                resolve(result);
            }
        };

        reader.readAsText(file);

        return () => {};
    });
}
