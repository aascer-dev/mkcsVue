const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]
const rotr = (value, bits) => (value >>> bits) | (value << (32 - bits))

class Sha256 {
  constructor () { this.hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]; this.buffer = new Uint8Array(64); this.length = 0; this.bufferLength = 0 }
  update (input) {
    this.length += input.length
    for (let offset = 0; offset < input.length;) {
      const copied = Math.min(64 - this.bufferLength, input.length - offset)
      this.buffer.set(input.subarray(offset, offset + copied), this.bufferLength)
      this.bufferLength += copied; offset += copied
      if (this.bufferLength === 64) { this.process(); this.bufferLength = 0 }
    }
  }
  process () {
    const words = new Uint32Array(64)
    for (let i = 0; i < 16; i++) words[i] = (this.buffer[i * 4] << 24) | (this.buffer[i * 4 + 1] << 16) | (this.buffer[i * 4 + 2] << 8) | this.buffer[i * 4 + 3]
    for (let i = 16; i < 64; i++) { const a = words[i - 15]; const b = words[i - 2]; words[i] = (((rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3)) + words[i - 7]) | 0) + ((rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10)) + words[i - 16] | 0) }
    let [a, b, c, d, e, f, g, h] = this.hash
    for (let i = 0; i < 64; i++) { const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + words[i]) | 0; const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0; h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0 }
    this.hash = this.hash.map((value, index) => (value + [a, b, c, d, e, f, g, h][index]) | 0)
  }
  digest () {
    const bits = this.length * 8
    this.update(new Uint8Array([0x80]))
    while (this.bufferLength !== 56) this.update(new Uint8Array([0]))
    const lengthBytes = new Uint8Array(8)
    const high = Math.floor(bits / 0x100000000); const low = bits >>> 0
    lengthBytes[0] = high >>> 24; lengthBytes[1] = high >>> 16; lengthBytes[2] = high >>> 8; lengthBytes[3] = high
    lengthBytes[4] = low >>> 24; lengthBytes[5] = low >>> 16; lengthBytes[6] = low >>> 8; lengthBytes[7] = low
    this.update(lengthBytes)
    return this.hash.map(value => (value >>> 0).toString(16).padStart(8, '0')).join('')
  }
}

export async function hashFileSha256 (file, onProgress, signal) {
  const sha256 = new Sha256(); const chunkSize = 4 * 1024 * 1024
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    if (signal?.aborted) throw new DOMException('上传已中断', 'AbortError')
    sha256.update(new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer()))
    onProgress?.(Math.min(1, (offset + chunkSize) / file.size))
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  return sha256.digest()
}

const leftRotate = (value, bits) => (value << bits) | (value >>> (32 - bits))

// The server stores the existing random-position checksums as MD5 (CHAR(32)).
// Challenges are capped at 256 KiB, so this one-shot implementation never reads
// a whole upload into memory.
const md5 = input => {
  const originalLength = input.length
  const paddedLength = (((originalLength + 8) >>> 6) + 1) * 64
  const bytes = new Uint8Array(paddedLength)
  bytes.set(input)
  bytes[originalLength] = 0x80
  const bitLength = originalLength * 8
  for (let index = 0; index < 8; index++) bytes[paddedLength - 8 + index] = Math.floor(bitLength / 2 ** (index * 8)) & 0xff

  let a0 = 0x67452301; let b0 = 0xefcdab89; let c0 = 0x98badcfe; let d0 = 0x10325476
  const shifts = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21]
  for (let offset = 0; offset < paddedLength; offset += 64) {
    const words = new Uint32Array(16)
    for (let index = 0; index < 16; index++) words[index] = bytes[offset + index * 4] | (bytes[offset + index * 4 + 1] << 8) | (bytes[offset + index * 4 + 2] << 16) | (bytes[offset + index * 4 + 3] << 24)
    let a = a0; let b = b0; let c = c0; let d = d0
    for (let index = 0; index < 64; index++) {
      let f; let g
      if (index < 16) { f = (b & c) | (~b & d); g = index }
      else if (index < 32) { f = (d & b) | (~d & c); g = (5 * index + 1) % 16 }
      else if (index < 48) { f = b ^ c ^ d; g = (3 * index + 5) % 16 }
      else { f = c ^ (b | ~d); g = (7 * index) % 16 }
      const shift = shifts[(index >>> 4) * 4 + (index % 4)]
      const next = (b + leftRotate((a + f + Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32) + words[g]) >>> 0, shift)) >>> 0
      a = d; d = c; c = b; b = next
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0
  }
  return [a0, b0, c0, d0].flatMap(word => [word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, word >>> 24]
    .map(value => value.toString(16).padStart(2, '0'))).join('')
}

export async function hashBlobMd5 (blob) {
  return md5(new Uint8Array(await blob.arrayBuffer()))
}
