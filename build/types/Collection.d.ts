import { ICollectionProps, IInitFnOptions, ICollectionGenerics } from "./Collection.types";
export declare class Collection<IGenerics extends ICollectionGenerics> {
    props: ICollectionProps<IGenerics>;
    data: import("mobx").IObservableArray<IGenerics["data"]>;
    fetching: boolean;
    fetchErr?: unknown;
    initialized: boolean;
    constructor(props: ICollectionProps<IGenerics>);
    init: (opts?: IInitFnOptions) => Promise<void>;
}
