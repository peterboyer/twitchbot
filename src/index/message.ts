export interface Message {
  id: number;
  buffer: string;
  headers: Record<string, string[]>;
  attributes: Record<string, unknown>;
}
