import { Model } from 'mongoose';

export async function checkEmail<T>(email: string, model: Model<T>): Promise<boolean> {
  const user = await model.findOne({ email } as any).exec();
  return !!user;
}

