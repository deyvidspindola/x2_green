import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { ConfigRepository } from '#/core/domain/repository/config.repository';
import { MongoConfigRepository } from '#/core/infrastructure/mongodb/repository/mongo.config.reporitory';
import { ChatRepository } from '#/bots/domain/repository/chat.repository';
import { MongoChatRepository } from '#/core/infrastructure/mongodb/repository/mongo.chat.reporitory';
import { GameRepository } from '#/bots/domain/repository/game.repository';
import { MongoGameRepository } from '#/core/infrastructure/mongodb/repository/mongo.game.repository';
import { MessageRepository } from '#/bots/domain/repository/message.repository';
import { MongoMessageRepository } from '#/core/infrastructure/mongodb/repository/mongo.message.repository';

const configDevFile = () => yaml.load(fs.readFileSync('config/server-config.yml', 'utf8'));

export default [
  { bindName: 'config', to: configDevFile() },
  { bind: ChatRepository, to: MongoChatRepository },
  { bind: GameRepository, to: MongoGameRepository },
  { bind: MessageRepository, to: MongoMessageRepository },
  { bind: ConfigRepository, to: MongoConfigRepository },
];
