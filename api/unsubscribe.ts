import { defaultDeps } from './_lib/deps.js';
import { handleUnsubscribe } from './_lib/handlers.js';

export function POST(request: Request): Promise<Response> {
  return handleUnsubscribe(request, defaultDeps());
}
