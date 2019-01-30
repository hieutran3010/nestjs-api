const AUTH_METADATA_KEYS = {
    MULTI_JWT_STRATEGY: '__multiJwtStrategy__',
};

function UseJwtStrategy(name: string): ClassDecorator {
    return (target: object) => {
        Reflect.defineMetadata(AUTH_METADATA_KEYS.MULTI_JWT_STRATEGY, name, target);
    };
}

export {
    UseJwtStrategy,
    AUTH_METADATA_KEYS,
};