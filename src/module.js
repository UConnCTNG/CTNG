(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// If you're using single file, use global variable instead: `window.nobleBls12381`

// Retrieves the public key from a given secret key
window.getPublicKey = function(key) {
  const bls = require('@noble/bls12-381');
  const publicK = bls.getPublicKey(key);
  return publicK
}

// Main verify function
window.verifyBLS = async function(key, signature, message) {
  const bls = require('@noble/bls12-381');
  const isValid = await bls.verify(signature, message, key);
  return {isValid};
}

// Testing function. For this one we pass in a private key
window.verifyTest = async function(key, signature, message) {
  const bls = require('@noble/bls12-381');
  const publicK = bls.getPublicKey(key);
  console.log({publicK, signature})
  const isValid = await bls.verify(signature, message, publicK);
  console.log({isValid})
  return {isValid};
}

window.signBLS = async function(message, privateKey) {
  const bls = require('@noble/bls12-381');
  //const bls = require('@noble/curves/bls12-381');

  const signature = await bls.sign(message, privateKey);
  return signature
  // sig = ""
  // for (var i=0; i<signature.byteLength; i++) {
  //   sig += String.fromCharCode(signature[i])
  // }
  // return sig
}

window.signTest = async function(message, privateKey) {
  const bls = require('@noble/bls12-381');
  const signature = await bls.sign(message, privateKey);
  return signature
}

window.verifyAggregate = async function(publicKeys, signatures, message) {
  const bls = require('@noble/bls12-381');
  const aggPublicKey = bls.aggregatePublicKeys(publicKeys);
  const aggSignature= bls.aggregateSignatures(signatures);
  const isValid = await bls.verifyBatch(aggSignature, message, aggPublicKey);
  return isValid
}

window.aggregatePublicKeys = function(keys) {
  const bls = require('@noble/bls12-381');

  return bls.aggregatePublicKeys(keys);
}

window.aggregateSignatures = function(sigs) {
  const bls = require('@noble/bls12-381');

  return bls.aggregateSignatures(sigs)
}

window.aggTest = async function() {
  const bls = require('@noble/bls12-381');
  const privateKey = '67d53f170b908cabb9eb326c3c337762d59289a8fec79f7bc9254b584b73265c';
  const message = '64726e3da8';
  const publicKey = bls.getPublicKey(privateKey);
  const signature = await bls.sign(message, privateKey);
  const isValid = await bls.verify(signature, message, publicKey);
  console.log({ publicKey, signature, isValid });

  // Sign 1 msg with 3 keys
  const privateKeys = [
    '18f020b98eb798752a50ed0563b079c125b0db5dd0b1060d1c1b47d4a193e1e4',
    'ed69a8c50cf8c9836be3b67c7eeff416612d45ba39a5c099d48fa668bf558c9c',
    '16ae669f3be7a2121e17d0c68c05a8f3d6bef21ec0f2315f1d7aec12484e4cf5'
  ];
  const messages = ['d2', '0d98', '05caf3'];
  const publicKeys = privateKeys.map(bls.getPublicKey);
  const signatures2 = await Promise.all(privateKeys.map(p => bls.sign(message, p)));
  const aggPubKey2 = bls.aggregatePublicKeys(publicKeys);
  console.log("pubKeys: ", publicKeys, aggPubKey2)
  const aggSignature2 = bls.aggregateSignatures(signatures2);
  const isValid2 = await bls.verify(aggSignature2, message, aggPubKey2);
  console.log({ signatures2, aggSignature2, isValid2 });

  // Sign 3 msgs with 3 keys
  const signatures3 = await Promise.all(privateKeys.map((p, i) => bls.sign(messages[i], p)));
  const aggSignature3 = bls.aggregateSignatures(signatures3);
  const isValid3 = await bls.verifyBatch(aggSignature3, messages, publicKeys);
  console.log({ publicKeys, signatures3, aggSignature3, isValid3 });
}



},{"@noble/bls12-381":3}],3:[function(require,module,exports){
"use strict";
/*! noble-bls12-381 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBatch = exports.aggregateSignatures = exports.aggregatePublicKeys = exports.verify = exports.sign = exports.getPublicKey = exports.pairing = exports.PointG2 = exports.PointG1 = exports.utils = exports.CURVE = exports.Fp12 = exports.Fp2 = exports.Fr = exports.Fp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const math_js_1 = require("./math.js");
Object.defineProperty(exports, "Fp", { enumerable: true, get: function () { return math_js_1.Fp; } });
Object.defineProperty(exports, "Fr", { enumerable: true, get: function () { return math_js_1.Fr; } });
Object.defineProperty(exports, "Fp2", { enumerable: true, get: function () { return math_js_1.Fp2; } });
Object.defineProperty(exports, "Fp12", { enumerable: true, get: function () { return math_js_1.Fp12; } });
Object.defineProperty(exports, "CURVE", { enumerable: true, get: function () { return math_js_1.CURVE; } });
const POW_2_381 = 2n ** 381n;
const POW_2_382 = POW_2_381 * 2n;
const POW_2_383 = POW_2_382 * 2n;
const PUBLIC_KEY_LENGTH = 48;
function wrapHash(outputLen, h) {
    let tmp = h;
    tmp.outputLen = outputLen;
    return tmp;
}
const sha256 = wrapHash(32, async (message) => {
    if (crypto.web) {
        const buffer = await crypto.web.subtle.digest('SHA-256', message.buffer);
        return new Uint8Array(buffer);
    }
    else if (crypto.node) {
        return Uint8Array.from(crypto.node.createHash('sha256').update(message).digest());
    }
    else {
        throw new Error("The environment doesn't have sha256 function");
    }
});
const htfDefaults = {
    DST: 'BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_',
    p: math_js_1.CURVE.P,
    m: 2,
    k: 128,
    expand: true,
    hash: sha256,
};
function isWithinCurveOrder(num) {
    return 0 < num && num < math_js_1.CURVE.r;
}
const crypto = {
    node: crypto_1.default,
    web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined,
};
exports.utils = {
    hashToField: hash_to_field,
    expandMessageXMD: expand_message_xmd,
    hashToPrivateKey: (hash) => {
        hash = ensureBytes(hash);
        if (hash.length < 40 || hash.length > 1024)
            throw new Error('Expected 40-1024 bytes of private key as per FIPS 186');
        const num = (0, math_js_1.mod)((0, math_js_1.bytesToNumberBE)(hash), math_js_1.CURVE.r);
        if (num === 0n || num === 1n)
            throw new Error('Invalid private key');
        return numberTo32BytesBE(num);
    },
    stringToBytes,
    bytesToHex: math_js_1.bytesToHex,
    hexToBytes: math_js_1.hexToBytes,
    randomBytes: (bytesLength = 32) => {
        if (crypto.web) {
            return crypto.web.getRandomValues(new Uint8Array(bytesLength));
        }
        else if (crypto.node) {
            const { randomBytes } = crypto.node;
            return new Uint8Array(randomBytes(bytesLength).buffer);
        }
        else {
            throw new Error("The environment doesn't have randomBytes function");
        }
    },
    randomPrivateKey: () => {
        return exports.utils.hashToPrivateKey(exports.utils.randomBytes(40));
    },
    sha256,
    mod: math_js_1.mod,
    getDSTLabel() {
        return htfDefaults.DST;
    },
    setDSTLabel(newLabel) {
        if (typeof newLabel !== 'string' || newLabel.length > 2048 || newLabel.length === 0) {
            throw new TypeError('Invalid DST');
        }
        htfDefaults.DST = newLabel;
    },
};
function numberTo32BytesBE(num) {
    const length = 32;
    const hex = num.toString(16).padStart(length * 2, '0');
    return (0, math_js_1.hexToBytes)(hex);
}
function toPaddedHex(num, padding) {
    if (typeof num !== 'bigint' || num < 0n)
        throw new Error('Expected valid bigint');
    if (typeof padding !== 'number')
        throw new TypeError('Expected valid padding');
    return num.toString(16).padStart(padding * 2, '0');
}
function ensureBytes(hex) {
    return hex instanceof Uint8Array ? Uint8Array.from(hex) : (0, math_js_1.hexToBytes)(hex);
}
function stringToBytes(str) {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}
function os2ip(bytes) {
    let result = 0n;
    for (let i = 0; i < bytes.length; i++) {
        result <<= 8n;
        result += BigInt(bytes[i]);
    }
    return result;
}
function i2osp(value, length) {
    if (value < 0 || value >= 1 << (8 * length)) {
        throw new Error(`bad I2OSP call: value=${value} length=${length}`);
    }
    const res = Array.from({ length }).fill(0);
    for (let i = length - 1; i >= 0; i--) {
        res[i] = value & 0xff;
        value >>>= 8;
    }
    return new Uint8Array(res);
}
function strxor(a, b) {
    const arr = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
        arr[i] = a[i] ^ b[i];
    }
    return arr;
}
async function expand_message_xmd(msg, DST, lenInBytes, H = exports.utils.sha256) {
    if (DST.length > 255)
        DST = await H((0, math_js_1.concatBytes)(stringToBytes('H2C-OVERSIZE-DST-'), DST));
    const b_in_bytes = H.outputLen;
    const r_in_bytes = b_in_bytes * 2;
    const ell = Math.ceil(lenInBytes / b_in_bytes);
    if (ell > 255)
        throw new Error('Invalid xmd length');
    const DST_prime = (0, math_js_1.concatBytes)(DST, i2osp(DST.length, 1));
    const Z_pad = i2osp(0, r_in_bytes);
    const l_i_b_str = i2osp(lenInBytes, 2);
    const b = new Array(ell);
    const b_0 = await H((0, math_js_1.concatBytes)(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
    b[0] = await H((0, math_js_1.concatBytes)(b_0, i2osp(1, 1), DST_prime));
    for (let i = 1; i <= ell; i++) {
        const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
        b[i] = await H((0, math_js_1.concatBytes)(...args));
    }
    const pseudo_random_bytes = (0, math_js_1.concatBytes)(...b);
    return pseudo_random_bytes.slice(0, lenInBytes);
}
async function hash_to_field(msg, count, options = {}) {
    const htfOptions = { ...htfDefaults, ...options };
    const log2p = htfOptions.p.toString(2).length;
    const L = Math.ceil((log2p + htfOptions.k) / 8);
    const len_in_bytes = count * htfOptions.m * L;
    const DST = stringToBytes(htfOptions.DST);
    let pseudo_random_bytes = msg;
    if (htfOptions.expand) {
        pseudo_random_bytes = await expand_message_xmd(msg, DST, len_in_bytes, htfOptions.hash);
    }
    const u = new Array(count);
    for (let i = 0; i < count; i++) {
        const e = new Array(htfOptions.m);
        for (let j = 0; j < htfOptions.m; j++) {
            const elm_offset = L * (j + i * htfOptions.m);
            const tv = pseudo_random_bytes.subarray(elm_offset, elm_offset + L);
            e[j] = (0, math_js_1.mod)(os2ip(tv), htfOptions.p);
        }
        u[i] = e;
    }
    return u;
}
function normalizePrivKey(key) {
    let int;
    if (key instanceof Uint8Array && key.length === 32)
        int = (0, math_js_1.bytesToNumberBE)(key);
    else if (typeof key === 'string' && key.length === 64)
        int = BigInt(`0x${key}`);
    else if (typeof key === 'number' && key > 0 && Number.isSafeInteger(key))
        int = BigInt(key);
    else if (typeof key === 'bigint' && key > 0n)
        int = key;
    else
        throw new TypeError('Expected valid private key');
    int = (0, math_js_1.mod)(int, math_js_1.CURVE.r);
    if (!isWithinCurveOrder(int))
        throw new Error('Private key must be 0 < key < CURVE.r');
    return int;
}
function assertType(item, type) {
    if (!(item instanceof type))
        throw new Error('Expected Fp* argument, not number/bigint');
}
class PointG1 extends math_js_1.ProjectivePoint {
    constructor(x, y, z = math_js_1.Fp.ONE) {
        super(x, y, z, math_js_1.Fp);
        assertType(x, math_js_1.Fp);
        assertType(y, math_js_1.Fp);
        assertType(z, math_js_1.Fp);
    }
    static fromHex(bytes) {
        bytes = ensureBytes(bytes);
        let point;
        if (bytes.length === 48) {
            const { P } = math_js_1.CURVE;
            const compressedValue = (0, math_js_1.bytesToNumberBE)(bytes);
            const bflag = (0, math_js_1.mod)(compressedValue, POW_2_383) / POW_2_382;
            if (bflag === 1n) {
                return this.ZERO;
            }
            const x = new math_js_1.Fp((0, math_js_1.mod)(compressedValue, POW_2_381));
            const right = x.pow(3n).add(new math_js_1.Fp(math_js_1.CURVE.b));
            let y = right.sqrt();
            if (!y)
                throw new Error('Invalid compressed G1 point');
            const aflag = (0, math_js_1.mod)(compressedValue, POW_2_382) / POW_2_381;
            if ((y.value * 2n) / P !== aflag)
                y = y.negate();
            point = new PointG1(x, y);
        }
        else if (bytes.length === 96) {
            if ((bytes[0] & (1 << 6)) !== 0)
                return PointG1.ZERO;
            const x = (0, math_js_1.bytesToNumberBE)(bytes.slice(0, PUBLIC_KEY_LENGTH));
            const y = (0, math_js_1.bytesToNumberBE)(bytes.slice(PUBLIC_KEY_LENGTH));
            point = new PointG1(new math_js_1.Fp(x), new math_js_1.Fp(y));
        }
        else {
            throw new Error('Invalid point G1, expected 48/96 bytes');
        }
        point.assertValidity();
        return point;
    }
    static async hashToCurve(msg, options) {
        msg = ensureBytes(msg);
        const [[u0], [u1]] = await hash_to_field(msg, 2, { m: 1, ...options });
        const [x0, y0] = (0, math_js_1.map_to_curve_simple_swu_3mod4)(new math_js_1.Fp(u0));
        const [x1, y1] = (0, math_js_1.map_to_curve_simple_swu_3mod4)(new math_js_1.Fp(u1));
        const [x2, y2] = new PointG1(x0, y0).add(new PointG1(x1, y1)).toAffine();
        const [x3, y3] = (0, math_js_1.isogenyMapG1)(x2, y2);
        return new PointG1(x3, y3).clearCofactor();
    }
    static async encodeToCurve(msg, options) {
        msg = ensureBytes(msg);
        const u = await hash_to_field(msg, 1, {
            m: 1,
            ...options,
        });
        const [x0, y0] = (0, math_js_1.map_to_curve_simple_swu_3mod4)(new math_js_1.Fp(u[0][0]));
        const [x1, y1] = (0, math_js_1.isogenyMapG1)(x0, y0);
        return new PointG1(x1, y1).clearCofactor();
    }
    static fromPrivateKey(privateKey) {
        return this.BASE.multiplyPrecomputed(normalizePrivKey(privateKey));
    }
    toRawBytes(isCompressed = false) {
        return (0, math_js_1.hexToBytes)(this.toHex(isCompressed));
    }
    toHex(isCompressed = false) {
        this.assertValidity();
        if (isCompressed) {
            const { P } = math_js_1.CURVE;
            let hex;
            if (this.isZero()) {
                hex = POW_2_383 + POW_2_382;
            }
            else {
                const [x, y] = this.toAffine();
                const flag = (y.value * 2n) / P;
                hex = x.value + flag * POW_2_381 + POW_2_383;
            }
            return toPaddedHex(hex, PUBLIC_KEY_LENGTH);
        }
        else {
            if (this.isZero()) {
                return '4'.padEnd(2 * 2 * PUBLIC_KEY_LENGTH, '0');
            }
            else {
                const [x, y] = this.toAffine();
                return toPaddedHex(x.value, PUBLIC_KEY_LENGTH) + toPaddedHex(y.value, PUBLIC_KEY_LENGTH);
            }
        }
    }
    assertValidity() {
        if (this.isZero())
            return this;
        if (!this.isOnCurve())
            throw new Error('Invalid G1 point: not on curve Fp');
        if (!this.isTorsionFree())
            throw new Error('Invalid G1 point: must be of prime-order subgroup');
        return this;
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
    }
    millerLoop(P) {
        return (0, math_js_1.millerLoop)(P.pairingPrecomputes(), this.toAffine());
    }
    clearCofactor() {
        const t = this.mulCurveMinusX();
        return t.add(this);
    }
    isOnCurve() {
        const b = new math_js_1.Fp(math_js_1.CURVE.b);
        const { x, y, z } = this;
        const left = y.pow(2n).multiply(z).subtract(x.pow(3n));
        const right = b.multiply(z.pow(3n));
        return left.subtract(right).isZero();
    }
    sigma() {
        const BETA = 0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn;
        const [x, y] = this.toAffine();
        return new PointG1(x.multiply(BETA), y);
    }
    phi() {
        const cubicRootOfUnityModP = 0x5f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen;
        return new PointG1(this.x.multiply(cubicRootOfUnityModP), this.y, this.z);
    }
    mulCurveX() {
        return this.multiplyUnsafe(math_js_1.CURVE.x).negate();
    }
    mulCurveMinusX() {
        return this.multiplyUnsafe(math_js_1.CURVE.x);
    }
    isTorsionFree() {
        const xP = this.mulCurveX();
        const u2P = xP.mulCurveMinusX();
        return u2P.equals(this.phi());
    }
}
exports.PointG1 = PointG1;
PointG1.BASE = new PointG1(new math_js_1.Fp(math_js_1.CURVE.Gx), new math_js_1.Fp(math_js_1.CURVE.Gy), math_js_1.Fp.ONE);
PointG1.ZERO = new PointG1(math_js_1.Fp.ONE, math_js_1.Fp.ONE, math_js_1.Fp.ZERO);
class PointG2 extends math_js_1.ProjectivePoint {
    constructor(x, y, z = math_js_1.Fp2.ONE) {
        super(x, y, z, math_js_1.Fp2);
        assertType(x, math_js_1.Fp2);
        assertType(y, math_js_1.Fp2);
        assertType(z, math_js_1.Fp2);
    }
    static async hashToCurve(msg, options) {
        msg = ensureBytes(msg);
        const u = await hash_to_field(msg, 2, options);
        const [x0, y0] = (0, math_js_1.map_to_curve_simple_swu_9mod16)(math_js_1.Fp2.fromBigTuple(u[0]));
        const [x1, y1] = (0, math_js_1.map_to_curve_simple_swu_9mod16)(math_js_1.Fp2.fromBigTuple(u[1]));
        const [x2, y2] = new PointG2(x0, y0).add(new PointG2(x1, y1)).toAffine();
        const [x3, y3] = (0, math_js_1.isogenyMapG2)(x2, y2);
        return new PointG2(x3, y3).clearCofactor();
    }
    static async encodeToCurve(msg, options) {
        msg = ensureBytes(msg);
        const u = await hash_to_field(msg, 1, options);
        const [x0, y0] = (0, math_js_1.map_to_curve_simple_swu_9mod16)(math_js_1.Fp2.fromBigTuple(u[0]));
        const [x1, y1] = (0, math_js_1.isogenyMapG2)(x0, y0);
        return new PointG2(x1, y1).clearCofactor();
    }
    static fromSignature(hex) {
        hex = ensureBytes(hex);
        const { P } = math_js_1.CURVE;
        const half = hex.length / 2;
        if (half !== 48 && half !== 96)
            throw new Error('Invalid compressed signature length, must be 96 or 192');
        const z1 = (0, math_js_1.bytesToNumberBE)(hex.slice(0, half));
        const z2 = (0, math_js_1.bytesToNumberBE)(hex.slice(half));
        const bflag1 = (0, math_js_1.mod)(z1, POW_2_383) / POW_2_382;
        if (bflag1 === 1n)
            return this.ZERO;
        const x1 = new math_js_1.Fp(z1 % POW_2_381);
        const x2 = new math_js_1.Fp(z2);
        const x = new math_js_1.Fp2(x2, x1);
        const y2 = x.pow(3n).add(math_js_1.Fp2.fromBigTuple(math_js_1.CURVE.b2));
        let y = y2.sqrt();
        if (!y)
            throw new Error('Failed to find a square root');
        const { re: y0, im: y1 } = y.reim();
        const aflag1 = (z1 % POW_2_382) / POW_2_381;
        const isGreater = y1 > 0n && (y1 * 2n) / P !== aflag1;
        const isZero = y1 === 0n && (y0 * 2n) / P !== aflag1;
        if (isGreater || isZero)
            y = y.multiply(-1n);
        const point = new PointG2(x, y, math_js_1.Fp2.ONE);
        point.assertValidity();
        return point;
    }
    static fromHex(bytes) {
        bytes = ensureBytes(bytes);
        const m_byte = bytes[0] & 0xe0;
        if (m_byte === 0x20 || m_byte === 0x60 || m_byte === 0xe0) {
            throw new Error('Invalid encoding flag: ' + m_byte);
        }
        const bitC = m_byte & 0x80;
        const bitI = m_byte & 0x40;
        const bitS = m_byte & 0x20;
        let point;
        if (bytes.length === 96 && bitC) {
            const { P, b2 } = math_js_1.CURVE;
            const b = math_js_1.Fp2.fromBigTuple(b2);
            bytes[0] = bytes[0] & 0x1f;
            if (bitI) {
                if (bytes.reduce((p, c) => (p !== 0 ? c + 1 : c), 0) > 0) {
                    throw new Error('Invalid compressed G2 point');
                }
                return PointG2.ZERO;
            }
            const x_1 = (0, math_js_1.bytesToNumberBE)(bytes.slice(0, PUBLIC_KEY_LENGTH));
            const x_0 = (0, math_js_1.bytesToNumberBE)(bytes.slice(PUBLIC_KEY_LENGTH));
            const x = new math_js_1.Fp2(new math_js_1.Fp(x_0), new math_js_1.Fp(x_1));
            const right = x.pow(3n).add(b);
            let y = right.sqrt();
            if (!y)
                throw new Error('Invalid compressed G2 point');
            const Y_bit = y.c1.value === 0n ? (y.c0.value * 2n) / P : (y.c1.value * 2n) / P ? 1n : 0n;
            y = bitS > 0 && Y_bit > 0 ? y : y.negate();
            return new PointG2(x, y);
        }
        else if (bytes.length === 192 && !bitC) {
            if ((bytes[0] & (1 << 6)) !== 0) {
                return PointG2.ZERO;
            }
            const x1 = (0, math_js_1.bytesToNumberBE)(bytes.slice(0, PUBLIC_KEY_LENGTH));
            const x0 = (0, math_js_1.bytesToNumberBE)(bytes.slice(PUBLIC_KEY_LENGTH, 2 * PUBLIC_KEY_LENGTH));
            const y1 = (0, math_js_1.bytesToNumberBE)(bytes.slice(2 * PUBLIC_KEY_LENGTH, 3 * PUBLIC_KEY_LENGTH));
            const y0 = (0, math_js_1.bytesToNumberBE)(bytes.slice(3 * PUBLIC_KEY_LENGTH));
            point = new PointG2(math_js_1.Fp2.fromBigTuple([x0, x1]), math_js_1.Fp2.fromBigTuple([y0, y1]));
        }
        else {
            throw new Error('Invalid point G2, expected 96/192 bytes');
        }
        point.assertValidity();
        return point;
    }
    static fromPrivateKey(privateKey) {
        return this.BASE.multiplyPrecomputed(normalizePrivKey(privateKey));
    }
    toSignature() {
        if (this.equals(PointG2.ZERO)) {
            const sum = POW_2_383 + POW_2_382;
            const h = toPaddedHex(sum, PUBLIC_KEY_LENGTH) + toPaddedHex(0n, PUBLIC_KEY_LENGTH);
            return (0, math_js_1.hexToBytes)(h);
        }
        const [{ re: x0, im: x1 }, { re: y0, im: y1 }] = this.toAffine().map((a) => a.reim());
        const tmp = y1 > 0n ? y1 * 2n : y0 * 2n;
        const aflag1 = tmp / math_js_1.CURVE.P;
        const z1 = x1 + aflag1 * POW_2_381 + POW_2_383;
        const z2 = x0;
        return (0, math_js_1.hexToBytes)(toPaddedHex(z1, PUBLIC_KEY_LENGTH) + toPaddedHex(z2, PUBLIC_KEY_LENGTH));
    }
    toRawBytes(isCompressed = false) {
        return (0, math_js_1.hexToBytes)(this.toHex(isCompressed));
    }
    toHex(isCompressed = false) {
        this.assertValidity();
        if (isCompressed) {
            const { P } = math_js_1.CURVE;
            let x_1 = 0n;
            let x_0 = 0n;
            if (this.isZero()) {
                x_1 = POW_2_383 + POW_2_382;
            }
            else {
                const [x, y] = this.toAffine();
                const flag = y.c1.value === 0n ? (y.c0.value * 2n) / P : (y.c1.value * 2n) / P ? 1n : 0n;
                x_1 = x.c1.value + flag * POW_2_381 + POW_2_383;
                x_0 = x.c0.value;
            }
            return toPaddedHex(x_1, PUBLIC_KEY_LENGTH) + toPaddedHex(x_0, PUBLIC_KEY_LENGTH);
        }
        else {
            if (this.equals(PointG2.ZERO)) {
                return '4'.padEnd(2 * 4 * PUBLIC_KEY_LENGTH, '0');
            }
            const [{ re: x0, im: x1 }, { re: y0, im: y1 }] = this.toAffine().map((a) => a.reim());
            return (toPaddedHex(x1, PUBLIC_KEY_LENGTH) +
                toPaddedHex(x0, PUBLIC_KEY_LENGTH) +
                toPaddedHex(y1, PUBLIC_KEY_LENGTH) +
                toPaddedHex(y0, PUBLIC_KEY_LENGTH));
        }
    }
    assertValidity() {
        if (this.isZero())
            return this;
        if (!this.isOnCurve())
            throw new Error('Invalid G2 point: not on curve Fp2');
        if (!this.isTorsionFree())
            throw new Error('Invalid G2 point: must be of prime-order subgroup');
        return this;
    }
    psi() {
        return this.fromAffineTuple((0, math_js_1.psi)(...this.toAffine()));
    }
    psi2() {
        return this.fromAffineTuple((0, math_js_1.psi2)(...this.toAffine()));
    }
    mulCurveX() {
        return this.multiplyUnsafe(math_js_1.CURVE.x).negate();
    }
    clearCofactor() {
        const P = this;
        let t1 = P.mulCurveX();
        let t2 = P.psi();
        let t3 = P.double();
        t3 = t3.psi2();
        t3 = t3.subtract(t2);
        t2 = t1.add(t2);
        t2 = t2.mulCurveX();
        t3 = t3.add(t2);
        t3 = t3.subtract(t1);
        const Q = t3.subtract(P);
        return Q;
    }
    isOnCurve() {
        const b = math_js_1.Fp2.fromBigTuple(math_js_1.CURVE.b2);
        const { x, y, z } = this;
        const left = y.pow(2n).multiply(z).subtract(x.pow(3n));
        const right = b.multiply(z.pow(3n));
        return left.subtract(right).isZero();
    }
    isTorsionFree() {
        const P = this;
        return P.mulCurveX().equals(P.psi());
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
    }
    clearPairingPrecomputes() {
        this._PPRECOMPUTES = undefined;
    }
    pairingPrecomputes() {
        if (this._PPRECOMPUTES)
            return this._PPRECOMPUTES;
        this._PPRECOMPUTES = (0, math_js_1.calcPairingPrecomputes)(...this.toAffine());
        return this._PPRECOMPUTES;
    }
}
exports.PointG2 = PointG2;
PointG2.BASE = new PointG2(math_js_1.Fp2.fromBigTuple(math_js_1.CURVE.G2x), math_js_1.Fp2.fromBigTuple(math_js_1.CURVE.G2y), math_js_1.Fp2.ONE);
PointG2.ZERO = new PointG2(math_js_1.Fp2.ONE, math_js_1.Fp2.ONE, math_js_1.Fp2.ZERO);
function pairing(P, Q, withFinalExponent = true) {
    if (P.isZero() || Q.isZero())
        throw new Error('No pairings at point of Infinity');
    P.assertValidity();
    Q.assertValidity();
    const looped = P.millerLoop(Q);
    return withFinalExponent ? looped.finalExponentiate() : looped;
}
exports.pairing = pairing;
function normP1(point) {
    return point instanceof PointG1 ? point : PointG1.fromHex(point);
}
function normP2(point) {
    return point instanceof PointG2 ? point : PointG2.fromSignature(point);
}
async function normP2Hash(point) {
    return point instanceof PointG2 ? point : PointG2.hashToCurve(point);
}
function getPublicKey(privateKey) {
    return PointG1.fromPrivateKey(privateKey).toRawBytes(true);
}
exports.getPublicKey = getPublicKey;
async function sign(message, privateKey) {
    const msgPoint = await normP2Hash(message);
    msgPoint.assertValidity();
    const sigPoint = msgPoint.multiply(normalizePrivKey(privateKey));
    if (message instanceof PointG2)
        return sigPoint;
    return sigPoint.toSignature();
}
exports.sign = sign;
async function verify(signature, message, publicKey) {
    const P = normP1(publicKey);
    const Hm = await normP2Hash(message);
    const G = PointG1.BASE;
    const S = normP2(signature);
    const ePHm = pairing(P.negate(), Hm, false);
    const eGS = pairing(G, S, false);
    const exp = eGS.multiply(ePHm).finalExponentiate();
    return exp.equals(math_js_1.Fp12.ONE);
}
exports.verify = verify;
function aggregatePublicKeys(publicKeys) {
    if (!publicKeys.length)
        throw new Error('Expected non-empty array');
    const agg = publicKeys.map(normP1).reduce((sum, p) => sum.add(p), PointG1.ZERO);
    if (publicKeys[0] instanceof PointG1)
        return agg.assertValidity();
    return agg.toRawBytes(true);
}
exports.aggregatePublicKeys = aggregatePublicKeys;
function aggregateSignatures(signatures) {
    if (!signatures.length)
        throw new Error('Expected non-empty array');
    const agg = signatures.map(normP2).reduce((sum, s) => sum.add(s), PointG2.ZERO);
    if (signatures[0] instanceof PointG2)
        return agg.assertValidity();
    return agg.toSignature();
}
exports.aggregateSignatures = aggregateSignatures;
async function verifyBatch(signature, messages, publicKeys) {
    if (!messages.length)
        throw new Error('Expected non-empty messages array');
    if (publicKeys.length !== messages.length)
        throw new Error('Pubkey count should equal msg count');
    const sig = normP2(signature);
    const nMessages = await Promise.all(messages.map(normP2Hash));
    const nPublicKeys = publicKeys.map(normP1);
    try {
        const paired = [];
        for (const message of new Set(nMessages)) {
            const groupPublicKey = nMessages.reduce((groupPublicKey, subMessage, i) => subMessage === message ? groupPublicKey.add(nPublicKeys[i]) : groupPublicKey, PointG1.ZERO);
            paired.push(pairing(groupPublicKey, message, false));
        }
        paired.push(pairing(PointG1.BASE.negate(), sig, false));
        const product = paired.reduce((a, b) => a.multiply(b), math_js_1.Fp12.ONE);
        const exp = product.finalExponentiate();
        return exp.equals(math_js_1.Fp12.ONE);
    }
    catch {
        return false;
    }
}
exports.verifyBatch = verifyBatch;
PointG1.BASE.calcMultiplyPrecomputes(4);

},{"./math.js":4,"crypto":1}],4:[function(require,module,exports){
"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.psi2 = exports.psi = exports.millerLoop = exports.calcPairingPrecomputes = exports.isogenyMapG1 = exports.isogenyMapG2 = exports.map_to_curve_simple_swu_3mod4 = exports.map_to_curve_simple_swu_9mod16 = exports.ProjectivePoint = exports.Fp12 = exports.Fp6 = exports.Fp2 = exports.Fr = exports.Fp = exports.concatBytes = exports.bytesToNumberBE = exports.bytesToHex = exports.numberToBytesBE = exports.hexToBytes = exports.powMod = exports.mod = exports.CURVE = void 0;
exports.CURVE = {
    P: 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn,
    r: 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001n,
    h: 0x396c8c005555e1568c00aaab0000aaabn,
    Gx: 0x17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bbn,
    Gy: 0x08b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1n,
    b: 4n,
    P2: 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn **
        2n -
        1n,
    h2: 0x5d543a95414e7f1091d50792876a202cd91de4547085abaa68a205b2e5a7ddfa628f1cb4d9e82ef21537e293a6691ae1616ec6e786f0c70cf1c38e31c7238e5n,
    G2x: [
        0x024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb8n,
        0x13e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7en,
    ],
    G2y: [
        0x0ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d429a695160d12c923ac9cc3baca289e193548608b82801n,
        0x0606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79ben,
    ],
    b2: [4n, 4n],
    x: 0xd201000000010000n,
    h2Eff: 0xbc69f08f2ee75b3584c6a0ea91b352888e2a8e9145ad7689986ff031508ffe1329c2f178731db956d82bf015d1212b02ec0ec69d7477c1ae954cbc06689f6a359894c0adebbf6b4e8020005aaa95551n,
};
const BLS_X_LEN = bitLen(exports.CURVE.x);
function mod(a, b) {
    const res = a % b;
    return res >= 0n ? res : b + res;
}
exports.mod = mod;
function powMod(num, power, modulo) {
    if (modulo <= 0n || power < 0n)
        throw new Error('Expected power/modulo > 0');
    if (modulo === 1n)
        return 0n;
    let res = 1n;
    while (power > 0n) {
        if (power & 1n)
            res = (res * num) % modulo;
        num = (num * num) % modulo;
        power >>= 1n;
    }
    return res;
}
exports.powMod = powMod;
function genInvertBatch(cls, nums) {
    const tmp = new Array(nums.length);
    const lastMultiplied = nums.reduce((acc, num, i) => {
        if (num.isZero())
            return acc;
        tmp[i] = acc;
        return acc.multiply(num);
    }, cls.ONE);
    const inverted = lastMultiplied.invert();
    nums.reduceRight((acc, num, i) => {
        if (num.isZero())
            return acc;
        tmp[i] = acc.multiply(tmp[i]);
        return acc.multiply(num);
    }, inverted);
    return tmp;
}
function bitLen(n) {
    let len;
    for (len = 0; n > 0n; n >>= 1n, len += 1)
        ;
    return len;
}
function bitGet(n, pos) {
    return (n >> BigInt(pos)) & 1n;
}
function invert(number, modulo = exports.CURVE.P) {
    const _0n = 0n;
    const _1n = 1n;
    if (number === _0n || modulo <= _0n) {
        throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
    }
    let a = mod(number, modulo);
    let b = modulo;
    let x = _0n, y = _1n, u = _1n, v = _0n;
    while (a !== _0n) {
        const q = b / a;
        const r = b % a;
        const m = x - u * q;
        const n = y - v * q;
        b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== _1n)
        throw new Error('invert: does not exist');
    return mod(x, modulo);
}
function hexToBytes(hex) {
    if (typeof hex !== 'string') {
        throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
    }
    if (hex.length % 2)
        throw new Error('hexToBytes: received invalid unpadded hex');
    const array = new Uint8Array(hex.length / 2);
    for (let i = 0; i < array.length; i++) {
        const j = i * 2;
        const hexByte = hex.slice(j, j + 2);
        if (hexByte.length !== 2)
            throw new Error('Invalid byte sequence');
        const byte = Number.parseInt(hexByte, 16);
        if (Number.isNaN(byte) || byte < 0)
            throw new Error('Invalid byte sequence');
        array[i] = byte;
    }
    return array;
}
exports.hexToBytes = hexToBytes;
function numberToHex(num, byteLength) {
    if (!byteLength)
        throw new Error('byteLength target must be specified');
    const hex = num.toString(16);
    const p1 = hex.length & 1 ? `0${hex}` : hex;
    return p1.padStart(byteLength * 2, '0');
}
function numberToBytesBE(num, byteLength) {
    const res = hexToBytes(numberToHex(num, byteLength));
    if (res.length !== byteLength)
        throw new Error('numberToBytesBE: wrong byteLength');
    return res;
}
exports.numberToBytesBE = numberToBytesBE;
const hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));
function bytesToHex(uint8a) {
    let hex = '';
    for (let i = 0; i < uint8a.length; i++) {
        hex += hexes[uint8a[i]];
    }
    return hex;
}
exports.bytesToHex = bytesToHex;
function bytesToNumberBE(bytes) {
    return BigInt('0x' + bytesToHex(bytes));
}
exports.bytesToNumberBE = bytesToNumberBE;
function concatBytes(...arrays) {
    if (arrays.length === 1)
        return arrays[0];
    const length = arrays.reduce((a, arr) => a + arr.length, 0);
    const result = new Uint8Array(length);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
        const arr = arrays[i];
        result.set(arr, pad);
        pad += arr.length;
    }
    return result;
}
exports.concatBytes = concatBytes;
class Fp {
    constructor(value) {
        this.value = mod(value, Fp.ORDER);
    }
    isZero() {
        return this.value === 0n;
    }
    equals(rhs) {
        return this.value === rhs.value;
    }
    negate() {
        return new Fp(-this.value);
    }
    invert() {
        return new Fp(invert(this.value, Fp.ORDER));
    }
    add(rhs) {
        return new Fp(this.value + rhs.value);
    }
    square() {
        return new Fp(this.value * this.value);
    }
    pow(n) {
        return new Fp(powMod(this.value, n, Fp.ORDER));
    }
    sqrt() {
        const root = this.pow((Fp.ORDER + 1n) / 4n);
        if (!root.square().equals(this))
            return;
        return root;
    }
    subtract(rhs) {
        return new Fp(this.value - rhs.value);
    }
    multiply(rhs) {
        if (rhs instanceof Fp)
            rhs = rhs.value;
        return new Fp(this.value * rhs);
    }
    div(rhs) {
        if (typeof rhs === 'bigint')
            rhs = new Fp(rhs);
        return this.multiply(rhs.invert());
    }
    toString() {
        const str = this.value.toString(16).padStart(96, '0');
        return str.slice(0, 2) + '.' + str.slice(-2);
    }
    static fromBytes(b) {
        if (b.length !== Fp.BYTES_LEN)
            throw new Error(`fromBytes wrong length=${b.length}`);
        return new Fp(bytesToNumberBE(b));
    }
    toBytes() {
        return numberToBytesBE(this.value, Fp.BYTES_LEN);
    }
}
exports.Fp = Fp;
_a = Fp;
Fp.ORDER = exports.CURVE.P;
Fp.MAX_BITS = bitLen(exports.CURVE.P);
Fp.BYTES_LEN = Math.ceil(_a.MAX_BITS / 8);
Fp.ZERO = new Fp(0n);
Fp.ONE = new Fp(1n);
class Fr {
    constructor(value) {
        this.value = mod(value, Fr.ORDER);
    }
    static isValid(b) {
        return b <= Fr.ORDER;
    }
    isZero() {
        return this.value === 0n;
    }
    equals(rhs) {
        return this.value === rhs.value;
    }
    negate() {
        return new Fr(-this.value);
    }
    invert() {
        return new Fr(invert(this.value, Fr.ORDER));
    }
    add(rhs) {
        return new Fr(this.value + rhs.value);
    }
    square() {
        return new Fr(this.value * this.value);
    }
    pow(n) {
        return new Fr(powMod(this.value, n, Fr.ORDER));
    }
    subtract(rhs) {
        return new Fr(this.value - rhs.value);
    }
    multiply(rhs) {
        if (rhs instanceof Fr)
            rhs = rhs.value;
        return new Fr(this.value * rhs);
    }
    div(rhs) {
        if (typeof rhs === 'bigint')
            rhs = new Fr(rhs);
        return this.multiply(rhs.invert());
    }
    legendre() {
        return this.pow((Fr.ORDER - 1n) / 2n);
    }
    sqrt() {
        if (!this.legendre().equals(Fr.ONE))
            return;
        const P = Fr.ORDER;
        let q, s, z;
        for (q = P - 1n, s = 0; q % 2n === 0n; q /= 2n, s++)
            ;
        if (s === 1)
            return this.pow((P + 1n) / 4n);
        for (z = 2n; z < P && new Fr(z).legendre().value !== P - 1n; z++)
            ;
        let c = powMod(z, q, P);
        let r = powMod(this.value, (q + 1n) / 2n, P);
        let t = powMod(this.value, q, P);
        let t2 = 0n;
        while (mod(t - 1n, P) !== 0n) {
            t2 = mod(t * t, P);
            let i;
            for (i = 1; i < s; i++) {
                if (mod(t2 - 1n, P) === 0n)
                    break;
                t2 = mod(t2 * t2, P);
            }
            let b = powMod(c, BigInt(1 << (s - i - 1)), P);
            r = mod(r * b, P);
            c = mod(b * b, P);
            t = mod(t * c, P);
            s = i;
        }
        return new Fr(r);
    }
    toString() {
        return '0x' + this.value.toString(16).padStart(64, '0');
    }
}
exports.Fr = Fr;
Fr.ORDER = exports.CURVE.r;
Fr.ZERO = new Fr(0n);
Fr.ONE = new Fr(1n);
function powMod_FQP(fqp, fqpOne, n) {
    const elm = fqp;
    if (n === 0n)
        return fqpOne;
    if (n === 1n)
        return elm;
    let p = fqpOne;
    let d = elm;
    while (n > 0n) {
        if (n & 1n)
            p = p.multiply(d);
        n >>= 1n;
        d = d.square();
    }
    return p;
}
class Fp2 {
    constructor(c0, c1) {
        this.c0 = c0;
        this.c1 = c1;
        if (typeof c0 === 'bigint')
            throw new Error('c0: Expected Fp');
        if (typeof c1 === 'bigint')
            throw new Error('c1: Expected Fp');
    }
    static fromBigTuple(tuple) {
        const fps = tuple.map((n) => new Fp(n));
        return new Fp2(...fps);
    }
    one() {
        return Fp2.ONE;
    }
    isZero() {
        return this.c0.isZero() && this.c1.isZero();
    }
    toString() {
        return `Fp2(${this.c0} + ${this.c1}×i)`;
    }
    reim() {
        return { re: this.c0.value, im: this.c1.value };
    }
    negate() {
        const { c0, c1 } = this;
        return new Fp2(c0.negate(), c1.negate());
    }
    equals(rhs) {
        const { c0, c1 } = this;
        const { c0: r0, c1: r1 } = rhs;
        return c0.equals(r0) && c1.equals(r1);
    }
    add(rhs) {
        const { c0, c1 } = this;
        const { c0: r0, c1: r1 } = rhs;
        return new Fp2(c0.add(r0), c1.add(r1));
    }
    subtract(rhs) {
        const { c0, c1 } = this;
        const { c0: r0, c1: r1 } = rhs;
        return new Fp2(c0.subtract(r0), c1.subtract(r1));
    }
    multiply(rhs) {
        const { c0, c1 } = this;
        if (typeof rhs === 'bigint') {
            return new Fp2(c0.multiply(rhs), c1.multiply(rhs));
        }
        const { c0: r0, c1: r1 } = rhs;
        let t1 = c0.multiply(r0);
        let t2 = c1.multiply(r1);
        return new Fp2(t1.subtract(t2), c0.add(c1).multiply(r0.add(r1)).subtract(t1.add(t2)));
    }
    pow(n) {
        return powMod_FQP(this, Fp2.ONE, n);
    }
    div(rhs) {
        const inv = typeof rhs === 'bigint' ? new Fp(rhs).invert().value : rhs.invert();
        return this.multiply(inv);
    }
    mulByNonresidue() {
        const c0 = this.c0;
        const c1 = this.c1;
        return new Fp2(c0.subtract(c1), c0.add(c1));
    }
    square() {
        const c0 = this.c0;
        const c1 = this.c1;
        const a = c0.add(c1);
        const b = c0.subtract(c1);
        const c = c0.add(c0);
        return new Fp2(a.multiply(b), c.multiply(c1));
    }
    sqrt() {
        const candidateSqrt = this.pow((Fp2.ORDER + 8n) / 16n);
        const check = candidateSqrt.square().div(this);
        const R = FP2_ROOTS_OF_UNITY;
        const divisor = [R[0], R[2], R[4], R[6]].find((r) => r.equals(check));
        if (!divisor)
            return;
        const index = R.indexOf(divisor);
        const root = R[index / 2];
        if (!root)
            throw new Error('Invalid root');
        const x1 = candidateSqrt.div(root);
        const x2 = x1.negate();
        const { re: re1, im: im1 } = x1.reim();
        const { re: re2, im: im2 } = x2.reim();
        if (im1 > im2 || (im1 === im2 && re1 > re2))
            return x1;
        return x2;
    }
    invert() {
        const { re: a, im: b } = this.reim();
        const factor = new Fp(a * a + b * b).invert();
        return new Fp2(factor.multiply(new Fp(a)), factor.multiply(new Fp(-b)));
    }
    frobeniusMap(power) {
        return new Fp2(this.c0, this.c1.multiply(FP2_FROBENIUS_COEFFICIENTS[power % 2]));
    }
    multiplyByB() {
        let c0 = this.c0;
        let c1 = this.c1;
        let t0 = c0.multiply(4n);
        let t1 = c1.multiply(4n);
        return new Fp2(t0.subtract(t1), t0.add(t1));
    }
    static fromBytes(b) {
        if (b.length !== Fp2.BYTES_LEN)
            throw new Error(`fromBytes wrong length=${b.length}`);
        return new Fp2(Fp.fromBytes(b.subarray(0, Fp.BYTES_LEN)), Fp.fromBytes(b.subarray(Fp.BYTES_LEN)));
    }
    toBytes() {
        return concatBytes(this.c0.toBytes(), this.c1.toBytes());
    }
}
exports.Fp2 = Fp2;
_b = Fp2;
Fp2.ORDER = exports.CURVE.P2;
Fp2.MAX_BITS = bitLen(exports.CURVE.P2);
Fp2.BYTES_LEN = Math.ceil(_b.MAX_BITS / 8);
Fp2.ZERO = new Fp2(Fp.ZERO, Fp.ZERO);
Fp2.ONE = new Fp2(Fp.ONE, Fp.ZERO);
class Fp6 {
    constructor(c0, c1, c2) {
        this.c0 = c0;
        this.c1 = c1;
        this.c2 = c2;
    }
    static fromBigSix(t) {
        if (!Array.isArray(t) || t.length !== 6)
            throw new Error('Invalid Fp6 usage');
        const c = [t.slice(0, 2), t.slice(2, 4), t.slice(4, 6)].map((t) => Fp2.fromBigTuple(t));
        return new Fp6(...c);
    }
    fromTriple(triple) {
        return new Fp6(...triple);
    }
    one() {
        return Fp6.ONE;
    }
    isZero() {
        return this.c0.isZero() && this.c1.isZero() && this.c2.isZero();
    }
    negate() {
        const { c0, c1, c2 } = this;
        return new Fp6(c0.negate(), c1.negate(), c2.negate());
    }
    toString() {
        return `Fp6(${this.c0} + ${this.c1} * v, ${this.c2} * v^2)`;
    }
    equals(rhs) {
        const { c0, c1, c2 } = this;
        const { c0: r0, c1: r1, c2: r2 } = rhs;
        return c0.equals(r0) && c1.equals(r1) && c2.equals(r2);
    }
    add(rhs) {
        const { c0, c1, c2 } = this;
        const { c0: r0, c1: r1, c2: r2 } = rhs;
        return new Fp6(c0.add(r0), c1.add(r1), c2.add(r2));
    }
    subtract(rhs) {
        const { c0, c1, c2 } = this;
        const { c0: r0, c1: r1, c2: r2 } = rhs;
        return new Fp6(c0.subtract(r0), c1.subtract(r1), c2.subtract(r2));
    }
    multiply(rhs) {
        if (typeof rhs === 'bigint') {
            return new Fp6(this.c0.multiply(rhs), this.c1.multiply(rhs), this.c2.multiply(rhs));
        }
        let { c0, c1, c2 } = this;
        let { c0: r0, c1: r1, c2: r2 } = rhs;
        let t0 = c0.multiply(r0);
        let t1 = c1.multiply(r1);
        let t2 = c2.multiply(r2);
        return new Fp6(t0.add(c1.add(c2).multiply(r1.add(r2)).subtract(t1.add(t2)).mulByNonresidue()), c0.add(c1).multiply(r0.add(r1)).subtract(t0.add(t1)).add(t2.mulByNonresidue()), t1.add(c0.add(c2).multiply(r0.add(r2)).subtract(t0.add(t2))));
    }
    pow(n) {
        return powMod_FQP(this, Fp6.ONE, n);
    }
    div(rhs) {
        const inv = typeof rhs === 'bigint' ? new Fp(rhs).invert().value : rhs.invert();
        return this.multiply(inv);
    }
    mulByNonresidue() {
        return new Fp6(this.c2.mulByNonresidue(), this.c0, this.c1);
    }
    multiplyBy1(b1) {
        return new Fp6(this.c2.multiply(b1).mulByNonresidue(), this.c0.multiply(b1), this.c1.multiply(b1));
    }
    multiplyBy01(b0, b1) {
        let { c0, c1, c2 } = this;
        let t0 = c0.multiply(b0);
        let t1 = c1.multiply(b1);
        return new Fp6(c1.add(c2).multiply(b1).subtract(t1).mulByNonresidue().add(t0), b0.add(b1).multiply(c0.add(c1)).subtract(t0).subtract(t1), c0.add(c2).multiply(b0).subtract(t0).add(t1));
    }
    multiplyByFp2(rhs) {
        let { c0, c1, c2 } = this;
        return new Fp6(c0.multiply(rhs), c1.multiply(rhs), c2.multiply(rhs));
    }
    square() {
        let { c0, c1, c2 } = this;
        let t0 = c0.square();
        let t1 = c0.multiply(c1).multiply(2n);
        let t3 = c1.multiply(c2).multiply(2n);
        let t4 = c2.square();
        return new Fp6(t3.mulByNonresidue().add(t0), t4.mulByNonresidue().add(t1), t1.add(c0.subtract(c1).add(c2).square()).add(t3).subtract(t0).subtract(t4));
    }
    invert() {
        let { c0, c1, c2 } = this;
        let t0 = c0.square().subtract(c2.multiply(c1).mulByNonresidue());
        let t1 = c2.square().mulByNonresidue().subtract(c0.multiply(c1));
        let t2 = c1.square().subtract(c0.multiply(c2));
        let t4 = c2.multiply(t1).add(c1.multiply(t2)).mulByNonresidue().add(c0.multiply(t0)).invert();
        return new Fp6(t4.multiply(t0), t4.multiply(t1), t4.multiply(t2));
    }
    frobeniusMap(power) {
        return new Fp6(this.c0.frobeniusMap(power), this.c1.frobeniusMap(power).multiply(FP6_FROBENIUS_COEFFICIENTS_1[power % 6]), this.c2.frobeniusMap(power).multiply(FP6_FROBENIUS_COEFFICIENTS_2[power % 6]));
    }
    static fromBytes(b) {
        if (b.length !== Fp6.BYTES_LEN)
            throw new Error(`fromBytes wrong length=${b.length}`);
        return new Fp6(Fp2.fromBytes(b.subarray(0, Fp2.BYTES_LEN)), Fp2.fromBytes(b.subarray(Fp2.BYTES_LEN, 2 * Fp2.BYTES_LEN)), Fp2.fromBytes(b.subarray(2 * Fp2.BYTES_LEN)));
    }
    toBytes() {
        return concatBytes(this.c0.toBytes(), this.c1.toBytes(), this.c2.toBytes());
    }
}
exports.Fp6 = Fp6;
Fp6.ZERO = new Fp6(Fp2.ZERO, Fp2.ZERO, Fp2.ZERO);
Fp6.ONE = new Fp6(Fp2.ONE, Fp2.ZERO, Fp2.ZERO);
Fp6.BYTES_LEN = 3 * Fp2.BYTES_LEN;
class Fp12 {
    constructor(c0, c1) {
        this.c0 = c0;
        this.c1 = c1;
    }
    static fromBigTwelve(t) {
        return new Fp12(Fp6.fromBigSix(t.slice(0, 6)), Fp6.fromBigSix(t.slice(6, 12)));
    }
    fromTuple(c) {
        return new Fp12(...c);
    }
    one() {
        return Fp12.ONE;
    }
    isZero() {
        return this.c0.isZero() && this.c1.isZero();
    }
    toString() {
        return `Fp12(${this.c0} + ${this.c1} * w)`;
    }
    negate() {
        const { c0, c1 } = this;
        return new Fp12(c0.negate(), c1.negate());
    }
    equals(rhs) {
        const { c0, c1 } = this;
        const { c0: r0, c1: r1 } = rhs;
        return c0.equals(r0) && c1.equals(r1);
    }
    add(rhs) {
        const { c0, c1 } = this;
        const { c0: r0, c1: r1 } = rhs;
        return new Fp12(c0.add(r0), c1.add(r1));
    }
    subtract(rhs) {
        const { c0, c1 } = this;
        const { c0: r0, c1: r1 } = rhs;
        return new Fp12(c0.subtract(r0), c1.subtract(r1));
    }
    multiply(rhs) {
        if (typeof rhs === 'bigint')
            return new Fp12(this.c0.multiply(rhs), this.c1.multiply(rhs));
        let { c0, c1 } = this;
        let { c0: r0, c1: r1 } = rhs;
        let t1 = c0.multiply(r0);
        let t2 = c1.multiply(r1);
        return new Fp12(t1.add(t2.mulByNonresidue()), c0.add(c1).multiply(r0.add(r1)).subtract(t1.add(t2)));
    }
    pow(n) {
        return powMod_FQP(this, Fp12.ONE, n);
    }
    div(rhs) {
        const inv = typeof rhs === 'bigint' ? new Fp(rhs).invert().value : rhs.invert();
        return this.multiply(inv);
    }
    multiplyBy014(o0, o1, o4) {
        let { c0, c1 } = this;
        let t0 = c0.multiplyBy01(o0, o1);
        let t1 = c1.multiplyBy1(o4);
        return new Fp12(t1.mulByNonresidue().add(t0), c1.add(c0).multiplyBy01(o0, o1.add(o4)).subtract(t0).subtract(t1));
    }
    multiplyByFp2(rhs) {
        return new Fp12(this.c0.multiplyByFp2(rhs), this.c1.multiplyByFp2(rhs));
    }
    square() {
        let { c0, c1 } = this;
        let ab = c0.multiply(c1);
        return new Fp12(c1.mulByNonresidue().add(c0).multiply(c0.add(c1)).subtract(ab).subtract(ab.mulByNonresidue()), ab.add(ab));
    }
    invert() {
        let { c0, c1 } = this;
        let t = c0.square().subtract(c1.square().mulByNonresidue()).invert();
        return new Fp12(c0.multiply(t), c1.multiply(t).negate());
    }
    conjugate() {
        return new Fp12(this.c0, this.c1.negate());
    }
    frobeniusMap(power) {
        const r0 = this.c0.frobeniusMap(power);
        const { c0, c1, c2 } = this.c1.frobeniusMap(power);
        const coeff = FP12_FROBENIUS_COEFFICIENTS[power % 12];
        return new Fp12(r0, new Fp6(c0.multiply(coeff), c1.multiply(coeff), c2.multiply(coeff)));
    }
    Fp4Square(a, b) {
        const a2 = a.square();
        const b2 = b.square();
        return {
            first: b2.mulByNonresidue().add(a2),
            second: a.add(b).square().subtract(a2).subtract(b2),
        };
    }
    cyclotomicSquare() {
        const { c0: c0c0, c1: c0c1, c2: c0c2 } = this.c0;
        const { c0: c1c0, c1: c1c1, c2: c1c2 } = this.c1;
        const { first: t3, second: t4 } = this.Fp4Square(c0c0, c1c1);
        const { first: t5, second: t6 } = this.Fp4Square(c1c0, c0c2);
        const { first: t7, second: t8 } = this.Fp4Square(c0c1, c1c2);
        let t9 = t8.mulByNonresidue();
        return new Fp12(new Fp6(t3.subtract(c0c0).multiply(2n).add(t3), t5.subtract(c0c1).multiply(2n).add(t5), t7.subtract(c0c2).multiply(2n).add(t7)), new Fp6(t9.add(c1c0).multiply(2n).add(t9), t4.add(c1c1).multiply(2n).add(t4), t6.add(c1c2).multiply(2n).add(t6)));
    }
    cyclotomicExp(n) {
        let z = Fp12.ONE;
        for (let i = BLS_X_LEN - 1; i >= 0; i--) {
            z = z.cyclotomicSquare();
            if (bitGet(n, i))
                z = z.multiply(this);
        }
        return z;
    }
    finalExponentiate() {
        const { x } = exports.CURVE;
        const t0 = this.frobeniusMap(6).div(this);
        const t1 = t0.frobeniusMap(2).multiply(t0);
        const t2 = t1.cyclotomicExp(x).conjugate();
        const t3 = t1.cyclotomicSquare().conjugate().multiply(t2);
        const t4 = t3.cyclotomicExp(x).conjugate();
        const t5 = t4.cyclotomicExp(x).conjugate();
        const t6 = t5.cyclotomicExp(x).conjugate().multiply(t2.cyclotomicSquare());
        const t7 = t6.cyclotomicExp(x).conjugate();
        const t2_t5_pow_q2 = t2.multiply(t5).frobeniusMap(2);
        const t4_t1_pow_q3 = t4.multiply(t1).frobeniusMap(3);
        const t6_t1c_pow_q1 = t6.multiply(t1.conjugate()).frobeniusMap(1);
        const t7_t3c_t1 = t7.multiply(t3.conjugate()).multiply(t1);
        return t2_t5_pow_q2.multiply(t4_t1_pow_q3).multiply(t6_t1c_pow_q1).multiply(t7_t3c_t1);
    }
    static fromBytes(b) {
        if (b.length !== Fp12.BYTES_LEN)
            throw new Error(`fromBytes wrong length=${b.length}`);
        return new Fp12(Fp6.fromBytes(b.subarray(0, Fp6.BYTES_LEN)), Fp6.fromBytes(b.subarray(Fp6.BYTES_LEN)));
    }
    toBytes() {
        return concatBytes(this.c0.toBytes(), this.c1.toBytes());
    }
}
exports.Fp12 = Fp12;
Fp12.ZERO = new Fp12(Fp6.ZERO, Fp6.ZERO);
Fp12.ONE = new Fp12(Fp6.ONE, Fp6.ZERO);
Fp12.BYTES_LEN = 2 * Fp6.BYTES_LEN;
class ProjectivePoint {
    constructor(x, y, z, C) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.C = C;
    }
    isZero() {
        return this.z.isZero();
    }
    createPoint(x, y, z) {
        return new this.constructor(x, y, z);
    }
    getZero() {
        return this.createPoint(this.C.ONE, this.C.ONE, this.C.ZERO);
    }
    equals(rhs) {
        if (this.constructor !== rhs.constructor)
            throw new Error(`ProjectivePoint#equals: this is ${this.constructor}, but rhs is ${rhs.constructor}`);
        const a = this;
        const b = rhs;
        const xe = a.x.multiply(b.z).equals(b.x.multiply(a.z));
        const ye = a.y.multiply(b.z).equals(b.y.multiply(a.z));
        return xe && ye;
    }
    negate() {
        return this.createPoint(this.x, this.y.negate(), this.z);
    }
    toString(isAffine = true) {
        if (this.isZero()) {
            return `Point<Zero>`;
        }
        if (!isAffine) {
            return `Point<x=${this.x}, y=${this.y}, z=${this.z}>`;
        }
        const [x, y] = this.toAffine();
        return `Point<x=${x}, y=${y}>`;
    }
    fromAffineTuple(xy) {
        return this.createPoint(xy[0], xy[1], this.C.ONE);
    }
    toAffine(invZ = this.z.invert()) {
        if (invZ.isZero())
            throw new Error('Invalid inverted z');
        return [this.x.multiply(invZ), this.y.multiply(invZ)];
    }
    toAffineBatch(points) {
        const toInv = genInvertBatch(this.C, points.map((p) => p.z));
        return points.map((p, i) => p.toAffine(toInv[i]));
    }
    normalizeZ(points) {
        return this.toAffineBatch(points).map((t) => this.fromAffineTuple(t));
    }
    double() {
        const { x, y, z } = this;
        const W = x.multiply(x).multiply(3n);
        const S = y.multiply(z);
        const SS = S.multiply(S);
        const SSS = SS.multiply(S);
        const B = x.multiply(y).multiply(S);
        const H = W.multiply(W).subtract(B.multiply(8n));
        const X3 = H.multiply(S).multiply(2n);
        const Y3 = W.multiply(B.multiply(4n).subtract(H)).subtract(y.multiply(y).multiply(8n).multiply(SS));
        const Z3 = SSS.multiply(8n);
        return this.createPoint(X3, Y3, Z3);
    }
    add(rhs) {
        if (this.constructor !== rhs.constructor)
            throw new Error(`ProjectivePoint#add: this is ${this.constructor}, but rhs is ${rhs.constructor}`);
        const p1 = this;
        const p2 = rhs;
        if (p1.isZero())
            return p2;
        if (p2.isZero())
            return p1;
        const X1 = p1.x;
        const Y1 = p1.y;
        const Z1 = p1.z;
        const X2 = p2.x;
        const Y2 = p2.y;
        const Z2 = p2.z;
        const U1 = Y2.multiply(Z1);
        const U2 = Y1.multiply(Z2);
        const V1 = X2.multiply(Z1);
        const V2 = X1.multiply(Z2);
        if (V1.equals(V2) && U1.equals(U2))
            return this.double();
        if (V1.equals(V2))
            return this.getZero();
        const U = U1.subtract(U2);
        const V = V1.subtract(V2);
        const VV = V.multiply(V);
        const VVV = VV.multiply(V);
        const V2VV = V2.multiply(VV);
        const W = Z1.multiply(Z2);
        const A = U.multiply(U).multiply(W).subtract(VVV).subtract(V2VV.multiply(2n));
        const X3 = V.multiply(A);
        const Y3 = U.multiply(V2VV.subtract(A)).subtract(VVV.multiply(U2));
        const Z3 = VVV.multiply(W);
        return this.createPoint(X3, Y3, Z3);
    }
    subtract(rhs) {
        if (this.constructor !== rhs.constructor)
            throw new Error(`ProjectivePoint#subtract: this is ${this.constructor}, but rhs is ${rhs.constructor}`);
        return this.add(rhs.negate());
    }
    validateScalar(n) {
        if (typeof n === 'number')
            n = BigInt(n);
        if (typeof n !== 'bigint' || n <= 0 || n > exports.CURVE.r) {
            throw new Error(`Point#multiply: invalid scalar, expected positive integer < CURVE.r. Got: ${n}`);
        }
        return n;
    }
    multiplyUnsafe(scalar) {
        let n = this.validateScalar(scalar);
        let point = this.getZero();
        let d = this;
        while (n > 0n) {
            if (n & 1n)
                point = point.add(d);
            d = d.double();
            n >>= 1n;
        }
        return point;
    }
    multiply(scalar) {
        let n = this.validateScalar(scalar);
        let point = this.getZero();
        let fake = this.getZero();
        let d = this;
        let bits = Fp.ORDER;
        while (bits > 0n) {
            if (n & 1n) {
                point = point.add(d);
            }
            else {
                fake = fake.add(d);
            }
            d = d.double();
            n >>= 1n;
            bits >>= 1n;
        }
        return point;
    }
    maxBits() {
        return this.C.MAX_BITS;
    }
    precomputeWindow(W) {
        const windows = Math.ceil(this.maxBits() / W);
        const windowSize = 2 ** (W - 1);
        let points = [];
        let p = this;
        let base = p;
        for (let window = 0; window < windows; window++) {
            base = p;
            points.push(base);
            for (let i = 1; i < windowSize; i++) {
                base = base.add(p);
                points.push(base);
            }
            p = base.double();
        }
        return points;
    }
    calcMultiplyPrecomputes(W) {
        if (this._MPRECOMPUTES)
            throw new Error('This point already has precomputes');
        this._MPRECOMPUTES = [W, this.normalizeZ(this.precomputeWindow(W))];
    }
    clearMultiplyPrecomputes() {
        this._MPRECOMPUTES = undefined;
    }
    wNAF(n) {
        let W, precomputes;
        if (this._MPRECOMPUTES) {
            [W, precomputes] = this._MPRECOMPUTES;
        }
        else {
            W = 1;
            precomputes = this.precomputeWindow(W);
        }
        let p = this.getZero();
        let f = this.getZero();
        const windows = Math.ceil(this.maxBits() / W);
        const windowSize = 2 ** (W - 1);
        const mask = BigInt(2 ** W - 1);
        const maxNumber = 2 ** W;
        const shiftBy = BigInt(W);
        for (let window = 0; window < windows; window++) {
            const offset = window * windowSize;
            let wbits = Number(n & mask);
            n >>= shiftBy;
            if (wbits > windowSize) {
                wbits -= maxNumber;
                n += 1n;
            }
            if (wbits === 0) {
                f = f.add(window % 2 ? precomputes[offset].negate() : precomputes[offset]);
            }
            else {
                const cached = precomputes[offset + Math.abs(wbits) - 1];
                p = p.add(wbits < 0 ? cached.negate() : cached);
            }
        }
        return [p, f];
    }
    multiplyPrecomputed(scalar) {
        return this.wNAF(this.validateScalar(scalar))[0];
    }
}
exports.ProjectivePoint = ProjectivePoint;
function sgn0_fp2(x) {
    const { re: x0, im: x1 } = x.reim();
    const sign_0 = x0 % 2n;
    const zero_0 = x0 === 0n;
    const sign_1 = x1 % 2n;
    return BigInt(sign_0 || (zero_0 && sign_1));
}
function sgn0_m_eq_1(x) {
    return Boolean(x.value % 2n);
}
const P_MINUS_9_DIV_16 = (exports.CURVE.P ** 2n - 9n) / 16n;
function sqrt_div_fp2(u, v) {
    const v7 = v.pow(7n);
    const uv7 = u.multiply(v7);
    const uv15 = uv7.multiply(v7.multiply(v));
    const gamma = uv15.pow(P_MINUS_9_DIV_16).multiply(uv7);
    let success = false;
    let result = gamma;
    const positiveRootsOfUnity = FP2_ROOTS_OF_UNITY.slice(0, 4);
    positiveRootsOfUnity.forEach((root) => {
        const candidate = root.multiply(gamma);
        if (candidate.pow(2n).multiply(v).subtract(u).isZero() && !success) {
            success = true;
            result = candidate;
        }
    });
    return { success, sqrtCandidateOrGamma: result };
}
function map_to_curve_simple_swu_9mod16(t) {
    const iso_3_a = new Fp2(new Fp(0n), new Fp(240n));
    const iso_3_b = new Fp2(new Fp(1012n), new Fp(1012n));
    const iso_3_z = new Fp2(new Fp(-2n), new Fp(-1n));
    if (Array.isArray(t))
        t = Fp2.fromBigTuple(t);
    const t2 = t.pow(2n);
    const iso_3_z_t2 = iso_3_z.multiply(t2);
    const ztzt = iso_3_z_t2.add(iso_3_z_t2.pow(2n));
    let denominator = iso_3_a.multiply(ztzt).negate();
    let numerator = iso_3_b.multiply(ztzt.add(Fp2.ONE));
    if (denominator.isZero())
        denominator = iso_3_z.multiply(iso_3_a);
    let v = denominator.pow(3n);
    let u = numerator
        .pow(3n)
        .add(iso_3_a.multiply(numerator).multiply(denominator.pow(2n)))
        .add(iso_3_b.multiply(v));
    const { success, sqrtCandidateOrGamma } = sqrt_div_fp2(u, v);
    let y;
    if (success)
        y = sqrtCandidateOrGamma;
    const sqrtCandidateX1 = sqrtCandidateOrGamma.multiply(t.pow(3n));
    u = iso_3_z_t2.pow(3n).multiply(u);
    let success2 = false;
    FP2_ETAs.forEach((eta) => {
        const etaSqrtCandidate = eta.multiply(sqrtCandidateX1);
        const temp = etaSqrtCandidate.pow(2n).multiply(v).subtract(u);
        if (temp.isZero() && !success && !success2) {
            y = etaSqrtCandidate;
            success2 = true;
        }
    });
    if (!success && !success2)
        throw new Error('Hash to Curve - Optimized SWU failure');
    if (success2)
        numerator = numerator.multiply(iso_3_z_t2);
    y = y;
    if (sgn0_fp2(t) !== sgn0_fp2(y))
        y = y.negate();
    return [numerator.div(denominator), y];
}
exports.map_to_curve_simple_swu_9mod16 = map_to_curve_simple_swu_9mod16;
function map_to_curve_simple_swu_3mod4(u) {
    const A = new Fp(0x144698a3b8e9433d693a02c96d4982b0ea985383ee66a8d8e8981aefd881ac98936f8da0e0f97f5cf428082d584c1dn);
    const B = new Fp(0x12e2908d11688030018b12e8753eee3b2016c1f0f24f4070a0b9c14fcef35ef55a23215a316ceaa5d1cc48e98e172be0n);
    const Z = new Fp(11n);
    const c1 = (Fp.ORDER - 3n) / 4n;
    const c2 = Z.negate().pow(3n).sqrt();
    const tv1 = u.square();
    const tv3 = Z.multiply(tv1);
    let xDen = tv3.square().add(tv3);
    const xNum1 = xDen.add(Fp.ONE).multiply(B);
    const xNum2 = tv3.multiply(xNum1);
    xDen = A.negate().multiply(xDen);
    if (xDen.isZero())
        xDen = A.multiply(Z);
    let tv2 = xDen.square();
    const gxd = tv2.multiply(xDen);
    tv2 = A.multiply(tv2);
    let gx1 = xNum1.square().add(tv2).multiply(xNum1);
    tv2 = B.multiply(gxd);
    gx1 = gx1.add(tv2);
    tv2 = gx1.multiply(gxd);
    const tv4 = gxd.square().multiply(tv2);
    const y1 = tv4.pow(c1).multiply(tv2);
    const y2 = y1.multiply(c2).multiply(tv1).multiply(u);
    let xNum, yPos;
    if (y1.square().multiply(gxd).equals(gx1)) {
        xNum = xNum1;
        yPos = y1;
    }
    else {
        xNum = xNum2;
        yPos = y2;
    }
    const yNeg = yPos.negate();
    const y = sgn0_m_eq_1(u) == sgn0_m_eq_1(yPos) ? yPos : yNeg;
    return [xNum.div(xDen), y];
}
exports.map_to_curve_simple_swu_3mod4 = map_to_curve_simple_swu_3mod4;
function isogenyMap(COEFF, x, y) {
    const [xNum, xDen, yNum, yDen] = COEFF.map((val) => val.reduce((acc, i) => acc.multiply(x).add(i)));
    x = xNum.div(xDen);
    y = y.multiply(yNum.div(yDen));
    return [x, y];
}
const isogenyMapG2 = (x, y) => isogenyMap(ISOGENY_COEFFICIENTS_G2, x, y);
exports.isogenyMapG2 = isogenyMapG2;
const isogenyMapG1 = (x, y) => isogenyMap(ISOGENY_COEFFICIENTS_G1, x, y);
exports.isogenyMapG1 = isogenyMapG1;
function calcPairingPrecomputes(x, y) {
    const Qx = x, Qy = y, Qz = Fp2.ONE;
    let Rx = Qx, Ry = Qy, Rz = Qz;
    let ell_coeff = [];
    for (let i = BLS_X_LEN - 2; i >= 0; i--) {
        let t0 = Ry.square();
        let t1 = Rz.square();
        let t2 = t1.multiply(3n).multiplyByB();
        let t3 = t2.multiply(3n);
        let t4 = Ry.add(Rz).square().subtract(t1).subtract(t0);
        ell_coeff.push([
            t2.subtract(t0),
            Rx.square().multiply(3n),
            t4.negate(),
        ]);
        Rx = t0.subtract(t3).multiply(Rx).multiply(Ry).div(2n);
        Ry = t0.add(t3).div(2n).square().subtract(t2.square().multiply(3n));
        Rz = t0.multiply(t4);
        if (bitGet(exports.CURVE.x, i)) {
            let t0 = Ry.subtract(Qy.multiply(Rz));
            let t1 = Rx.subtract(Qx.multiply(Rz));
            ell_coeff.push([
                t0.multiply(Qx).subtract(t1.multiply(Qy)),
                t0.negate(),
                t1,
            ]);
            let t2 = t1.square();
            let t3 = t2.multiply(t1);
            let t4 = t2.multiply(Rx);
            let t5 = t3.subtract(t4.multiply(2n)).add(t0.square().multiply(Rz));
            Rx = t1.multiply(t5);
            Ry = t4.subtract(t5).multiply(t0).subtract(t3.multiply(Ry));
            Rz = Rz.multiply(t3);
        }
    }
    return ell_coeff;
}
exports.calcPairingPrecomputes = calcPairingPrecomputes;
function millerLoop(ell, g1) {
    const Px = g1[0].value;
    const Py = g1[1].value;
    let f12 = Fp12.ONE;
    for (let j = 0, i = BLS_X_LEN - 2; i >= 0; i--, j++) {
        const E = ell[j];
        f12 = f12.multiplyBy014(E[0], E[1].multiply(Px), E[2].multiply(Py));
        if (bitGet(exports.CURVE.x, i)) {
            j += 1;
            const F = ell[j];
            f12 = f12.multiplyBy014(F[0], F[1].multiply(Px), F[2].multiply(Py));
        }
        if (i !== 0)
            f12 = f12.square();
    }
    return f12.conjugate();
}
exports.millerLoop = millerLoop;
const ut_root = new Fp6(Fp2.ZERO, Fp2.ONE, Fp2.ZERO);
const wsq = new Fp12(ut_root, Fp6.ZERO);
const wcu = new Fp12(Fp6.ZERO, ut_root);
const [wsq_inv, wcu_inv] = genInvertBatch(Fp12, [wsq, wcu]);
function psi(x, y) {
    const x2 = wsq_inv.multiplyByFp2(x).frobeniusMap(1).multiply(wsq).c0.c0;
    const y2 = wcu_inv.multiplyByFp2(y).frobeniusMap(1).multiply(wcu).c0.c0;
    return [x2, y2];
}
exports.psi = psi;
function psi2(x, y) {
    return [x.multiply(PSI2_C1), y.negate()];
}
exports.psi2 = psi2;
const PSI2_C1 = 0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn;
const rv1 = 0x6af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09n;
const ev1 = 0x699be3b8c6870965e5bf892ad5d2cc7b0e85a117402dfd83b7f4a947e02d978498255a2aaec0ac627b5afbdf1bf1c90n;
const ev2 = 0x8157cd83046453f5dd0972b6e3949e4288020b5b8a9cc99ca07e27089a2ce2436d965026adad3ef7baba37f2183e9b5n;
const ev3 = 0xab1c2ffdd6c253ca155231eb3e71ba044fd562f6f72bc5bad5ec46a0b7a3b0247cf08ce6c6317f40edbc653a72dee17n;
const ev4 = 0xaa404866706722864480885d68ad0ccac1967c7544b447873cc37e0181271e006df72162a3d3e0287bf597fbf7f8fc1n;
const FP2_FROBENIUS_COEFFICIENTS = [
    0x1n,
    0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
].map((item) => new Fp(item));
const FP2_ROOTS_OF_UNITY = [
    [1n, 0n],
    [rv1, -rv1],
    [0n, 1n],
    [rv1, rv1],
    [-1n, 0n],
    [-rv1, rv1],
    [0n, -1n],
    [-rv1, -rv1],
].map((pair) => Fp2.fromBigTuple(pair));
const FP2_ETAs = [
    [ev1, ev2],
    [-ev2, ev1],
    [ev3, ev4],
    [-ev4, ev3],
].map((pair) => Fp2.fromBigTuple(pair));
const FP6_FROBENIUS_COEFFICIENTS_1 = [
    [0x1n, 0x0n],
    [
        0x0n,
        0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn,
    ],
    [
        0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen,
        0x0n,
    ],
    [0x0n, 0x1n],
    [
        0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn,
        0x0n,
    ],
    [
        0x0n,
        0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen,
    ],
].map((pair) => Fp2.fromBigTuple(pair));
const FP6_FROBENIUS_COEFFICIENTS_2 = [
    [0x1n, 0x0n],
    [
        0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaadn,
        0x0n,
    ],
    [
        0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn,
        0x0n,
    ],
    [
        0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
        0x0n,
    ],
    [
        0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen,
        0x0n,
    ],
    [
        0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffeffffn,
        0x0n,
    ],
].map((pair) => Fp2.fromBigTuple(pair));
const FP12_FROBENIUS_COEFFICIENTS = [
    [0x1n, 0x0n],
    [
        0x1904d3bf02bb0667c231beb4202c0d1f0fd603fd3cbd5f4f7b2443d784bab9c4f67ea53d63e7813d8d0775ed92235fb8n,
        0x00fc3e2b36c4e03288e9e902231f9fb854a14787b6c7b36fec0c8ec971f63c5f282d5ac14d6c7ec22cf78a126ddc4af3n,
    ],
    [
        0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffeffffn,
        0x0n,
    ],
    [
        0x135203e60180a68ee2e9c448d77a2cd91c3dedd930b1cf60ef396489f61eb45e304466cf3e67fa0af1ee7b04121bdea2n,
        0x06af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09n,
    ],
    [
        0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen,
        0x0n,
    ],
    [
        0x144e4211384586c16bd3ad4afa99cc9170df3560e77982d0db45f3536814f0bd5871c1908bd478cd1ee605167ff82995n,
        0x05b2cfd9013a5fd8df47fa6b48b1e045f39816240c0b8fee8beadf4d8e9c0566c63a3e6e257f87329b18fae980078116n,
    ],
    [
        0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
        0x0n,
    ],
    [
        0x00fc3e2b36c4e03288e9e902231f9fb854a14787b6c7b36fec0c8ec971f63c5f282d5ac14d6c7ec22cf78a126ddc4af3n,
        0x1904d3bf02bb0667c231beb4202c0d1f0fd603fd3cbd5f4f7b2443d784bab9c4f67ea53d63e7813d8d0775ed92235fb8n,
    ],
    [
        0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn,
        0x0n,
    ],
    [
        0x06af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09n,
        0x135203e60180a68ee2e9c448d77a2cd91c3dedd930b1cf60ef396489f61eb45e304466cf3e67fa0af1ee7b04121bdea2n,
    ],
    [
        0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaadn,
        0x0n,
    ],
    [
        0x05b2cfd9013a5fd8df47fa6b48b1e045f39816240c0b8fee8beadf4d8e9c0566c63a3e6e257f87329b18fae980078116n,
        0x144e4211384586c16bd3ad4afa99cc9170df3560e77982d0db45f3536814f0bd5871c1908bd478cd1ee605167ff82995n,
    ],
].map((n) => Fp2.fromBigTuple(n));
const xnum = [
    [
        0x171d6541fa38ccfaed6dea691f5fb614cb14b4e7f4e810aa22d6108f142b85757098e38d0f671c7188e2aaaaaaaa5ed1n,
        0x0n,
    ],
    [
        0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71en,
        0x8ab05f8bdd54cde190937e76bc3e447cc27c3d6fbd7063fcd104635a790520c0a395554e5c6aaaa9354ffffffffe38dn,
    ],
    [
        0x0n,
        0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71an,
    ],
    [
        0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97d6n,
        0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97d6n,
    ],
].map((pair) => Fp2.fromBigTuple(pair));
const xden = [
    [0x0n, 0x0n],
    [0x1n, 0x0n],
    [
        0xcn,
        0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa9fn,
    ],
    [
        0x0n,
        0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa63n,
    ],
].map((pair) => Fp2.fromBigTuple(pair));
const ynum = [
    [
        0x124c9ad43b6cf79bfbf7043de3811ad0761b0f37a1e26286b0e977c69aa274524e79097a56dc4bd9e1b371c71c718b10n,
        0x0n,
    ],
    [
        0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71cn,
        0x8ab05f8bdd54cde190937e76bc3e447cc27c3d6fbd7063fcd104635a790520c0a395554e5c6aaaa9354ffffffffe38fn,
    ],
    [
        0x0n,
        0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97ben,
    ],
    [
        0x1530477c7ab4113b59a4c18b076d11930f7da5d4a07f649bf54439d87d27e500fc8c25ebf8c92f6812cfc71c71c6d706n,
        0x1530477c7ab4113b59a4c18b076d11930f7da5d4a07f649bf54439d87d27e500fc8c25ebf8c92f6812cfc71c71c6d706n,
    ],
].map((pair) => Fp2.fromBigTuple(pair));
const yden = [
    [0x1n, 0x0n],
    [
        0x12n,
        0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa99n,
    ],
    [
        0x0n,
        0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa9d3n,
    ],
    [
        0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa8fbn,
        0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa8fbn,
    ],
].map((pair) => Fp2.fromBigTuple(pair));
const ISOGENY_COEFFICIENTS_G2 = [xnum, xden, ynum, yden];
const ISOGENY_COEFFICIENTS_G1 = [
    [
        new Fp(0x06e08c248e260e70bd1e962381edee3d31d79d7e22c837bc23c0bf1bc24c6b68c24b1b80b64d391fa9c8ba2e8ba2d229n),
        new Fp(0x10321da079ce07e272d8ec09d2565b0dfa7dccdde6787f96d50af36003b14866f69b771f8c285decca67df3f1605fb7bn),
        new Fp(0x169b1f8e1bcfa7c42e0c37515d138f22dd2ecb803a0c5c99676314baf4bb1b7fa3190b2edc0327797f241067be390c9en),
        new Fp(0x080d3cf1f9a78fc47b90b33563be990dc43b756ce79f5574a2c596c928c5d1de4fa295f296b74e956d71986a8497e317n),
        new Fp(0x17b81e7701abdbe2e8743884d1117e53356de5ab275b4db1a682c62ef0f2753339b7c8f8c8f475af9ccb5618e3f0c88en),
        new Fp(0x0d6ed6553fe44d296a3726c38ae652bfb11586264f0f8ce19008e218f9c86b2a8da25128c1052ecaddd7f225a139ed84n),
        new Fp(0x1630c3250d7313ff01d1201bf7a74ab5db3cb17dd952799b9ed3ab9097e68f90a0870d2dcae73d19cd13c1c66f652983n),
        new Fp(0x0e99726a3199f4436642b4b3e4118e5499db995a1257fb3f086eeb65982fac18985a286f301e77c451154ce9ac8895d9n),
        new Fp(0x1778e7166fcc6db74e0609d307e55412d7f5e4656a8dbf25f1b33289f1b330835336e25ce3107193c5b388641d9b6861n),
        new Fp(0x0d54005db97678ec1d1048c5d10a9a1bce032473295983e56878e501ec68e25c958c3e3d2a09729fe0179f9dac9edcb0n),
        new Fp(0x17294ed3e943ab2f0588bab22147a81c7c17e75b2f6a8417f565e33c70d1e86b4838f2a6f318c356e834eef1b3cb83bbn),
        new Fp(0x11a05f2b1e833340b809101dd99815856b303e88a2d7005ff2627b56cdb4e2c85610c2d5f2e62d6eaeac1662734649b7n),
    ],
    [
        new Fp(0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001n),
        new Fp(0x095fc13ab9e92ad4476d6e3eb3a56680f682b4ee96f7d03776df533978f31c1593174e4b4b7865002d6384d168ecdd0an),
        new Fp(0x0a10ecf6ada54f825e920b3dafc7a3cce07f8d1d7161366b74100da67f39883503826692abba43704776ec3a79a1d641n),
        new Fp(0x14a7ac2a9d64a8b230b3f5b074cf01996e7f63c21bca68a81996e1cdf9822c580fa5b9489d11e2d311f7d99bbdcc5a5en),
        new Fp(0x0772caacf16936190f3e0c63e0596721570f5799af53a1894e2e073062aede9cea73b3538f0de06cec2574496ee84a3an),
        new Fp(0x0e7355f8e4e667b955390f7f0506c6e9395735e9ce9cad4d0a43bcef24b8982f7400d24bc4228f11c02df9a29f6304a5n),
        new Fp(0x13a8e162022914a80a6f1d5f43e7a07dffdfc759a12062bb8d6b44e833b306da9bd29ba81f35781d539d395b3532a21en),
        new Fp(0x03425581a58ae2fec83aafef7c40eb545b08243f16b1655154cca8abc28d6fd04976d5243eecf5c4130de8938dc62cd8n),
        new Fp(0x0b2962fe57a3225e8137e629bff2991f6f89416f5a718cd1fca64e00b11aceacd6a3d0967c94fedcfcc239ba5cb83e19n),
        new Fp(0x12561a5deb559c4348b4711298e536367041e8ca0cf0800c0126c2588c48bf5713daa8846cb026e9e5c8276ec82b3bffn),
        new Fp(0x08ca8d548cff19ae18b2e62f4bd3fa6f01d5ef4ba35b48ba9c9588617fc8ac62b558d681be343df8993cf9fa40d21b1cn),
    ],
    [
        new Fp(0x15e6be4e990f03ce4ea50b3b42df2eb5cb181d8f84965a3957add4fa95af01b2b665027efec01c7704b456be69c8b604n),
        new Fp(0x05c129645e44cf1102a159f748c4a3fc5e673d81d7e86568d9ab0f5d396a7ce46ba1049b6579afb7866b1e715475224bn),
        new Fp(0x0245a394ad1eca9b72fc00ae7be315dc757b3b080d4c158013e6632d3c40659cc6cf90ad1c232a6442d9d3f5db980133n),
        new Fp(0x0b182cac101b9399d155096004f53f447aa7b12a3426b08ec02710e807b4633f06c851c1919211f20d4c04f00b971ef8n),
        new Fp(0x18b46a908f36f6deb918c143fed2edcc523559b8aaf0c2462e6bfe7f911f643249d9cdf41b44d606ce07c8a4d0074d8en),
        new Fp(0x19713e47937cd1be0dfd0b8f1d43fb93cd2fcbcb6caf493fd1183e416389e61031bf3a5cce3fbafce813711ad011c132n),
        new Fp(0x0e1bba7a1186bdb5223abde7ada14a23c42a0ca7915af6fe06985e7ed1e4d43b9b3f7055dd4eba6f2bafaaebca731c30n),
        new Fp(0x09fc4018bd96684be88c9e221e4da1bb8f3abd16679dc26c1e8b6e6a1f20cabe69d65201c78607a360370e577bdba587n),
        new Fp(0x0987c8d5333ab86fde9926bd2ca6c674170a05bfe3bdd81ffd038da6c26c842642f64550fedfe935a15e4ca31870fb29n),
        new Fp(0x04ab0b9bcfac1bbcb2c977d027796b3ce75bb8ca2be184cb5231413c4d634f3747a87ac2460f415ec961f8855fe9d6f2n),
        new Fp(0x16603fca40634b6a2211e11db8f0a6a074a7d0d4afadb7bd76505c3d3ad5544e203f6326c95a807299b23ab13633a5f0n),
        new Fp(0x08cc03fdefe0ff135caf4fe2a21529c4195536fbe3ce50b879833fd221351adc2ee7f8dc099040a841b6daecf2e8fedbn),
        new Fp(0x01f86376e8981c217898751ad8746757d42aa7b90eeb791c09e4a3ec03251cf9de405aba9ec61deca6355c77b0e5f4cbn),
        new Fp(0x00cc786baa966e66f4a384c86a3b49942552e2d658a31ce2c344be4b91400da7d26d521628b00523b8dfe240c72de1f6n),
        new Fp(0x134996a104ee5811d51036d776fb46831223e96c254f383d0f906343eb67ad34d6c56711962fa8bfe097e75a2e41c696n),
        new Fp(0x090d97c81ba24ee0259d1f094980dcfa11ad138e48a869522b52af6c956543d3cd0c7aee9b3ba3c2be9845719707bb33n),
    ],
    [
        new Fp(0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001n),
        new Fp(0x0e0fa1d816ddc03e6b24255e0d7819c171c40f65e273b853324efcd6356caa205ca2f570f13497804415473a1d634b8fn),
        new Fp(0x02660400eb2e4f3b628bdd0d53cd76f2bf565b94e72927c1cb748df27942480e420517bd8714cc80d1fadc1326ed06f7n),
        new Fp(0x0ad6b9514c767fe3c3613144b45f1496543346d98adf02267d5ceef9a00d9b8693000763e3b90ac11e99b138573345ccn),
        new Fp(0x0accbb67481d033ff5852c1e48c50c477f94ff8aefce42d28c0f9a88cea7913516f968986f7ebbea9684b529e2561092n),
        new Fp(0x04d2f259eea405bd48f010a01ad2911d9c6dd039bb61a6290e591b36e636a5c871a5c29f4f83060400f8b49cba8f6aa8n),
        new Fp(0x167a55cda70a6e1cea820597d94a84903216f763e13d87bb5308592e7ea7d4fbc7385ea3d529b35e346ef48bb8913f55n),
        new Fp(0x1866c8ed336c61231a1be54fd1d74cc4f9fb0ce4c6af5920abc5750c4bf39b4852cfe2f7bb9248836b233d9d55535d4an),
        new Fp(0x16a3ef08be3ea7ea03bcddfabba6ff6ee5a4375efa1f4fd7feb34fd206357132b920f5b00801dee460ee415a15812ed9n),
        new Fp(0x166007c08a99db2fc3ba8734ace9824b5eecfdfa8d0cf8ef5dd365bc400a0051d5fa9c01a58b1fb93d1a1399126a775cn),
        new Fp(0x08d9e5297186db2d9fb266eaac783182b70152c65550d881c5ecd87b6f0f5a6449f38db9dfa9cce202c6477faaf9b7acn),
        new Fp(0x0be0e079545f43e4b00cc912f8228ddcc6d19c9f0f69bbb0542eda0fc9dec916a20b15dc0fd2ededda39142311a5001dn),
        new Fp(0x16b7d288798e5395f20d23bf89edb4d1d115c5dbddbcd30e123da489e726af41727364f2c28297ada8d26d98445f5416n),
        new Fp(0x058df3306640da276faaae7d6e8eb15778c4855551ae7f310c35a5dd279cd2eca6757cd636f96f891e2538b53dbf67f2n),
        new Fp(0x1962d75c2381201e1a0cbd6c43c348b885c84ff731c4d59ca4a10356f453e01f78a4260763529e3532f6102c2e49a03dn),
        new Fp(0x16112c4c3a9c98b252181140fad0eae9601a6de578980be6eec3232b5be72e7a07f3688ef60c206d01479253b03663c1n),
    ],
];

},{}]},{},[2]);
