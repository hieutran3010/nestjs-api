import { isNullOrEmptyOrUndefined } from '../core/util';

export class StringUtil{
    public static truncate(fullContent: string, truncLength = 300)
    {
        if (isNullOrEmptyOrUndefined(fullContent)){
            return '';
        }

        if (fullContent.length <= truncLength)
        {
          return fullContent;
        }

        return `${fullContent.substring(0, truncLength)}...`;
    }
}