import { FilterQuery, Model, Document, AnyKeys, EnforceDocument } from "mongoose";

export class MongoBD<ModelTarget> {
  constructor(private readonly model: Model<ModelTarget>) {
    this.model = model;
  }

  readonly getOne = async (key: FilterQuery<ModelTarget>): Promise<Document<any, any, ModelTarget>> => {
    const candidate = await this.model.findOne(key);
    if (!candidate) throw new Error();
    return candidate;
  }

  readonly getAll = async (key: FilterQuery<ModelTarget>) => {
    const candidate = await this.model.find(key);
    if (!candidate) throw new Error();
  }

  readonly getById = async (id: string): Promise<Document<any, any, ModelTarget>> => {
    const candidate = await this.model.findById(id);
    if (!candidate) throw new Error();
    return candidate;
  }

  readonly create = (data: AnyKeys<ModelTarget>): EnforceDocument<ModelTarget, {}> => {
    const candidate = new this.model(data);
    return candidate;
  }

  readonly save = async (candidate: Document<any, any, ModelTarget> & ModelTarget) => {
    try {
      if (!candidate) throw new Error();
      await candidate.save();
    } catch (error) {
      throw error;
    }
  }
}