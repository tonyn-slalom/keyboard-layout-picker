import re, json

with open('/tmp/cyano_index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ── 1. Extract key strings from SVGs ────────────────────────────────────────
sections = re.findall(r'id="([\w\-\? ]+)"(.*?)</svg>', html, re.DOTALL)

key_strings = {}
for name, body in sections:
    name = name.strip()
    texts = re.findall(r'<text[^>]*>([^<]{1,3})</text>', body)
    if len(texts) < 35:
        continue
    # Structure: [tab, top0..top9, extra, home0..home9, extra, extra, bot0..bot9, mod]
    keys = ''.join(texts[1:11]) + ''.join(texts[12:22]) + ''.join(texts[24:34])
    if len(keys) == 30:
        key_strings[name] = keys

# QWERTY is in "tooltip" section
key_strings['qwerty'] = 'qwertyuiopasdfghjkl;zxcvbnm,./'

# ── 2. Table stats (parsed from cyanophage table) ───────────────────────────
# Columns: name|thumb|effort|distance|sfb|sfb2u|skipbigrams|skipbigrams2|latstretch|scissors|pinkyscissors|widescissors|pinkydist|pinkyoffhome|trigramalt|triredirect|rollin|rollout|col56
table_rows = [
    ("qwerty","shift",1258.15,354.82,4.39,0.97,1.43,5.45,4.55,1.46,0.56,6.66,12.1,2.47,21.38,11.92,21.7,19.06,25.71),
    ("dvorak","shift",769.69,207.11,1.87,0.06,0.45,3.48,0.8,0.08,0.4,0.55,21.58,4.13,39.08,2.57,23.79,15.41,16.46),
    ("colemak","shift",634.08,190.66,0.91,0.09,0.46,4.24,2.26,0.26,0.65,0.46,4.79,0.78,25.43,9.22,26.67,22.53,12.57),
    ("colemak-dh","shift",534.99,189.98,0.91,0.09,0.41,4.24,1.27,0.15,0.65,0.32,4.79,0.78,25.43,9.22,26.67,22.53,7.95),
    ("graphite","shift",521.49,190.41,0.68,0.04,0.24,2.73,0.87,0.41,0.25,0.93,13.48,2.34,37.66,2.59,22.18,23.83,6.38),
    ("gallium","shift",515.84,189.71,0.64,0.03,0.24,2.74,0.97,0.95,0.49,1.34,17.41,3.07,37.55,2.68,21.8,24.26,6.3),
    ("canary","shift",519.83,204.81,0.66,0.02,0.15,3.65,1.75,0.42,0.38,0.75,16.08,2.96,29.26,6.95,24.87,25.49,6.98),
    ("aptV3","shift",510.34,191.37,0.81,0.06,0.31,3.09,0.33,0.11,1.12,0.38,20.18,3.45,30.73,5.57,34.89,14.66,3.68),
    ("handsdown-neu","shift",537.57,201.61,0.76,0.05,0.49,4.0,1.26,0.42,0.59,0.67,16.78,2.89,36.75,2.04,33.34,10.7,5.73),
    ("sturdy","shift",575.18,200.2,0.62,0.01,0.2,2.8,1.58,0.42,0.41,1.06,12.34,2.09,32.16,5.01,24.38,25.72,8.44),
    ("engram","shift",457.11,202.96,1.01,0.13,0.4,3.47,0.41,0.36,0.71,1.12,33.03,5.7,35.52,3.08,29.94,14.37,2.72),
    ("carbyne","shift",475.58,198.49,0.77,0.11,0.25,3.52,0.32,0.19,0.4,0.37,29.85,5.31,36.56,4.08,23.34,20.13,2.29),
    ("really?","shift",446.8,196.58,0.68,0.11,0.38,3.16,0.13,0.08,0.39,0.28,31.55,5.4,27.02,6.81,26.29,25.32,1.75),
    ("whorf","shift",614.12,204.51,0.45,0.02,0.18,2.73,1.66,0.77,0.64,1.63,20.1,3.74,34.54,6.23,22.89,23.77,8.56),
    ("northstar","shift",509.25,196.63,0.86,0.06,0.56,3.95,0.99,0.41,0.29,0.86,5.55,0.87,35.35,2.93,20.92,24.36,6.09),
    ("semimak","shift",553.38,193.51,0.59,0.04,0.2,2.76,1.65,0.39,1.17,1.27,20.81,3.76,36.13,6.44,21.31,23.39,6.39),
    ("mtgap","shift",521.04,194.05,0.92,0.05,0.26,3.27,0.46,0.15,0.59,0.53,22.36,3.8,33.86,2.54,30.0,16.34,5.87),
    ("ctgap","shift",499.86,196.21,0.74,0.04,0.39,3.42,1.01,0.68,0.58,0.99,7.0,1.23,36.06,3.59,18.91,26.54,6.2),
    ("recurva","shift",629.72,204.28,0.56,0.08,0.21,2.74,1.19,0.44,1.09,2.33,24.38,4.4,32.1,4.42,24.0,26.19,7.83),
    ("halmak","shift",442.21,186.7,1.97,0.08,0.61,3.47,0.4,0.56,1.56,0.97,31.22,5.48,38.02,3.41,21.51,18.6,2.3),
    ("workman","shift",525.34,195.03,1.97,0.18,0.6,4.15,1.11,0.47,0.57,0.87,4.87,0.78,24.58,9.13,25.75,21.65,7.44),
    ("nerps","shift",565.02,199.91,0.85,0.03,0.4,3.36,1.24,1.12,0.25,1.8,7.59,1.32,35.8,2.49,20.13,26.18,8.34),
    ("focal","shift",537.81,202.83,0.53,0.05,0.3,3.23,0.99,0.46,0.41,1.01,12.34,2.09,34.83,4.22,23.63,23.37,6.82),
    ("isrt","shift",497.86,183.57,0.65,0.04,0.4,3.5,1.51,0.28,1.11,0.58,13.64,2.41,26.64,7.64,23.44,27.25,6.65),
    ("irst","shift",538.61,184.39,0.64,0.02,0.2,3.31,1.45,0.11,1.0,0.68,13.43,2.39,27.13,7.8,24.59,26.27,7.56),
    ("hyperroll","shift",507.2,193.02,0.8,0.03,0.13,3.2,0.76,0.24,1.71,0.69,31.32,5.57,36.33,1.9,36.61,9.17,6.07),
    ("pine v1","shift",575.12,207.98,0.9,0.05,0.27,2.97,2.44,0.97,0.59,1.71,19.15,3.57,31.53,4.66,21.51,27.64,8.33),
    ("pine v4","shift",574.16,192.75,0.69,0.09,0.26,2.9,1.47,0.26,0.84,1.2,15.99,2.81,35.91,4.66,22.55,23.3,7.67),
    ("beakl19bis","shift",517.32,220.88,0.95,0.09,0.7,4.07,1.52,0.39,0.19,0.76,12.45,2.26,36.38,2.03,32.63,11.11,6.15),
    ("maltron","e",518.95,157.82,0.66,0.02,0.13,2.74,0.7,0.11,0.98,0.29,24.12,4.86,25.55,6.49,23.62,25.43,9.56),
    ("rsthd","e",510.19,156.29,0.7,0.05,0.29,2.94,0.81,0.09,0.99,0.21,4.48,0.79,20.6,5.95,33.82,15.54,9.71),
    ("dsthk","e",379.15,168.56,0.87,0.14,0.69,3.48,0.42,0.43,0.12,0.7,14.73,2.82,20.1,6.12,34.35,14.67,2.81),
    ("aptmak","e",393.84,156.43,0.75,0.09,0.33,2.74,0.17,0.29,0.6,0.5,9.27,1.53,21.21,5.64,32.84,15.62,3.16),
    ("caster","e",353.33,173.42,0.63,0.07,0.4,2.71,0.05,0.54,0.35,1.21,18.8,3.4,25.64,3.12,30.15,18.63,0.61),
    ("hd-vibranium","r",423.86,176.51,0.57,0.06,0.35,3.21,0.36,0.44,0.8,1.0,22.3,4.11,36.07,1.6,34.12,12.31,2.27),
    ("hd-promethium","r",398.09,175.32,0.58,0.06,0.36,3.05,0.25,0.11,0.42,0.45,22.84,4.08,36.98,2.03,30.54,14.68,2.5),
    ("snth","r",418.16,169.24,0.36,0.04,0.37,2.3,0.45,0.64,0.57,1.07,20.39,3.76,37.94,2.99,27.61,18.49,3.73),
    ("sunlight","r",458.46,179.1,0.47,0.04,0.19,2.77,0.32,0.04,0.37,0.11,23.7,4.32,38.12,3.34,23.56,20.67,4.19),
    ("nordrassil","t",428.19,192.71,0.71,0.06,0.47,3.19,0.37,0.37,0.18,0.64,16.25,3.06,38.74,1.07,32.98,11.02,4.23),
    ("night","r",491.42,172.77,0.41,0.03,0.12,2.3,1.26,0.63,0.44,0.78,16.95,3.06,38.22,4.03,23.24,22.17,7.58),
    ("enthium","r",443.09,173.14,0.48,0.06,0.35,2.76,0.18,0.08,0.35,0.53,24.45,3.23,37.93,2.66,28.08,16.71,2.41),
]

# ── 3. Metadata ──────────────────────────────────────────────────────────────
# id, display_name, source, cyanophage_ref, form_factors, thumb_keys
metadata = {
    "qwerty":        ("QWERTY",        "https://en.wikipedia.org/wiki/QWERTY",                               "qwerty",       ["ansi","ortho","columnar"], None),
    "dvorak":        ("Dvorak",        "https://en.wikipedia.org/wiki/Dvorak_keyboard_layout",               "dvorak",       ["ansi","ortho","columnar"], None),
    "colemak":       ("Colemak",       "https://colemak.com",                                                "colemak",      ["ansi","ortho","columnar"], None),
    "colemak-dh":    ("Colemak-DH",    "https://colemakmods.github.io/mod-dh/",                              "colemak-dh",   ["ansi","ortho","columnar"], None),
    "graphite":      ("Graphite",      "https://github.com/rdavison/graphite-layout",                        "graphite",     ["ansi","ortho","columnar"], None),
    "gallium":       ("Gallium",       "https://github.com/GalileoBlues/Gallium",                            "gallium",      ["ansi","ortho","columnar"], None),
    "canary":        ("Canary",        "https://github.com/Apsu/Canary",                                     "canary",       ["ansi","ortho","columnar"], None),
    "aptV3":         ("APT v3",        "https://github.com/Apsu/APT",                                        "aptV3",        ["ansi","ortho","columnar"], None),
    "handsdown-neu": ("Hands Down Neu","https://sites.google.com/alanreiser.com/handsdown",                  "handsdown-neu",["ansi","ortho","columnar"], None),
    "sturdy":        ("Sturdy",        "https://github.com/o-x-e-y/oxeylyzer",                               "sturdy",       ["ansi","ortho","columnar"], None),
    "engram":        ("Engram",        "https://github.com/binarybottle/engram",                             "engram",       ["ansi","ortho","columnar"], None),
    "carbyne":       ("Carbyne",       "https://cyanophage.github.io/index.html#carbyne",                    "carbyne",      ["ansi","ortho","columnar"], None),
    "really?":       ("Really?",       "https://cyanophage.github.io/index.html#really?",                    "really?",      ["ansi","ortho","columnar"], None),
    "whorf":         ("Whorf",         "https://cyanophage.github.io/index.html#whorf",                      "whorf",        ["ansi","ortho","columnar"], None),
    "northstar":     ("Northstar",     "https://cyanophage.github.io/index.html#northstar",                  "northstar",    ["ansi","ortho","columnar"], None),
    "semimak":       ("Semimak",       "https://semilin.github.io/semimak",                                  "semimak",      ["ansi","ortho","columnar"], None),
    "mtgap":         ("MTGAP",         "https://mathematicator.com/words/mtgap",                             "mtgap",        ["ansi","ortho","columnar"], None),
    "ctgap":         ("CTGAP",         "https://cyanophage.github.io/index.html#ctgap",                      "ctgap",        ["ansi","ortho","columnar"], None),
    "recurva":       ("Recurva",       "https://cyanophage.github.io/index.html#recurva",                    "recurva",      ["ansi","ortho","columnar"], None),
    "halmak":        ("Halmak",        "https://github.com/MadRabbit/halmak",                                "halmak",       ["ansi","ortho","columnar"], None),
    "workman":       ("Workman",       "https://workmanlayout.org",                                          "workman",      ["ansi","ortho","columnar"], None),
    "nerps":         ("Nerps",         "https://cyanophage.github.io/index.html#nerps",                      "nerps",        ["ansi","ortho","columnar"], None),
    "focal":         ("Focal",         "https://cyanophage.github.io/index.html#focal",                      "focal",        ["ansi","ortho","columnar"], None),
    "isrt":          ("ISRT",          "https://notgate.github.io/layout",                                   "isrt",         ["ansi","ortho","columnar"], None),
    "irst":          ("IRST",          "https://cyanophage.github.io/index.html#irst",                       "irst",         ["ansi","ortho","columnar"], None),
    "hyperroll":     ("Hyperroll",     "https://cyanophage.github.io/index.html#hyperroll",                  "hyperroll",    ["ansi","ortho","columnar"], None),
    "pine_v1":       ("Pine v1",       "https://cyanophage.github.io/index.html#pine_v1",                    "pine_v1",      ["ansi","ortho","columnar"], None),
    "pine_v4":       ("Pine v4",       "https://cyanophage.github.io/index.html#pine_v4",                    "pine_v4",      ["ansi","ortho","columnar"], None),
    "beakl19bis":    ("BEAKL19bis",    "https://cyanophage.github.io/index.html#beakl19bis",                 "beakl19bis",   ["ansi","ortho","columnar"], None),
    "maltron":       ("Maltron",       "https://maltron.com",                                                "maltron",      ["columnar"], {"left": ["e"]}),
    "rsthd":         ("RSTHD",         "https://xsznix.wordpress.com/2016/05/16/introducing-the-rsthd-layout/","rsthd",      ["columnar"], {"right": ["e"]}),
    "dsthk":         ("DSTHK",         "https://cyanophage.github.io/index.html#dsthk",                      "dsthk",        ["columnar"], {"right": ["e"]}),
    "aptmak":        ("APTmak",        "https://github.com/Apsu/APT",                                        "aptmak",       ["columnar"], {"right": ["e"]}),
    "caster":        ("Caster",        "https://cyanophage.github.io/index.html#caster",                     "caster",       ["columnar"], {"right": ["e"]}),
    "hd-vibranium":  ("HD Vibranium",  "https://sites.google.com/alanreiser.com/handsdown",                  "hd-vibranium", ["columnar"], {"right": ["r"]}),
    "hd-promethium": ("HD Promethium", "https://sites.google.com/alanreiser.com/handsdown",                  "hd-promethium",["columnar"], {"right": ["r"]}),
    "snth":          ("SNTH",          "https://cyanophage.github.io/index.html#snth",                       "snth",         ["columnar"], {"right": ["r"]}),
    "sunlight":      ("Sunlight",      "https://cyanophage.github.io/index.html#sunlight",                   "sunlight",     ["columnar"], {"right": ["r"]}),
    "nordrassil":    ("Nordrassil",    "https://cyanophage.github.io/index.html#nordrassil",                  "nordrassil",   ["columnar"], {"right": ["t"]}),
    "night":         ("Night",         "https://cyanophage.github.io/index.html#night",                      "night",        ["columnar"], {"right": ["r"]}),
    "enthium":       ("Enthium",       "https://github.com/Gelidus/enthium",                                 "enthium",      ["columnar"], {"right": ["r"]}),
}

# ── 4. Build layout objects ──────────────────────────────────────────────────
# id mapping from table names to metadata keys
table_to_meta = {
    "qwerty": "qwerty", "dvorak": "dvorak", "colemak": "colemak",
    "colemak-dh": "colemak-dh", "graphite": "graphite", "gallium": "gallium",
    "canary": "canary", "aptV3": "aptV3", "handsdown-neu": "handsdown-neu",
    "sturdy": "sturdy", "engram": "engram", "carbyne": "carbyne",
    "really?": "really?", "whorf": "whorf", "northstar": "northstar",
    "semimak": "semimak", "mtgap": "mtgap", "ctgap": "ctgap",
    "recurva": "recurva", "halmak": "halmak", "workman": "workman",
    "nerps": "nerps", "focal": "focal", "isrt": "isrt", "irst": "irst",
    "hyperroll": "hyperroll", "pine v1": "pine_v1", "pine v4": "pine_v4",
    "beakl19bis": "beakl19bis", "maltron": "maltron", "rsthd": "rsthd",
    "dsthk": "dsthk", "aptmak": "aptmak", "caster": "caster",
    "hd-vibranium": "hd-vibranium", "hd-promethium": "hd-promethium",
    "snth": "snth", "sunlight": "sunlight", "nordrassil": "nordrassil",
    "night": "night", "enthium": "enthium",
}

# kebab-case IDs for JSON
display_to_id = {
    "aptV3": "apt-v3", "handsdown-neu": "handsdown-neu", "pine_v1": "pine-v1",
    "pine_v4": "pine-v4", "beakl19bis": "beakl19bis", "really?": "really",
}
def get_id(meta_key):
    if meta_key in display_to_id:
        return display_to_id[meta_key]
    return meta_key

layouts = []
for row in table_rows:
    table_name = row[0]
    thumb = row[1]
    effort, distance = row[2], row[3]
    sfb, sfb2u, skipbg, skipbg2 = row[4], row[5], row[6], row[7]
    lat, scissors, pinkyscissors, widescissors = row[8], row[9], row[10], row[11]
    pinkydist, pinkyoffhome = row[12], row[13]
    trigramalt, triredirect, rollin, rollout, col56 = row[14], row[15], row[16], row[17], row[18]

    meta_key = table_to_meta[table_name]
    meta = metadata[meta_key]
    display_name, source, cyano_ref, form_factors, thumb_keys = meta
    layout_id = get_id(meta_key)

    # Get key string — use meta_key for SVG lookup
    keys = key_strings.get(meta_key, key_strings.get(table_name, ""))
    if not keys:
        print(f"WARNING: no keys for {meta_key}")
        keys = "?" * 30

    requires_thumb = thumb != "shift"

    layout = {
        "id": layout_id,
        "name": display_name,
        "source": source,
        "cyanophageRef": cyano_ref,
        "keys": keys,
        "formFactors": form_factors,
        "requiresThumbCluster": requires_thumb,
        "stats": {
            "sfbPct": sfb,
            "skipBigramPct": sfb2u,
            "skipBigram2Pct": skipbg2,
            "lsbPct": lat,
            "scissorsPct": scissors,
            "pinkyScissorsPct": pinkyscissors,
            "wideScissorsPct": widescissors,
            "altPct": trigramalt,
            "rollInPct": rollin,
            "rollOutPct": rollout,
            "redirectPct": triredirect,
            "weakRedirectPct": -1,
            "offHomePinkyPct": pinkyoffhome,
            "effort": effort,
            "distance": distance,
            "pinkyDist": pinkydist,
            "col56Pct": col56,
            "_dataSource": "cyanophage",
            "_notes": None,
        }
    }

    if thumb_keys:
        layout["thumbKeys"] = thumb_keys
    if requires_thumb:
        layout["stats"]["thumbAltPct"] = None

    # Remove null _notes
    if layout["stats"]["_notes"] is None:
        del layout["stats"]["_notes"]
    if layout["stats"].get("thumbAltPct") is None and "thumbAltPct" in layout["stats"]:
        del layout["stats"]["thumbAltPct"]

    layouts.append(layout)

# Write to layouts.json
out_path = "/Users/tonyn/Repositories/keyboard_layout_picker/src/data/layouts.json"
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(layouts, f, indent=2, ensure_ascii=False)

print(f"Written {len(layouts)} layouts to {out_path}")
for l in layouts:
    print(f"  {l['id']}: keys={l['keys'][:10]}... ({len(l['keys'])} chars)")

print(f"Keyboard SVGs found: {len(svg_blocks)}")

def extract_30_keys(svg_body):
    items = re.findall(r'<text\s+x="(\d+)"\s+y="(\d+)"[^>]*>(.+?)</text>', svg_body, re.DOTALL)
    single = [(int(x), int(y), c.strip()) for x,y,c in items if len(c.strip())==1]
    if len(single) < 28:
        return None
    single.sort(key=lambda t: (t[1], t[0]))
    rows = {}
    for x,y,c in single:
        rows.setdefault(y, []).append((x,c))
    row_ys = sorted(rows.keys())
    if len(row_ys) < 3:
        return None
    result = ''
    for ry in row_ys[:3]:
        row = sorted(rows[ry], key=lambda t: t[0])
        result += ''.join(c for _,c in row[:10])
    return result

for svg in svg_blocks:
    start = svg.start()
    preceding_ids = [b for b in id_blocks if b.start() < start]
    if not preceding_ids:
        continue
    name = preceding_ids[-1].group(1)
    keys = extract_30_keys(svg.group(1))
    print(f"{name}: {repr(keys)} (len={len(keys) if keys else 0})")

svg_blocks = list(re.finditer(r'<svg[^>]*class="layout-svg"[^>]*>(.*?)</svg>', html, re.DOTALL))
id_blocks = list(re.finditer(r'id="([\w\-\? ]+)"', html))

def extract_30_keys(svg_body):
    items = re.findall(r'<text\s+x="(\d+)"\s+y="(\d+)"[^>]*>(.+?)</text>', svg_body, re.DOTALL)
    single = [(int(x), int(y), c.strip()) for x,y,c in items if len(c.strip())==1]
    if len(single) < 28:
        return None
    single.sort(key=lambda t: (t[1], t[0]))
    rows = {}
    for x,y,c in single:
        rows.setdefault(y, []).append((x,c))
    row_ys = sorted(rows.keys())
    if len(row_ys) < 3:
        return None
    result = ''
    for ry in row_ys[:3]:
        row = sorted(rows[ry], key=lambda t: t[0])
        result += ''.join(c for _,c in row[:10])
    return result

for svg in svg_blocks:
    start = svg.start()
    preceding_ids = [b for b in id_blocks if b.start() < start]
    if not preceding_ids:
        continue
    name = preceding_ids[-1].group(1)
    keys = extract_30_keys(svg.group(1))
    if keys and len(keys) == 30:
        print(f"{name}: {keys}")
