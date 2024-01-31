import { Container } from 'typescript-ioc';
import config from '#/core/infrastructure/configuration/ioc.config';
import { MongoDb } from '#/core/infrastructure/mongodb';
import { Bots } from '#/bots/interfaces';

Container.configure(...config);

export const handler = async () => {
  await Container.get(MongoDb).connect();
  await Container.get(Bots).run();
};

handler();
