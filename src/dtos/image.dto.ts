import {IImageCommon, IImageResourceCloudinary, IImageSearchCloudinary, IImageUploadCloudinary} from "@Interfaces";

export class ImageDto {
	static prepareImageToDatabase(resource: IImageUploadCloudinary) {
		const { format, bytes, asset_id: assetId, public_id: publicId, secure_url, url, etag } = resource;
		const imageToDatabase = {} as IImageCommon;

		Object.assign(imageToDatabase, {
			format, bytes, publicId, assetId, etag, imageUrl: secure_url || url
		});

		return imageToDatabase;
	}

	static imageFromCloudinary(resource: IImageResourceCloudinary) {
		const { format, bytes, asset_id: assetId, public_id: publicId, secure_url, url, etag } = resource;
		const image = {} as IImageCommon;

		Object.assign(image, {
			format, bytes, publicId, assetId, etag, imageUrl: secure_url || url
		});

		return image;
	}
}