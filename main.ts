import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const E = new TextEncoder(), T = {0:[0,0,0],1:[1,0,1],2:[4,0,1],3:[0,1,0],4:[0,1,2],5:[0,2,2],6:[0,2,3],7:[0,3,3],23:[0,1,1],27:[0,1,1],48:[2,0,0],49:[2,1,0],50:[2,1,0],51:[2,0,0],52:[0,0,0],64:[0,1,1],65:[0,2,0],80:[0,1,0],81:[0,1,0],82:[0,0,1],83:[0,1,0]};
for(let c of [16,17,18,19,20,21,22,24,25,26,28,29,30,32,33,34]) T[c]=[0,2,1];
const run = (p, i) => {
  const n = p.length, D = new Int32Array(256), M = new Int32Array(256), C = new Int32Array(64), o = new Uint8Array(65536);
  let sp = 0, csp = 0, ol = 0, ip = 0, pc = 0, s = 0;
  const tr = (c) => ({ stdout: o.subarray(0, ol), exit: c, trap: c });
  for (;;) {
    if (s === 1000000) return tr(10);
    if (pc < 0 || pc >= n) return tr(9);
    const op = p[pc], t = T[op];
    if (!t) return tr(5);
    const [imm, pps, psh] = t;
    if (pc + imm >= n) return tr(9);
    s++;
    const nx = pc + 1 + imm;
    if (sp < pps || sp - pps + psh > 256) return tr(sp < pps ? 2 : 3);
    pc = nx;
    switch (op) {
      case 0: return { stdout: o.subarray(0, ol), exit: 0, trap: null };
      case 1: D[sp++] = (p[nx - 1] << 24) >> 24; break;
      case 2: D[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24); break;
      case 3: sp--; break;
      case 4: D[sp] = D[sp - 1]; sp++; break;
      case 5: { const t = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = t; break; }
      case 6: D[sp] = D[sp - 2]; sp++; break;
      case 7: { const a = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = a; break; }
      case 23: D[sp - 1] = -D[sp - 1] | 0; break;
      case 27: D[sp - 1] = ~D[sp - 1]; break;
      case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 24: case 25: case 26: case 28: case 29: case 30: case 32: case 33: case 34: {
        const b = D[--sp], a = D[--sp];
        if (op >= 19 && op <= 22 && b === 0) return tr(4);
        D[sp++] = op === 16 ? (a + b) | 0 : op === 17 ? (a - b) | 0 : op === 18 ? Math.imul(a, b) : op === 19 ? (a === -2147483648 && b === -1 ? a : (a / b) | 0) : op === 20 ? (b === -1 ? 0 : (a % b) | 0) : op === 21 ? Math.floor((a >>> 0) / (b >>> 0)) | 0 : op === 22 ? (a >>> 0) % (b >>> 0) | 0 : op === 24 ? a & b : op === 25 ? a | b : op === 26 ? a ^ b : op === 28 ? a << (b & 31) : op === 29 ? a >> (b & 31) : op === 30 ? (a >>> (b & 31)) | 0 : op === 32 ? (a === b ? 1 : 0) : op === 33 ? (a < b ? 1 : 0) : (a >>> 0 < b >>> 0 ? 1 : 0);
        break;
      }
      case 48: case 49: case 50: {
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        if (op === 48 || (op === 49 ? D[--sp] === 0 : D[--sp] !== 0)) pc = nx + rel;
        break;
      }
      case 51: if (csp === 64) return tr(7); C[csp++] = nx; pc = p[nx - 2] | (p[nx - 1] << 8); break;
      case 52: if (csp === 0) return tr(8); pc = C[--csp]; break;
      case 64: { const a = D[sp - 1]; if (a < 0 || a >= 256) return tr(6); D[sp - 1] = M[a]; break; }
      case 65: { const a = D[sp - 1], v = D[sp - 2]; if (a < 0 || a >= 256) return tr(6); sp -= 2; M[a] = v; break; }
      case 80: { const b = E.encode(String(D[--sp])); if (ol + b.length > 65536) return tr(11); o.set(b, ol); ol += b.length; break; }
      case 81: if (ol + 1 > 65536) return tr(11); o[ol++] = D[--sp] & 255; break;
      case 82: D[sp++] = ip < i.length ? i[ip++] : -1; break;
      case 83: return { stdout: o.subarray(0, ol), exit: D[--sp] & 255, trap: null };
    }
  }
};
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input', O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const d of readdirSync(I).sort()) {
  const p = join(I, d), r = run(new Uint8Array(readFileSync(p + '/program.bin')), new Uint8Array(readFileSync(p + '/input.bin')));
  const o = join(O, d);
  mkdirSync(o, { recursive: true });
  writeFileSync(o + '/stdout.bin', r.stdout);
  writeFileSync(o + '/exit.txt', r.exit + '\n');
}
