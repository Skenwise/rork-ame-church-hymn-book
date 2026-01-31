import * as crypto from "expo-crypto";
import * as z from "zod";

import { db } from "@/backend/db/users";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";

async function hashPassword(password: string): Promise<string> {
  return await crypto.digestStringAsync(
    crypto.CryptoDigestAlgorithm.SHA256,
    password + "hymn_salt_secret"
  );
}

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        displayName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const existingUser = db.users.findByEmail(input.email);
      if (existingUser) {
        throw new Error("Email already registered");
      }

      const userId = crypto.randomUUID();
      const passwordHash = await hashPassword(input.password);

      const user = db.users.create({
        id: userId,
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        createdAt: new Date(),
      });

      db.licenses.create({
        userId: user.id,
        isPaid: false,
      });

      return {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
      };
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = db.users.findByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new Error("Invalid credentials");
      }

      const passwordHash = await hashPassword(input.password);
      if (passwordHash !== user.passwordHash) {
        throw new Error("Invalid credentials");
      }

      return {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
      };
    }),

  signInWithGoogle: publicProcedure
    .input(
      z.object({
        googleId: z.string(),
        email: z.string().email(),
        displayName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      let user = db.users.findByGoogleId(input.googleId);

      if (!user) {
        user = db.users.findByEmail(input.email);
      }

      if (!user) {
        const userId = crypto.randomUUID();
        user = db.users.create({
          id: userId,
          email: input.email,
          googleId: input.googleId,
          displayName: input.displayName,
          createdAt: new Date(),
        });

        db.licenses.create({
          userId: user.id,
          isPaid: false,
        });
      }

      return {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
      };
    }),

  getProfile: protectedProcedure.query(({ ctx }) => {
    const user = db.users.findById(ctx.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const license = db.licenses.findByUserId(ctx.userId);

    return {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      isPaid: license?.isPaid || false,
      deviceId: license?.deviceId,
    };
  }),

  unlockApp: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        purchaseToken: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const license = db.licenses.findByUserId(ctx.userId);
      if (!license) {
        throw new Error("License not found");
      }

      if (license.isPaid && license.deviceId && license.deviceId !== input.deviceId) {
        throw new Error("This purchase is already activated on another device");
      }

      db.licenses.update(ctx.userId, {
        isPaid: true,
        deviceId: input.deviceId,
        activatedAt: new Date(),
        purchaseToken: input.purchaseToken,
      });

      return {
        success: true,
        message: "App unlocked successfully",
      };
    }),

  checkDeviceAccess: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .query(({ ctx, input }) => {
      const license = db.licenses.findByUserId(ctx.userId);
      if (!license) {
        return { hasAccess: false, isPaid: false };
      }

      if (!license.isPaid) {
        return { hasAccess: true, isPaid: false };
      }

      if (license.deviceId === input.deviceId) {
        return { hasAccess: true, isPaid: true };
      }

      return {
        hasAccess: false,
        isPaid: true,
        message: "This purchase is already activated on another device",
      };
    }),
});
