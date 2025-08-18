import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
}

export class UpdateUserPasswordDto {
    password: string; // This is the current password
    newPassword: string; // This is the new password to set
    confirmNewPassword: string; // This is the confirmation of the new password
}
