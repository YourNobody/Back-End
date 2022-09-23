import {Cloudinary} from '@ThirdParty/cloudinary.config';
import {IImageRequestBody, IImageResourceCloudinary, IImageSearchCloudinary, IImageUploadCloudinary} from "@Interfaces";

export class CloudinaryApi {
	private static folderName = process.env.CLOUDINARY_PHOTOS_FOLDER;

	static async uploadOneImage(imageBase64: string): Promise<IImageUploadCloudinary> {
		const response: IImageUploadCloudinary = await Cloudinary.uploader.upload(imageBase64, {
			upload_preset: CloudinaryApi.folderName,
			use_filename: true,
			phash: true,
			unique_filename: true,
			overwrite: true
		});
		return response;
	}

	static async uploadArrayOfImages(imagesToUpload: IImageRequestBody[]) {
		const results: IImageUploadCloudinary[] = [];

		for (const image of imagesToUpload) {
			const result = await CloudinaryApi.uploadOneImage(image.imageBase64);
			result && results.push(result);
		}

		return results;
	}

	static async getOneImage(assetId: string): Promise<IImageResourceCloudinary | null> {
		const response: IImageSearchCloudinary = await Cloudinary.search
			.expression(`folder:${CloudinaryApi.folderName} AND asset_id:${assetId.trim()}`)
			.execute();

		return response.resources[0] || null;
	}

	static async getAllImages() {
		const response: IImageSearchCloudinary = await Cloudinary.search
			.expression(`folder:${CloudinaryApi.folderName}`)
			.execute();

		return response.resources;
	}
}