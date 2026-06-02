// sequences.ts — 101 typing test sequences (5 warmup + 96 scored: 12 categories × 8)
// All sequences are exactly 6 chars. thumbAlt sequences include one space.
// These are typed on a QWERTY keyboard — the motion category is what matters, not the words.
import type { Sequence } from '../types';

export const sequences: Sequence[] = [

  // ─── Warmup (5) ─────────────────────────────────────────────────────────────
  { id: 'warmup-01', category: 'alt',      text: 'turish', isWarmup: true,  thumbMode: false },
  { id: 'warmup-02', category: 'rollIn',   text: 'asdfry', isWarmup: true,  thumbMode: false },
  { id: 'warmup-03', category: 'sfbStrong',text: 'edecrd', isWarmup: true,  thumbMode: false },
  { id: 'warmup-04', category: 'pinky',    text: 'zaqpol', isWarmup: true,  thumbMode: false },
  { id: 'warmup-05', category: 'redirect', text: 'swords', isWarmup: true,  thumbMode: false },

  // ─── alt (8) — strict hand alternation (L-R-L-R or R-L-R-L every bigram) ──
  // s=L o=R f=L i=R t=L h=R → sofith: s(L)o(R)f(L)i(R)t(L)h(R) ✓
  { id: 'alt-01', category: 'alt', text: 'sofith', isWarmup: false, thumbMode: false },
  // g=L o=R f=L i=R s=L h=R → gofish: g(L)o(R)f(L)i(R)s(L)h(R) ✓
  { id: 'alt-02', category: 'alt', text: 'gofish', isWarmup: false, thumbMode: false },
  // f=L u=R g=L l=R d=L k=R
  { id: 'alt-03', category: 'alt', text: 'fugldk', isWarmup: false, thumbMode: false },
  // r=L h=R e=L j=R w=L u=R
  { id: 'alt-04', category: 'alt', text: 'rhejwu', isWarmup: false, thumbMode: false },
  // s=L o=R a=L y=R d=L n=R
  { id: 'alt-05', category: 'alt', text: 'soaydn', isWarmup: false, thumbMode: false },
  // w=L i=R f=L o=R t=L h=R
  { id: 'alt-06', category: 'alt', text: 'wifoth', isWarmup: false, thumbMode: false },
  // g=L l=R t=L k=R e=L j=R
  { id: 'alt-07', category: 'alt', text: 'gltkej', isWarmup: false, thumbMode: false },
  // c=L n=R d=L u=R s=L h=R
  { id: 'alt-08', category: 'alt', text: 'cndush', isWarmup: false, thumbMode: false },

  // ─── rollIn (8) — same hand, ≥3 keys moving pinky→index direction ──────────
  // Left hand pinky→index: a(0)→s(1)→d(2)→f(3)→g(4)
  // Right hand pinky→index: ;(9)→l(8)→k(7)→j(6)→h(5)
  { id: 'rollIn-01', category: 'rollIn', text: 'asdfun', isWarmup: false, thumbMode: false },
  { id: 'rollIn-02', category: 'rollIn', text: 'sdfgjn', isWarmup: false, thumbMode: false },
  { id: 'rollIn-03', category: 'rollIn', text: 'zsdfin', isWarmup: false, thumbMode: false },
  { id: 'rollIn-04', category: 'rollIn', text: 'xcvbon', isWarmup: false, thumbMode: false },
  { id: 'rollIn-05', category: 'rollIn', text: ';lkjhe', isWarmup: false, thumbMode: false },
  { id: 'rollIn-06', category: 'rollIn', text: 'lkjhas', isWarmup: false, thumbMode: false },
  { id: 'rollIn-07', category: 'rollIn', text: 'oiuyas', isWarmup: false, thumbMode: false },
  { id: 'rollIn-08', category: 'rollIn', text: 'poiuya', isWarmup: false, thumbMode: false },

  // ─── rollOut (8) — same hand, ≥3 keys moving index→pinky direction ─────────
  // Left hand index→pinky: f(3)→d(2)→s(1)→a(0)  or  g(4)→f(3)→d(2)→s(1)
  // Right hand index→pinky: h(5)→j(6)→k(7)→l(8)→;(9)
  { id: 'rollOut-01', category: 'rollOut', text: 'gfdshj', isWarmup: false, thumbMode: false },
  { id: 'rollOut-02', category: 'rollOut', text: 'gfdshk', isWarmup: false, thumbMode: false },
  { id: 'rollOut-03', category: 'rollOut', text: 'tfdsjk', isWarmup: false, thumbMode: false },
  { id: 'rollOut-04', category: 'rollOut', text: 'tfdsio', isWarmup: false, thumbMode: false },
  { id: 'rollOut-05', category: 'rollOut', text: 'hjklpd', isWarmup: false, thumbMode: false },
  { id: 'rollOut-06', category: 'rollOut', text: 'yuklpf', isWarmup: false, thumbMode: false },
  { id: 'rollOut-07', category: 'rollOut', text: 'gfdsjo', isWarmup: false, thumbMode: false },
  { id: 'rollOut-08', category: 'rollOut', text: 'tfdshu', isWarmup: false, thumbMode: false },

  // ─── sfbStrong (8) — index or middle SFB: same finger, 2+ consecutive keys ─
  // LM (finger 2): e(top) d(home) c(bottom)  → ed, de, ec, ce, dc, cd
  // LI (finger 3): r(top) f(home) v(bottom)  → rf, fr, rv, vr, fv, vf
  // RI (finger 6): u(top) j(home) m(bottom)  → uj, ju, um, mu, jm, mj
  // RM (finger 7): i(top) k(home) ,(bottom)  → ik, ki, i,, ,i
  { id: 'sfbStrong-01', category: 'sfbStrong', text: 'ededst', isWarmup: false, thumbMode: false },
  { id: 'sfbStrong-02', category: 'sfbStrong', text: 'eceran', isWarmup: false, thumbMode: false },
  { id: 'sfbStrong-03', category: 'sfbStrong', text: 'rfrval', isWarmup: false, thumbMode: false },
  { id: 'sfbStrong-04', category: 'sfbStrong', text: 'vrftan', isWarmup: false, thumbMode: false },
  { id: 'sfbStrong-05', category: 'sfbStrong', text: 'ujutan', isWarmup: false, thumbMode: false },
  { id: 'sfbStrong-06', category: 'sfbStrong', text: 'mjuman', isWarmup: false, thumbMode: false },
  { id: 'sfbStrong-07', category: 'sfbStrong', text: 'ikisat', isWarmup: false, thumbMode: false },
  { id: 'sfbStrong-08', category: 'sfbStrong', text: 'kiplan', isWarmup: false, thumbMode: false },

  // ─── sfbWeak (8) — ring or pinky SFB: same finger, 2+ consecutive keys ─────
  // LR (finger 1): w(top) s(home) x(bottom) → ws, sw, wx, xw, sx, xs
  // LP (finger 0): q(top) a(home) z(bottom) → qa, aq, qz, zq, az, za
  // RR (finger 8): o(top) l(home) .(bottom) → ol, lo, o., .o
  // RP (finger 9): p(top) ;(home) /(bottom) → p;, ;p, p/, /p
  { id: 'sfbWeak-01', category: 'sfbWeak', text: 'swsdan', isWarmup: false, thumbMode: false },
  { id: 'sfbWeak-02', category: 'sfbWeak', text: 'xswuon', isWarmup: false, thumbMode: false },
  { id: 'sfbWeak-03', category: 'sfbWeak', text: 'aqaoin', isWarmup: false, thumbMode: false },
  { id: 'sfbWeak-04', category: 'sfbWeak', text: 'zaquer', isWarmup: false, thumbMode: false },
  { id: 'sfbWeak-05', category: 'sfbWeak', text: 'ololun', isWarmup: false, thumbMode: false },
  { id: 'sfbWeak-06', category: 'sfbWeak', text: '.olten', isWarmup: false, thumbMode: false },
  { id: 'sfbWeak-07', category: 'sfbWeak', text: 'p;phan', isWarmup: false, thumbMode: false },
  { id: 'sfbWeak-08', category: 'sfbWeak', text: ';p/ten', isWarmup: false, thumbMode: false },

  // ─── lsb (8) — lateral stretch: index/middle reaching ≥2 columns ──────────
  // LI (col 3) reaching to LII inner col (t/g/b col 4) = 1 col stretch
  // LI (col 3) reaching to RII inner col (y/h/n col 5) = stretch across center
  // e.g. f→b (LI stretches to col 4), r→t (LI to inner col), n→f (cross-hand reach)
  // Also: b→y (col4→col5, inner index cross), t→y (same)
  { id: 'lsb-01', category: 'lsb', text: 'fbtran', isWarmup: false, thumbMode: false },
  { id: 'lsb-02', category: 'lsb', text: 'tybuns', isWarmup: false, thumbMode: false },
  { id: 'lsb-03', category: 'lsb', text: 'gbfine', isWarmup: false, thumbMode: false },
  { id: 'lsb-04', category: 'lsb', text: 'vnfdes', isWarmup: false, thumbMode: false },
  { id: 'lsb-05', category: 'lsb', text: 'hyfter', isWarmup: false, thumbMode: false },
  { id: 'lsb-06', category: 'lsb', text: 'nybtun', isWarmup: false, thumbMode: false },
  { id: 'lsb-07', category: 'lsb', text: 'bthone', isWarmup: false, thumbMode: false },
  { id: 'lsb-08', category: 'lsb', text: 'gynfer', isWarmup: false, thumbMode: false },

  // ─── scissorsCenter (8) — adjacent non-pinky fingers, one top row + one bottom row ──
  // L: LR(1)+LM(2) or LM(2)+LI(3) or LI(3)+LII(4); R: RII(5)+RI(6), RI(6)+RM(7), RM(7)+RR(8)
  // DISTINCT from skipBigram (same finger) — here two ADJACENT different fingers cross rows
  { id: 'scissorsCenter-01', category: 'scissorsCenter', text: 'evhisd', isWarmup: false, thumbMode: false },
  { id: 'scissorsCenter-02', category: 'scissorsCenter', text: 'crjkla', isWarmup: false, thumbMode: false },
  { id: 'scissorsCenter-03', category: 'scissorsCenter', text: 'wcuins', isWarmup: false, thumbMode: false },
  { id: 'scissorsCenter-04', category: 'scissorsCenter', text: 'rcuind', isWarmup: false, thumbMode: false },
  { id: 'scissorsCenter-05', category: 'scissorsCenter', text: 'ymadsi', isWarmup: false, thumbMode: false },
  { id: 'scissorsCenter-06', category: 'scissorsCenter', text: 'nuadfs', isWarmup: false, thumbMode: false },
  { id: 'scissorsCenter-07', category: 'scissorsCenter', text: 'u,dshi', isWarmup: false, thumbMode: false },
  { id: 'scissorsCenter-08', category: 'scissorsCenter', text: 'i.fdsh', isWarmup: false, thumbMode: false },

  // ─── scissorsPinky (8) — LP(0)+LR(1) or RR(8)+RP(9), adjacent cross-row ────
  // L: q/a/z (LP) paired with w/s/x (LR) on a different row
  // R: p/;// (RP) paired with o/l/. (RR) on a different row
  { id: 'scissorsPinky-01', category: 'scissorsPinky', text: 'qxuind', isWarmup: false, thumbMode: false },
  { id: 'scissorsPinky-02', category: 'scissorsPinky', text: 'zwjkla', isWarmup: false, thumbMode: false },
  { id: 'scissorsPinky-03', category: 'scissorsPinky', text: 'awhjks', isWarmup: false, thumbMode: false },
  { id: 'scissorsPinky-04', category: 'scissorsPinky', text: 'axhoud', isWarmup: false, thumbMode: false },
  { id: 'scissorsPinky-05', category: 'scissorsPinky', text: 'p.asdf', isWarmup: false, thumbMode: false },
  { id: 'scissorsPinky-06', category: 'scissorsPinky', text: '/ohdfs', isWarmup: false, thumbMode: false },
  { id: 'scissorsPinky-07', category: 'scissorsPinky', text: ';ohifs', isWarmup: false, thumbMode: false },
  { id: 'scissorsPinky-08', category: 'scissorsPinky', text: ';.fids', isWarmup: false, thumbMode: false },

  // ─── redirect (8) — same-hand 3+ key run that reverses direction ───────────
  // e.g. left hand: s→d→f then back f→d (roll-in then reverses)
  // or right hand: j→k→l then back l→k
  { id: 'redirect-01', category: 'redirect', text: 'sdfdsn', isWarmup: false, thumbMode: false },
  { id: 'redirect-02', category: 'redirect', text: 'fgfdsn', isWarmup: false, thumbMode: false },
  { id: 'redirect-03', category: 'redirect', text: 'dsdfer', isWarmup: false, thumbMode: false },
  { id: 'redirect-04', category: 'redirect', text: 'asdsfu', isWarmup: false, thumbMode: false },
  { id: 'redirect-05', category: 'redirect', text: 'jkljhd', isWarmup: false, thumbMode: false },
  { id: 'redirect-06', category: 'redirect', text: 'lkljon', isWarmup: false, thumbMode: false },
  { id: 'redirect-07', category: 'redirect', text: 'kjkhun', isWarmup: false, thumbMode: false },
  { id: 'redirect-08', category: 'redirect', text: 'hjhkon', isWarmup: false, thumbMode: false },

  // ─── pinky (8) — off-home pinky: key on top or bottom row (q, z, p, /) ─────
  { id: 'pinky-01', category: 'pinky', text: 'quartz', isWarmup: false, thumbMode: false },
  { id: 'pinky-02', category: 'pinky', text: 'zuplin', isWarmup: false, thumbMode: false },
  { id: 'pinky-03', category: 'pinky', text: 'pulzin', isWarmup: false, thumbMode: false },
  { id: 'pinky-04', category: 'pinky', text: 'zeplyr', isWarmup: false, thumbMode: false },
  { id: 'pinky-05', category: 'pinky', text: 'pozlip', isWarmup: false, thumbMode: false },
  { id: 'pinky-06', category: 'pinky', text: 'quiz;n', isWarmup: false, thumbMode: false },
  { id: 'pinky-07', category: 'pinky', text: 'zipful', isWarmup: false, thumbMode: false },
  { id: 'pinky-08', category: 'pinky', text: 'proxyz', isWarmup: false, thumbMode: false },

  // ─── skipBigram (8) — same finger, 2 rows apart (top↔bottom skip) ──────────
  // LM: e(top)↔c(bottom), LI: r(top)↔v(bottom), LR: w(top)↔x(bottom)
  // RI: u(top)↔m(bottom), RM: i(top)↔,(bottom), RR: o(top)↔.(bottom)
  { id: 'skipBigram-01', category: 'skipBigram', text: 'ecalds', isWarmup: false, thumbMode: false },
  { id: 'skipBigram-02', category: 'skipBigram', text: 'rvuion', isWarmup: false, thumbMode: false },
  { id: 'skipBigram-03', category: 'skipBigram', text: 'wxstun', isWarmup: false, thumbMode: false },
  { id: 'skipBigram-04', category: 'skipBigram', text: 'ceunio', isWarmup: false, thumbMode: false },
  { id: 'skipBigram-05', category: 'skipBigram', text: 'umands', isWarmup: false, thumbMode: false },
  { id: 'skipBigram-06', category: 'skipBigram', text: 'i,unds', isWarmup: false, thumbMode: false },
  { id: 'skipBigram-07', category: 'skipBigram', text: 'o.ents', isWarmup: false, thumbMode: false },
  { id: 'skipBigram-08', category: 'skipBigram', text: 'vrants', isWarmup: false, thumbMode: false },

  // ─── thumbAlt (8) — finger key then space (thumb), 5 letters + 1 space ─────
  // Space sits between two alpha keys. Sequences are short phrases (5 chars + space).
  { id: 'thumbAlt-01', category: 'thumbAlt', text: 'do it ', isWarmup: false, thumbMode: true },
  { id: 'thumbAlt-02', category: 'thumbAlt', text: 'he ran', isWarmup: false, thumbMode: true },
  { id: 'thumbAlt-03', category: 'thumbAlt', text: 'go on ', isWarmup: false, thumbMode: true },
  { id: 'thumbAlt-04', category: 'thumbAlt', text: 'fix em', isWarmup: false, thumbMode: true },
  { id: 'thumbAlt-05', category: 'thumbAlt', text: 'be led', isWarmup: false, thumbMode: true },
  { id: 'thumbAlt-06', category: 'thumbAlt', text: 'no way', isWarmup: false, thumbMode: true },
  { id: 'thumbAlt-07', category: 'thumbAlt', text: 'at six', isWarmup: false, thumbMode: true },
  { id: 'thumbAlt-08', category: 'thumbAlt', text: 'we win', isWarmup: false, thumbMode: true },
];

