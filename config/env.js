const requiredVars = ["JWT_SECRET", "DATABASE_URL"];

function validateEnv() {
  const missing = requiredVars.filter((name) => !process.env[name]);

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };
