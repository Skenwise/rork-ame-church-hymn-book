import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (!url) {
    throw new Error(
      "Rork did not set EXPO_PUBLIC_RORK_API_BASE_URL, please use support",
    );
  }

  return url;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => {
        const token = global.authToken;
        return token ? { authorization: `Bearer ${token}` } : {};
      },
      fetch: (url, options) => {
        console.log('[tRPC] Fetching:', url);
        return fetch(url, options).catch((error) => {
          console.error('[tRPC] Fetch failed:', error);
          console.error('[tRPC] URL was:', url);
          throw error;
        });
      },
    }),
  ],
});

declare global {
  var authToken: string | undefined;
}
