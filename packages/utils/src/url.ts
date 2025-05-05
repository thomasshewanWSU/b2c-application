export function toUrlPath(path: string) {
  // replace all non alphanumerics characters with hyphen
  // then replace all sequential hyphens with single hyphen
  // then remove leading and trailing hyphens
  const sanitizedPath = path
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return sanitizedPath.toLowerCase();
}
