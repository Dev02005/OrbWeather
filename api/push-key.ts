import { defaultDeps } from './_lib/deps.js';
import { handlePushKey } from './_lib/handlers.js';

export function GET(): Response {
  return handlePushKey(defaultDeps());
}
