export interface ICollectionGenerics {
    id: number | string;
    data: {
        id: ICollectionGenerics["id"];
    };
}
export interface ICollectionProps<IGenerics extends ICollectionGenerics> {
    fetchFn: () => Promise<IGenerics["data"][]>;
}
export interface IInitFnOptions {
    shouldThrowError?: boolean;
}
