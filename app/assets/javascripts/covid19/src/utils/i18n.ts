import i18n from "../locales";

export function t<Str extends string>(s: Str, namespace?: GetNamespace<Str>): string {
    return i18n.t(s, namespace);
}

interface Options {
    nsSeparator: string | boolean;
}

type GetNamespace<Str extends string> = Record<ExtractVars<Str>, string | number> &
    Partial<Options>;

type ExtractVars<Str extends string> = Str extends `${string}{{${infer Var}}}${infer StrRest}`
    ? Var | ExtractVars<StrRest>
    : never;

export function translationsFor<K extends string | undefined>(
    obj: Record<Extract<K, string>, string>
): Record<Extract<K, string> | "", string> {
    return { ...obj, "": "" } as Record<Extract<K, string> | "", string>;
}

/* Tests */

type IsEqual<T1, T2> = [T1] extends [T2] ? ([T2] extends [T1] ? true : false) : false;
const assertEqualTypes = <T1, T2>(_eq: IsEqual<T1, T2>): void => {};

assertEqualTypes<ExtractVars<"">, never>(true);
assertEqualTypes<ExtractVars<"name={{name}}">, "name">(true);
assertEqualTypes<ExtractVars<"name={{name}} age={{age}}">, "name" | "age">(true);

const i18nTyped = { t };

export default i18nTyped;
