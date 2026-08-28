// @ts-ignore ScriptC supplies the Node.js fallback declarations.
import { readFileSync } from "node:fs";

const PROTOCOL = "polici.runtime/v1";
const message = JSON.parse(new TextDecoder().decode(readFileSync(0))) as Record<string, unknown>;

if (message.protocol !== PROTOCOL) throw new Error("Unsupported Polici runtime protocol");

const id = requiredString(message.id, "id");
const type = requiredString(message.type, "type");

if (type === "initialize") {
  respond({
    protocol: PROTOCOL,
    type: "initialized",
    id,
    implementation: { name: "ownership", version: "1.0.0" },
    capabilities: [],
    continuation: "calls:0",
  });
} else if (type === "call") {
  const calls = continuationCalls(message.continuation);
  if (requiredString(message.resolver, "resolver") !== "approved")
    throw new Error("Unknown resolver");
  const arguments_ = requiredRecord(message.arguments, "arguments");
  const owner = requiredRecord(arguments_.owner, "arguments.owner");
  if (owner.tag !== "string") throw new Error("owner must be a tagged string");
  const value = requiredString(owner.value, "arguments.owner.value");
  respond({
    protocol: PROTOCOL,
    type: "result",
    id,
    value: { tag: "boolean", value: value === "frontend" || value === "platform" },
    continuation: `calls:${calls + 1}`,
  });
} else if (type === "shutdown") {
  continuationCalls(message.continuation);
  respond({ protocol: PROTOCOL, type: "stopped", id });
} else {
  throw new Error(`Unsupported message type ${type}`);
}

function continuationCalls(value: unknown): number {
  const continuation = requiredString(value, "continuation");
  if (!/^calls:[0-9]+$/.test(continuation)) throw new Error("Unexpected runtime continuation");
  const calls = Number(continuation.slice("calls:".length));
  if (!Number.isSafeInteger(calls)) throw new Error("Invalid runtime continuation");
  return calls;
}

function requiredRecord(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string") throw new Error(`${label} must be a string`);
  return value;
}

function respond(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}
