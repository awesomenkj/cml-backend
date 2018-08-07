import { Module } from '@nestjs/common';
import { GithubService } from './services/github.service';
import { GraphqlService } from './services/graphql.service';
import { PoolRequestService } from './services/pool-request.service';
import { PoolProcessorService } from './services/pool-processor.service';
import { ResponseProcessorService } from './services/response-processor.service';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [
        SharedModule
    ],
    providers: [
        GithubService,
        GraphqlService,
        PoolRequestService,
        PoolProcessorService,
        ResponseProcessorService
    ],
    exports: [
        GithubService
    ]
})
export class GithubModule {

}