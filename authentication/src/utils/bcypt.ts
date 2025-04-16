import bcrypt from 'bcrypt';
import { brotliCompress } from 'zlib';

export const hashValue = async ( value: string, saltRounds?: number) =>
  bcrypt.hash(value, saltRounds || 10);

export const compareValue = async (value: string, hashedValue: string)=>
  bcrypt.compare(value, hashedValue).catch(() => false);