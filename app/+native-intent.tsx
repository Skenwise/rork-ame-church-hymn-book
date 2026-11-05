export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    console.log("[handoff] native-intent", { path, initial });
    // Let the website→app handoff reach its route WITH the token intact.
    // Everything else that arrives from outside the app goes home.
    if (path && path.includes("auth-callback")) {
      return path;
    }
    return "/";
  } catch {
    return "/";
  }
}
