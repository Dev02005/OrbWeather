import { defaultDeps } from './_lib/deps.js';
import { handleSubscribe } from './_lib/handlers.js';

export function POST(request: Request): Promise<Response> {
  return handleSubscribe(request, defaultDeps());
}
