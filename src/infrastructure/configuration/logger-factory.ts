import { Logger } from '@vizir/simple-json-logger';
import { ObjectFactory } from 'typescript-ioc';

export const loggerFactory: ObjectFactory = () => {
  return new Logger({
    app: 'X2Green',
  });
};
