import { createClient } from "@insforge/sdk";

const INSFORGE_URL = process.env.INSFORGE_URL;
const INSFORGE_ANON_KEY = process.env.INSFORGE_ANON_KEY;

let insforge;

if (INSFORGE_URL && INSFORGE_ANON_KEY) {
  insforge = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
  });

  // Inject the anon key as the access token so the SDK can sign all
  // server-side database requests without requiring a user login session.
  insforge.auth.tokenManager.accessToken = INSFORGE_ANON_KEY;
} else {
  const missingVars = ["INSFORGE_URL", "INSFORGE_ANON_KEY"].filter(
    (key) => !process.env[key]
  );
  console.error(
    `[startup] Missing required env vars: ${missingVars.join(", ")}`
  );

  const throwMisconfigured = () => {
    throw new Error(
      `SERVER_MISCONFIGURED: Missing ${missingVars.join(", ")} environment variables`
    );
  };

  // Keep the process bootable (important for serverless),
  // but fail with a clear error when DB access is attempted.
  insforge = {
    database: {
      from: throwMisconfigured,
    },
    auth: {
      tokenManager: {
        accessToken: null,
      },
    },
  };
}

export default insforge;
