export function cx(
  ...classes: Array<
    string | Record<string, boolean | null | undefined> | null | undefined
  >
): string {
  return classes
    .flatMap((cls) => {
      // Handle strings directly
      if (typeof cls === "string") return cls;

      // Skip null/undefined
      if (cls == null) return [];

      // Handle object format {className: boolean}
      if (typeof cls === "object") {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }

      return [];
    })
    .filter(Boolean)
    .join(" ");
}
