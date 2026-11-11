/** Trust only the client address header supplied by the hosting proxy. */
export function getRequestIp(request: Request): string {
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
