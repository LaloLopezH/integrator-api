import { Injectable } from '@nestjs/common';

@Injectable()
export class HeartbeatService {
  private isActive = true;

  enable() {
    this.isActive = true;
  }

  disable() {
    this.isActive = false;
  }

  isEnabled(): boolean {
    return this.isActive;
  }
}
