import { IUser } from "interfaces/User.interface";
import { AnyKeys, FilterQuery, Model, Document } from "mongoose";
import { MongoBD } from "./Mongo.controller";

export class UserControl {
  private userBD: MongoBD<IUser>;
  private self: Document<any, any, IUser> & IUser | null;

  constructor(readonly userModel: Model<IUser>, ) {
    this.userBD = new MongoBD<IUser>(userModel);
    this.self = null;
  }

  readonly getOne = async (key: FilterQuery<IUser>) => {
    const candidate = await this.userBD.getOne(key);
    if (candidate) return candidate as Document<any, any, IUser>;
  }

  readonly getAll = async (key: FilterQuery<IUser>) => {
    // const candidates = await this.userBD.getAll(key);
    // if (candidates) return candidates;
  }

  readonly create = (data: AnyKeys<IUser>) => {
    if (!data) throw new Error();
    const user = this.userBD.create(data);
    if (user) {
      this.self = user;
    }
  }

  readonly save = async () => {
    if (this.self) {
      return await this.self.save();
    }
    return new Error();
  }
}