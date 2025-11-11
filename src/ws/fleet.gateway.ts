
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { FleetService } from '../modules/fleet/fleet.service';

@WebSocketGateway({ cors: { origin: '*' }, path: '/socket.io/' })
export class FleetGateway implements OnModuleInit {
  @WebSocketServer() server: Server;
  constructor(private readonly fleet: FleetService) {}
  onModuleInit() {
    const ms = Number(process.env.TICK_MS || 2000);
    setInterval(() => {
      const updates = this.fleet.tick();
      this.server.emit('vehicle_updates', updates);
    }, ms);
  }
}
