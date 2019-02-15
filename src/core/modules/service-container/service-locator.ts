import { Injectable } from '@nestjs/common';
import { find, get, isEmpty } from 'lodash';
import { Guid } from '../../utils';
import { IContainerInstance, NestJSExtendContainer } from './contract';

@Injectable()
export default class ServiceLocator {
    private container = new NestJSExtendContainer();

    register(
        type: symbol,
        bindingValue: any) {
        const instance: IContainerInstance = {
            id: Guid.newGuid(),
            type,
            instance: bindingValue,
        };
        this.container.instances.push(instance);
    }

    lookUp(type: symbol): any {
        if (isEmpty(this.container.instances)) {
            return undefined;
        }

        const containerInstance = find(this.container.instances, {type});

        return get(containerInstance, 'instance', undefined);
    }
}