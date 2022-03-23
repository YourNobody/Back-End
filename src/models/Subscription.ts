import { model, Schema } from 'mongoose'
import { ISubscription } from '@Interfaces'
import { refs } from '@Models/refs'

const SubscriptionSchema = new Schema<ISubscription>({
  subId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  level: { type: String, required: true },
  startedAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
});

export const Subscription = model<ISubscription>(refs.SUBSCRIPTION, SubscriptionSchema);