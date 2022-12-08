import { ICollectionGenerics, ICollectionProps, IFetchFnOptions, ISetQueryParamsFnOptions } from "./Collection.types";
export declare class Collection<IGenerics extends ICollectionGenerics> {
    props: ICollectionProps<IGenerics>;
    data: import("mobx").IObservableArray<IGenerics["data"]>;
    initialized: boolean;
    fetching: boolean;
    fetchErr?: unknown;
    fetchParams: IGenerics["fetchParams"];
    searchQuery: string;
    searching: boolean;
    searchErr?: unknown;
    constructor(props: ICollectionProps<IGenerics>);
    handleSearch: (opts: {
        shouldThrowError?: boolean;
    }) => Promise<void>;
    init: (opts?: IFetchFnOptions<IGenerics["fetchParams"]>) => Promise<void>;
    fetch: (opts?: IFetchFnOptions<IGenerics["fetchParams"]>) => Promise<void>;
    clearFetchParam: (key: keyof IGenerics["fetchParams"]) => void;
    setFetchParams: (params: IGenerics["fetchParams"], opts?: ISetQueryParamsFnOptions) => Promise<void>;
    search: (query: string, opts?: IFetchFnOptions<IGenerics["fetchParams"]>) => Promise<void>;
    clear: () => void;
}
