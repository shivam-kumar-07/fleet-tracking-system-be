import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FleetGateway } from "./ws/fleet.gateway";
import { AppController } from "./app.controller";
import { FleetModule } from "./modules/fleet/fleet.module";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    FleetModule,
  ],
  controllers: [AppController],
  providers: [FleetGateway,AppService],
})
export class AppModule {}
