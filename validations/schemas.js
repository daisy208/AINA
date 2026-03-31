const { z } = require('zod');

const incidentSchema = z.object({
  type: z.enum(['verbal', 'physical', 'financial', 'threat']).optional(),
  encryptedText: z.string().min(1).optional(),
  encryptedFileBase64: z.string().min(1).optional(),
  evidenceHash: z.string().min(64).max(64),
  evidenceMimeType: z.string().optional(),
  encryptionMeta: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
  aiResult: z.record(z.any()).optional(),
  aiInputText: z.string().max(4000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
}).refine((value) => value.encryptedText || value.encryptedFileBase64, {
  message: 'At least one encrypted evidence payload is required'
});

const incidentAnalyzeSchema = z.object({
  text: z.string().min(5).max(4000)
});

const sosSchema = z.object({
  location: z.string().min(3),
  encryptedAudioBase64: z.string().optional(),
  encryptionMeta: z.record(z.any()).optional(),
  retryCount: z.number().int().min(0).max(5).optional()
});

const authRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  priority: z.number().int().min(1).max(5).optional()
});

const deviceTokenSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(['ios', 'android', 'web'])
});

module.exports = {
  incidentSchema,
  incidentAnalyzeSchema,
  sosSchema,
  deviceTokenSchema,
  authRegisterSchema,
  authLoginSchema,
  contactSchema
};
