import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Viewer = 'viewer',
}

@Schema()
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ enum: UserRole, default: UserRole.Viewer })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
