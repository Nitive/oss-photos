import * as AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})

export const config = {
  bucket: process.env.S3_BUCKET!,
  prefix: process.env.S3_PREFIX || "",
}

export default s3
