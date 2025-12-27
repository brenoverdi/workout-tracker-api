import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model';
import { UpdateProfileDto } from '../user.dto';

@Injectable()
export class UpdateProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    Object.assign(user, updateProfileDto);

    const updatedUser = await this.userRepository.save(user);

    // Remove sensitive data
    const { password, refreshToken, ...userWithoutSensitiveData } = updatedUser;
    return userWithoutSensitiveData;
  }
}
