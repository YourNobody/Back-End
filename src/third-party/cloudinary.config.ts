import cloudinary_js_config from "cloudinary";

export const Cloudinary = cloudinary_js_config.v2;

Cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});