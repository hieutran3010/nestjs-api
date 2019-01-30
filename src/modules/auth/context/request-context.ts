import { createNamespace, getNamespace } from 'cls-hooked';

export class RequestContext {
    readonly id: number;
    username: string;
    langCode: string;

    constructor() {
        this.id = Math.random();
    }

    public static buildRequestConext(httpRequest: any) {
        const headers = httpRequest.headers;
        if (headers.hasOwnProperty(requestContants.langCodeProperty)) {
            this.setLangCode(headers[requestContants.langCodeProperty]);
        }
    }
    public static setLangCode(langCode: string) {
        this._setRequestContext(requestContants.langCodeProperty, langCode);
    }

    public static setUserName(username: string) {
        this._setRequestContext(requestContants.userNameProperty, username);
    }

    private static _setRequestContext<T>(key: string, value: T) {
        const session = getNamespace(requestContants.namespace);
        session.set(key, value);
    }

    public static currentRequestContext(): RequestContext {
        const session = getNamespace(requestContants.namespace);
        const requestContext = new RequestContext();
        requestContext.username = session.get(requestContants.userNameProperty);
        requestContext.langCode = session.get(requestContants.langCodeProperty);
        return requestContext;
    }
}

export const initializeRequestContext = (ns) => {
    if (!ns) {
        throw new Error('CLS have not initialized yet!!!');
    }

    return function initializeContinuationLocalStorage(req, res, next) {
        ns.bindEmitter(req);
        ns.bindEmitter(res);

        ns.run(() => {
            next();
        });
    };
};

export const createSnorbsNamespace = () => {
    return createNamespace(requestContants.namespace);
};

const requestContants = {
    namespace: 'snorbs',
    userNameProperty: 'username',
    langCodeProperty: 'langcode'
};