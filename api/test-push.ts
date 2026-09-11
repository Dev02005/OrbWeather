import { defaultDeps } from './_lib/deps.js';
import { handleTestPush } from './_lib/handlers.js';

export function POST(request: Request): Promise<Response> {
  return handleTestPush(request, defaultDeps());
}
