import { z } from 'zod';

export const ErrorNotificationSchema = z.object({
  message: z.string(),
  isCritical: z.boolean().default(false),
  // Through which channel the error is sent
  isTerminal: z.boolean().default(true),
  isApp: z.boolean().default(true),
  isAudio: z.boolean().default(true),
});

export type ErrorNotification = z.infer<typeof ErrorNotificationSchema>;