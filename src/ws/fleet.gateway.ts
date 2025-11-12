import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { FleetService } from '../modules/fleet/fleet.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class FleetGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly fleet: FleetService) {}

  // ✅ Instead of auto interval, tick triggered by client
  @SubscribeMessage('request_tick')
  handleTick() {
    const updates = this.fleet.tick();
    return updates;
  }
}
