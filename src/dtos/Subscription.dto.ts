import Stripe from 'stripe';
import {inMilliseconds} from '@Helpers';
import {ISubscription, ISubscriptionSuccess, IUserCommon} from '@Interfaces';

export class SubscriptionDto {
	static createSubscriptionDto(subData: ISubscriptionSuccess, user: IUserCommon): ISubscription {
		if (!subData) return {} as ISubscription;
		return {
			level: subData.level,
			createdAt: new Date(subData.createdAt),
			endAt: new Date(subData.endAt),
			subId: subData.subId,
			isExpired: subData.isExpired || false,
			productId: subData.productId,
			userId: user.id
		};
	}
}