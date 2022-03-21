// import {Schema, model, SchemaType, Document} from "mongoose";
// import { refs } from "@Models/refs";
//
// import {IImage, IImageCommon, ImageModel} from "@Interfaces";
//
// const ImageSchema = new Schema<IImage>({
// 	format: { type: String, required: true},
// 	imageUrl: { type: String, required: true },
// 	publicId: { type: String, required: true },
// 	assetId: { type: String, required: true },
// 	bytes: { type: Number, required: true },
// 	etag: { type: String, required: true }
// }, { versionKey: false });
//
// ImageSchema.statics.build = (imageData: IImageCommon): IImage => {
// 	return new Image(imageData);
// };
//
// export const Image = model<IImage, ImageModel>(refs.IMAGE, ImageSchema);
//
