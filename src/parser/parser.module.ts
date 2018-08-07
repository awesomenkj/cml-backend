import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ParserService } from './services/parser.service';

@Module({
    imports: [
        SharedModule
    ],
    providers: [
        ParserService
    ],
    exports: [
        ParserService
    ]
})
export class ParserModule {

}