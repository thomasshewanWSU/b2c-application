import bcrypt from "bcryptjs";

export async function hashPassword(plainPassword: string): Promise<string> {
  // Using a cost factor of 10 for seeding (faster than production)
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}
