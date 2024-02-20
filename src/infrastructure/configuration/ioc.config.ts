import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { ConfigRepository } from '#/domain/repository/config.repository';
import { MongoConfigRepository } from '#/infrastructure/mongodb/repository/mongo.config.reporitory';
import { ChatRepository } from '#/domain/repository/chat.repository';
import { MongoChatRepository } from '#/infrastructure/mongodb/repository/mongo.chat.reporitory';
import { GameRepository } from '#/domain/repository/game.repository';
import { MongoGameRepository } from '#/infrastructure/mongodb/repository/mongo.game.repository';
import { MessageRepository } from '#/domain/repository/message.repository';
import { MongoMessageRepository } from '#/infrastructure/mongodb/repository/mongo.message.repository';

const configDevFile = () => yaml.load(fs.readFileSync('config/server-config.yml', 'utf8'));

export default [
  { bindName: 'config', to: configDevFile() },
  { bind: ChatRepository, to: MongoChatRepository },
  { bind: GameRepository, to: MongoGameRepository },
  { bind: MessageRepository, to: MongoMessageRepository },
  { bind: ConfigRepository, to: MongoConfigRepository },
];
