interface IPermissionControlller {
    key: string;
    name: string;
}

interface IPermissionDatabaseExecutor {
    saveToDb(info: IPermissionControlller): Promise<any>;
    bulkSaveToDb(infos: IPermissionControlller[]): Promise<any>;
}

export {IPermissionControlller, IPermissionDatabaseExecutor};