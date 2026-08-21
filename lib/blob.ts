import "server-only"

export function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) {
    throw new Error("Blob storage is not configured for this deployment")
  }
  return token
}

export function getBlobOptions() {
  return { token: getBlobToken() }
}

export function getBlobDeleteOptions() {
  return { token: getBlobToken() }
}
