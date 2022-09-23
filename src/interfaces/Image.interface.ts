import {Model, Document} from "mongoose";

export interface IImageRequestBody extends WithImageBase64 {}

export interface IImageCommon {
	bytes: number;
	format: string;
	publicId: string;
	assetId: string;
	imageUrl: string;
	etag: string;
}

export interface WithImageBase64 {
	imageBase64: string;
}

export interface IImageUploadCloudinary {
	asset_id?: string;
	public_id: string;
	version: number;
	version_id?: string;
	signature: string;
	width: number;
	height: number;
	format: string;
	resource_type: string;
	created_at: string;
	tags: any[];
	bytes: number;
	type: string;
	etag: string;
	placeholder: boolean;
	url: string;
	secure_url: string;
	access_mode: string;
	api_key?: string;
}

export interface IImageSearchCloudinary {
	total_count: number;
	time: number;
	resources: IImageResourceCloudinary[];
	rate_limit_allowed: number;
	rate_limit_reset_at: Date;
	rate_limit_remaining: number;
}

export interface IImageResourceCloudinary {
	asset_id: string;
	public_id: string;
	folder: string;
	filename: string;
	display_name?: any;
	format: string;
	version: number;
	resource_type: string;
	type: string;
	created_at: Date;
	uploaded_at: Date;
	bytes: number;
	backup_bytes: number;
	width: number;
	height: number;
	aspect_ratio: number;
	pixels: number;
	url: string;
	secure_url: string;
	status: string;
	access_mode: string;
	access_control?: any;
	etag: string;
	created_by: CreatedBy;
	uploaded_by: UploadedBy;
}

interface CreatedBy {
	access_key: string;
}

interface UploadedBy {
	access_key: string;
}

export interface IImage extends IImageCommon, Document {}

export interface ImageModel extends Model<IImage> {
	build: (imageData: IImageCommon) => IImage;
}