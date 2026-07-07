export interface CleanupPolicy {
  name: string;
  enabled: boolean;
  execute(): Promise<number>;
}
