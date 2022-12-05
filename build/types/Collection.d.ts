interface TCollectionGenerics {
    id: number | string;
    data: {
        id: TCollectionGenerics["id"];
    };
}
interface ICollectionProps<IGenerics extends TCollectionGenerics> {
    fetchFn: () => Promise<IGenerics["data"][]>;
}
export declare class Collection<IGenerics extends TCollectionGenerics> {
    props: ICollectionProps<IGenerics>;
    data: import("mobx").IObservableArray<IGenerics["data"]>;
    fetching: boolean;
    fetchErr?: unknown;
    initialized: boolean;
    constructor(props: ICollectionProps<IGenerics>);
    init: () => Promise<void>;
}
export {};
