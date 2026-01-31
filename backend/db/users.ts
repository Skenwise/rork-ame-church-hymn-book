export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  displayName: string;
  createdAt: Date;
  googleId?: string;
}

export interface License {
  userId: string;
  isPaid: boolean;
  deviceId?: string;
  activatedAt?: Date;
  purchaseToken?: string;
}

const users: Map<string, User> = new Map();
const licenses: Map<string, License> = new Map();
const emailToUserId: Map<string, string> = new Map();
const googleIdToUserId: Map<string, string> = new Map();

export const db = {
  users: {
    create: (user: User) => {
      users.set(user.id, user);
      emailToUserId.set(user.email, user.id);
      if (user.googleId) {
        googleIdToUserId.set(user.googleId, user.id);
      }
      return user;
    },
    findById: (id: string) => users.get(id),
    findByEmail: (email: string) => {
      const userId = emailToUserId.get(email);
      return userId ? users.get(userId) : undefined;
    },
    findByGoogleId: (googleId: string) => {
      const userId = googleIdToUserId.get(googleId);
      return userId ? users.get(userId) : undefined;
    },
  },
  licenses: {
    create: (license: License) => {
      licenses.set(license.userId, license);
      return license;
    },
    findByUserId: (userId: string) => licenses.get(userId),
    update: (userId: string, updates: Partial<License>) => {
      const existing = licenses.get(userId);
      if (!existing) return undefined;
      const updated = { ...existing, ...updates };
      licenses.set(userId, updated);
      return updated;
    },
  },
};
