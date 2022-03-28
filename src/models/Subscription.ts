import { model, Schema } from 'mongoose'
import {ISubscription, ISubscriptionModel, ISubscriptionSuccess, IUserCommon} from '@Interfaces';
import { refs } from '@Models/refs'
import {SubscriptionDto} from '../dtos/Subscription.dto';

const SubscriptionSchema = new Schema<ISubscription>({
  subId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: refs.USER },
  level: { type: String, required: true },
  isExpired: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  productId: { type: String, required: true }
});

SubscriptionSchema.statics.build = (subData: ISubscriptionSuccess, userData: IUserCommon) => {
  const subToDB = SubscriptionDto.createSubscriptionDto(subData, userData);
  const subDB = new Subscription(subToDB);
  return subDB;
}

export const Subscription = model<ISubscription, ISubscriptionModel>(refs.SUBSCRIPTION, SubscriptionSchema);