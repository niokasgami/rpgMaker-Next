/** Parameters is a heterogeneous JSON array; use unknown[] for safety. */
export interface PageList {
  code: number;
  indent: number | null;
  parameters: unknown[];
}
