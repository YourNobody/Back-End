import {useSend} from "@Helpers";
import {IImageCommon, MyRequest, MyResponse, WithImageBase64} from "@Interfaces";
import {CloudinaryApi} from "@ThirdParty/thirdPartyApi.api";
import {AssetsService} from "@Services";

export class AssetsController {
	static async saveImage(req: MyRequest<IImageCommon & WithImageBase64>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) return;
			const { imageBase64 } = req.body;
			if (!imageBase64) return new Error(`Image wasn't provided`);

			const result = await AssetsService.uploadOneImage(imageBase64);

			if (!result) throw new Error('Something went wrong');

			send(201, '', {result});
		} catch (e) {
			next(e);
		}
	}
	static async getOneImage(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) return;
			const { assetId } = req.params;

			const result = await AssetsService.getOneImage(assetId);

			send(200, '', { result })
		} catch (e) {
			next(e);
		}
	}
	static async getImages(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res)
		try {
			const images = await AssetsService.getAllImages();
			send(200, 'Images received', { images });
		} catch (e) {
			next(e);
		}
	}
	static async deleteImage() {}
}