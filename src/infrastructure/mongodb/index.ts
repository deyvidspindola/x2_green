import { MongoClient } from 'mongodb';
import { Container, Factory, Inject, ObjectFactory } from 'typescript-ioc';
import { Configurations } from '#/infrastructure/configuration/configurations';
import { _sendSuport, _sendSuportError } from '#/domain/utils';

export const repositoryRegisterStoreFactory: ObjectFactory = () => {
  const config = Container.get(Configurations);
  const mongodb = new MongoClient(
    `${config.mongoDbDriver}://${config.mongoDbUsename}:${config.mongoDbPassword}@${config.mongoDbUri}/?retryWrites=true&w=majority`,
  );
  return new MongoDb(mongodb);
};

@Factory(repositoryRegisterStoreFactory)
export class MongoDb {
  constructor(@Inject private readonly mongodb: MongoClient) {}

  async connect() {
    try {
      await this.mongodb.connect();
      _sendSuport('MongoDB => Connected to MongoDB');
      console.log('Connected to MongoDB');
    } catch (error) {
      _sendSuportError(`MongoDB => Error connecting to MongoDB`);
      console.log(error);
    }
  }

  client() {
    return this.mongodb;
  }
}
