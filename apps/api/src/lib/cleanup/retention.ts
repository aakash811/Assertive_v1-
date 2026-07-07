export type RetentionPolicyConfig = {
  runs: string;
  history: string;
  traces: string;
};

function parseRetention(value: string) {
  const match = /^(\d+)([dh])$/.exec(value);

  if (!match) {
    return 30 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);

  switch (match[2]) {
    case "d":
      return amount * 24 * 60 * 60 * 1000;

    case "h":
      return amount * 60 * 60 * 1000;

    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

export function loadRetentionPolicy(): RetentionPolicyConfig {
  return {
    runs: process.env.RETENTION_RUNS ?? "90d",
    history: process.env.RETENTION_HISTORY ?? "365d",
    traces: process.env.RETENTION_TRACES ?? "30d",
  };
}

export function getRetentionMs(value: string) {
  return parseRetention(value);
}
