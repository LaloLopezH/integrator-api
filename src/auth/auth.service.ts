import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/shared/logger/logger.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  
  constructor(
      @InjectRepository(User)
      private readonly userRepository:  Repository<User>,
      private readonly logger: LoggerService
    ){}

  async create(createUserDto: CreateUserDto) {
    try{
      const { password, ...userData } = createUserDto;

      const userEntity = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(userEntity);
      delete userEntity.password;

      return userEntity;
    }
    catch(error){
      this.logger.logError(`Error al crear usuario, error: ${error.message}`, error.stack);
      this.handleDBErrors(error);
    }    
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email: true, password: true }
    });

    if(!user){
      throw new UnauthorizedException("Credenciales no válidas");
    }

    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException("Credenciales no válidas");
    }

    return user;
  }

  async validateUser(username: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ 
        where: { email: username },
        select: { email: true, password: true }
      });

    if(!user){
        return false;
    }
      
    if(!bcrypt.compareSync(password, user.password)){
        return false;
    }

    return true;
  } 

  private handleDBErrors(error: any): never {
    if(error.code === '23505') { //Ya se encuentra registrado
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Se presentó un error, por favor revisar los logs');
  }
}
