import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { isNil } from 'ramda';

function LoadYamlConfigure<T>(clazz: { new(): T }, configFileName: string, encoding?: string): T {
    try {
        const config = yaml.safeLoad(readFileSync(configFileName, isNil(encoding) ? 'utf8' : encoding));
        return Object.assign(new clazz(), config);
    } catch (e) {
        return new clazz();
    }
}

export { LoadYamlConfigure };