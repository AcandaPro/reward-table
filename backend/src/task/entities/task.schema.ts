import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { TaskStatus } from './task-status.enum';
import { User } from '../../user/entities/user.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: TaskStatus, default: TaskStatus.NOT_STARTED })
  status: TaskStatus;

  @Prop({ required: true })
  points: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
