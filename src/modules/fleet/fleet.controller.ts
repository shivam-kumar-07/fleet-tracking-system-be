
import { Controller, Get } from '@nestjs/common';
import { FleetService } from './fleet.service';

@Controller('/vehicles')
export class FleetController {
  constructor(private readonly fleet: FleetService) {}
  @Get() list() { return this.fleet.getVehicles(); }
}
