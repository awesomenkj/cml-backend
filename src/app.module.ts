import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GithubModule } from './github/github.module';
import { CmcModule } from './cmc/cmc.module';
import { ParserModule } from './parser/parser.module';
@Module({
  imports: [
    GithubModule,
    CmcModule,
    ParserModule
  ],
  controllers: [AppController],
})
export class AppModule {}
