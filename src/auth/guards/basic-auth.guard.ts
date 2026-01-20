import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicAuthGuard implements CanActivate {

    constructor(private readonly authService: AuthService) 
    { }
    
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

      if (!authHeader) {
        throw new UnauthorizedException('Missing Authorization header');
      }

      const [authType, base64Credentials] = authHeader.split(' ');
      if (authType !== 'Basic' || !base64Credentials) {
        throw new UnauthorizedException('Invalid Authorization header');
      }

      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');

      if (this.authService.validateUser(username, password)) {
        return true;
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
  }
}