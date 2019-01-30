import { isNil } from 'ramda';
import { RequestContext } from '../../modules/auth/context/request-context';
import { isNullOrEmptyOrUndefined } from '../util';

export class IdentityHelper {
    public static getUsername(): string {
        let result = 'system';
        const currentContext = RequestContext.currentRequestContext();
        if (!isNil(currentContext) && !isNullOrEmptyOrUndefined(currentContext.username)) {
            result = currentContext.username;
        }

        return result;
    }
}