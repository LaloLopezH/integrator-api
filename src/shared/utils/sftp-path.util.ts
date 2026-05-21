import * as path from 'path';

export function normalizeSftpRemotePath(base: string | undefined): string {
  return (base ?? '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^['"]|['"]$/g, '');
}

export function joinSftpRemotePath(base: string | undefined, ...segments: string[]): string {
  return path.posix.join(normalizeSftpRemotePath(base), ...segments);
}
