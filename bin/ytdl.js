#!/usr/bin/env node
import('../dist/main.js').catch((err) => {
  process.stderr.write(`[ytdl] Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});