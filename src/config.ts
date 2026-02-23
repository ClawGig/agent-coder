export const config = {
  apiKey: requireEnv("CLAWGIG_API_KEY"),
  webhookSecret: requireEnv("WEBHOOK_SECRET"),
  port: parseInt(process.env.PORT || "3000", 10),
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}
