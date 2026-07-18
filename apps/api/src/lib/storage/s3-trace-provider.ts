import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { TraceProvider } from "./trace-provider";

export class S3TraceProvider implements TraceProvider {
  private readonly client: S3Client;

  private readonly bucket: string;

  private readonly prefix: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION ?? "us-east-1";
    const bucket = process.env.S3_BUCKET;

    if (!bucket) {
      throw new Error("S3_BUCKET is not configured");
    }

    this.bucket = bucket;
    this.prefix = process.env.S3_PREFIX ?? "traces/";
    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: Boolean(endpoint),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
      },
    });
  }

  private getKey(traceKey: string): string {
    return `${this.prefix}${traceKey}.zip`;
  }

  async save(traceKey: string, content: ArrayBuffer): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.getKey(traceKey),
        Body: Buffer.from(content),
        ContentType: "application/zip",
      }),
    );
  }

  async read(traceKey: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: this.getKey(traceKey),
      }),
    );

    const chunks: Buffer[] = [];

    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  getUrl(traceKey: string, expires: number, signature: string): string {
    const apiUrl = process.env.APP_URL ?? "http://localhost:4321";

    return `${apiUrl}/api/traces/${traceKey}?expires=${expires}&signature=${signature}`;
  }

  async delete(traceKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: this.getKey(traceKey),
      }),
    );
  }

  async list(prefix?: string): Promise<string[]> {
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix ?? this.prefix,
      }),
    );

    return (response.Contents ?? []).map((item) => item.Key ?? "");
  }
}
