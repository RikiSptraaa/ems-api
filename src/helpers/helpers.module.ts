import { Module } from '@nestjs/common';
import { HelperService } from './helpers.service';

@Module({  
    providers: [HelperService],
    exports: [HelperService]
})
export class HelpersModule {}
