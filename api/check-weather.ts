import { defaultDeps } from './_lib/deps.js';
import { handleCheckWeather } from './_lib/handlers.js';

// Schedulers differ in which method they use, so accept both.
export function GET(request: Request): Promise<Response> {
  return handleCheckWeather(request, defaultDeps());
}

export function POST(request: Request): Promise<Response> {
  return handleCheckWeather(request, defaultDeps());
}
