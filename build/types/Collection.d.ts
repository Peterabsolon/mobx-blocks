import { ICollectionGenerics, ICollectionProps, IFetchFnOptions } from "./Collection.types";
export declare class Collection<IGenerics extends ICollectionGenerics> {
    props: ICollectionProps<IGenerics>;
    data: import("mobx").IObservableArray<IGenerics["data"]>;
    initialized: boolean;
    filtersMap: import("mobx").ObservableMap<any, any>;
    searchQuery: string;
    fetching: boolean;
    fetchErr?: unknown;
    searching: boolean;
    searchErr?: unknown;
    constructor(props: ICollectionProps<IGenerics>);
    get filters(): IGenerics["filters"];
    private syncFetchParamsToUrl;
    private handleSearch;
    /**
     * Perform fetch API request
     */
    fetch: (opts?: IFetchFnOptions<IGenerics["filters"]>) => Promise<void>;
    /**
     * Set fetch filters
     */
    setFetchParams: (filters: IGenerics["filters"]) => Promise<void>;
    /**
     * Merge fetch filters
     */
    mergeFetchParams: (filters: IGenerics["filters"]) => Promise<void>;
    /**
     * Clear all fetch filters from state
     */
    clearFetchParams: () => void;
    /**
     * Clear specific fetch param from state
     */
    clearFetchParam: (key: keyof IGenerics["filters"]) => void;
    /**
     * Reset fetch filters to defaults (passed in the constructor)
     */
    resetFetchParams: () => void;
    /**
     * Perform debounced search using search query and fetch filters
     */
    search: (query: string, opts?: IFetchFnOptions<IGenerics["filters"]>) => Promise<void>;
    /**
     * Reset all state to initial
     */
    resetState: () => void;
}
