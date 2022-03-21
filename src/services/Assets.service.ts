import {CloudinaryApi} from "@ThirdParty/thirdPartyApi.api";
import {ImageDto} from "@Dtos";
// import {Image} from "@Models";
import {IImageResourceCloudinary, IImageSearchCloudinary} from "@Interfaces";

export class AssetsService {
	static async uploadOneImage(imageBase64: string) {
		const uploadedInfo = await CloudinaryApi.uploadOneImage(imageBase64);

		if (!uploadedInfo) throw new Error('Something went wrong');
		const imageToDatabase = ImageDto.prepareImageToDatabase(uploadedInfo)

		// const image = new Image(imageToDatabase);
		// await image.save();

		return imageToDatabase;
	}

	// static async checkSimilar(imagesEtagsDB: any) {
	// 	const allImages = await CloudinaryApi.getAllImages();
	// 	const cloudinaryImagesEtags = allImages.map(img => img.etag);
	//
	// 	const unique: IImageResourceCloudinary[] = [];
	// 	const similar: IImageResourceCloudinary[] = [];
	//
	// 	for (let etagDB of imagesEtagsDB) {
	// 		let hasTheSame = false;
	// 		for (let etagCloud of cloudinaryImagesEtags) {
	// 			if (etagDB === etagCloud) hasTheSame = true;
	// 		}
	// 		const img = allImages.find(img => img.etag === etagDB);
	//
	// 		if (img) {
	// 			if (hasTheSame) similar.push(img);
	// 			else unique.push(img);
	// 		}
	// 	}
	//
	// 	return [unique, similar];
	// }

	static async getAllImages() {
		const images = (await CloudinaryApi.getAllImages())
			.map(img => ImageDto.imageFromCloudinary(img));

		return images;
	}

	static async getOneImage(assetId: string) {
		const imageFromCloudinary = await CloudinaryApi.getOneImage(assetId);

		if (!imageFromCloudinary) return null;
		return ImageDto.imageFromCloudinary(imageFromCloudinary);
	}
}