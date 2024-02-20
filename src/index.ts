import { Container } from 'typescript-ioc';
import config from '#/infrastructure/configuration/ioc.config';
import { MongoDb } from '#/infrastructure/mongodb';
import { Bots } from '#/interfaces';

Container.configure(...config);

export const handler = async () => {
  await Container.get(MongoDb).connect();
  await Container.get(Bots).run();
};

handler();
