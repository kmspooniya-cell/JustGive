import { isIP } from "node:net";

/** Trust only the client address header supplied by the hosting proxy. */
export function getRequestIp(request: Request): string {
  const address = request.headers.get("x-real-ip")?.trim();
  return address && isIP(address) ? address : "unknown";
}
