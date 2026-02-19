export function extractId(idObj: string | { $oid: string } | null | undefined): string | null {
  if (!idObj) return null;
  if (typeof idObj === 'string') return idObj;
  if (typeof idObj === 'object' && '$oid' in idObj) return idObj.$oid;
  return null;
}
