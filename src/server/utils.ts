import * as crypto from "crypto"
import { getPasswordHash } from "./generateMetaData"

export const createHash = (password: any) =>
  crypto.createHash("sha256").update(password).digest("hex")

export const matchPassword = async (password: any) => {
  const newHash = createHash(password)
  const { passwordHash } = await getPasswordHash()

  return newHash === passwordHash
}
