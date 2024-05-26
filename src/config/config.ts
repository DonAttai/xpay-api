import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";

export const config: TypeOrmModuleAsyncOptions = {
  useFactory: async (configService: ConfigService) => {
    if (process.env.NODE_ENV === "development") {
      return {
        type: "mysql",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        synchronize: true,
        autoLoadEntities: true,
      };
    }

    return {
      type: "mysql",
      url: configService.get("DB_URI"),
      synchronize: true,
      autoLoadEntities: true,
    };
  },
  inject: [ConfigService],
};
