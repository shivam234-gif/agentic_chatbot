
import * as esbuild from 'esbuild';
import path from 'path';

async function build() {
  try {
    await esbuild.build({
      entryPoints: [path.resolve(__dirname, '../src/gateway-entry.ts')],
      bundle: true,
      platform: 'node',
      outfile: path.resolve(__dirname, '../dist-gateway/server.js'),
      external: ['electron', 'better-sqlite3'],
      logLevel: 'info',
    });
    console.log('Gateway build complete.');
  } catch (err) {
    console.error('Gateway build failed:', err);
    process.exit(1);
  }
}

build();
