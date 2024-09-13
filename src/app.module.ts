import { Logger, Module } from '@nestjs/common';
import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'node:process';
import { JwtModule } from './shared/modules/jwt/jwt.module';
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './src/environment/.development.env',
      isGlobal: true,
    }),
    CacheModule.register({
      store: process.env.CACHE_STORE ,
      ttl: 1000*60*10*60,
      isGlobal: true,
    }),
    AuthModule,
    JwtModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
  ],

})
export class AppModule {}
