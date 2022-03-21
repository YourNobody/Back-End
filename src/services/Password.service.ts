import bcrypt from "bcrypt";

export class Password {
	static async hash(password: string): Promise<string> {
		try {
			if (!password) throw new Error('Password wasn\'t passed');
			const hashed = await bcrypt.hash(password, 12);
			return hashed;
		} catch (e: any) {
			throw e;
		}
	}

	static async compare(password: string, hashedPassword: string): Promise<boolean> {
		try {
			if (!password || !hashedPassword) throw new Error('Password wasn\'t passed');
			const result = await bcrypt.compare(password, hashedPassword);
			return result;
		} catch (e: any) {
			throw e;
		}
	}
}