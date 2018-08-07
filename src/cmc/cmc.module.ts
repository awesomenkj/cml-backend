import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { CmcService } from './services/cmc.service';
import { PoolRequestService } from './services/pool-request.service';
import { ResponseProcessorService } from './services/response-processor.service';
@Module({
    imports: [
        SharedModule
    ],
    providers: [
        CmcService,
        PoolRequestService,
        ResponseProcessorService
    ],
    exports: [
        CmcService
    ]
})
export class CmcModule {

}