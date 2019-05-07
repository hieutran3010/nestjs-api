class NestJSExtendContainer {
    instances: IContainerInstance[] = [];
}

interface IContainerInstance {
    id: string;
    instance: any;
    type: symbol;
}

export { NestJSExtendContainer, IContainerInstance };