import "server-only"

export function getBlobToken() {
  const token = [
    process.env.BLOB_READ_WRITE_TOKEN,
    process.env.BLOB_READ_WRITE_TOKEN_3,
    process.env.BLOB_READ_WRITE_TOKEN_2,
  ].find((value) => value?.trim())?.trim()

  if (!token) {
    throw new Error(
      "Blob storage is not configured: set BLOB_READ_WRITE_TOKEN or a configured numbered Blob token.",
    )
  }

  return token
}

export function getBlobOptions() {
  return { token: getBlobToken() }
}

export function getBlobDeleteOptions() {
  return { token: getBlobToken() }
}
