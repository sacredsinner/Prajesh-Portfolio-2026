import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
import { put } from '@vercel/blob';
 
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get('file') as File;
 
  const blob = await put(file.name, file, {
    access: 'public',
  });
 
  return Response.json(blob);
}