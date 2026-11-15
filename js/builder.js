/* ============================================================
   MathBuilder — конструктор из кирпичиков (Canvas 2D, изометрия)
   Работает мышью и пальцем, без внешних библиотек.
   ============================================================ */
(function () {
    'use strict';

    var BRICK_H = 1.2;          // высота кирпичика (в шипах)

    var COLORS = [
        { id: 'red', hex: '#c91a09' },
        { id: 'blue', hex: '#0055bf' },
        { id: 'yellow', hex: '#f2cd37' },
        { id: 'green', hex: '#237841' },
        { id: 'lime', hex: '#a5ca18' },
        { id: 'orange', hex: '#fe8a18' },
        { id: 'purple', hex: '#81007b' },
        { id: 'white', hex: '#f2f2f2' },
        { id: 'black', hex: '#1b2a34' },
        { id: 'gray', hex: '#a0a5a9' }
    ];

    var SIZES = [
        { w: 1, d: 1 }, { w: 2, d: 1 }, { w: 3, d: 1 }, { w: 4, d: 1 },
        { w: 6, d: 1 }, { w: 8, d: 1 },
        { w: 2, d: 2 }, { w: 3, d: 2 }, { w: 4, d: 2 }, { w: 6, d: 2 }, { w: 8, d: 2 },
        { w: 4, d: 4 }, { w: 6, d: 4 }, { w: 8, d: 8 }
    ];

    var ACTIONS = {
        'view-left': 'viewLeft',
        'view-right': 'viewRight',
        'zoom-in': 'zoomIn',
        'zoom-out': 'zoomOut',
        'rotate': 'rotateBrick',
        'erase': 'erase',
        'undo': 'undo',
        'clear': 'clear'
    };

    function clamp(v, a, b) {
        return Math.max(a, Math.min(b, v));
    }

    function hexToRgb(hex) {
        var h = hex.replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return {
            r: parseInt(h.substr(0, 2), 16),
            g: parseInt(h.substr(2, 2), 16),
            b: parseInt(h.substr(4, 2), 16)
        };
    }

    function shade(hex, factor) {
        var c = hexToRgb(hex);
        var f = function (v) {
            return clamp(Math.round(v * factor), 0, 255);
        };
        return 'rgb(' + f(c.r) + ',' + f(c.g) + ',' + f(c.b) + ')';
    }

    function convexHull(points) {
        var pts = points.slice().sort(function (a, b) {
            return a.x === b.x ? a.y - b.y : a.x - b.x;
        });
        function cross(o, a, b) {
            return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
        }
        var lower = [];
        for (var i = 0; i < pts.length; i++) {
            while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) {
                lower.pop();
            }
            lower.push(pts[i]);
        }
        var upper = [];
        for (var j = pts.length - 1; j >= 0; j--) {
            while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[j]) <= 0) {
                upper.pop();
            }
            upper.push(pts[j]);
        }
        lower.pop();
        upper.pop();
        return lower.concat(upper);
    }

    function pointInPolygon(pt, poly) {
        var inside = false;
        for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            var xi = poly[i].x, yi = poly[i].y;
            var xj = poly[j].x, yj = poly[j].y;
            var intersect = ((yi > pt.y) !== (yj > pt.y)) &&
                (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function mount(host, opts) {
        opts = opts || {};
        var NX = clamp(opts.cols || 16, 4, 60);
        var NZ = clamp(opts.rows || 16, 4, 60);
        var label = opts.label || function (key) { return key; };
        var onChange = opts.onChange || function () {};

        var state = {
            bricks: [],
            sel: { w: 2, d: 1, color: COLORS[0].hex },
            yaw: Math.PI / 4,
            pitch: Math.PI / 6,
            zoom: 1,
            mode: 'build',
            ghost: null,
            hoverId: null
        };

        var history = [];
        var nextId = 1;
        var lastG = null;
        var hits = [];
        var active = {};
        var gesture = null;

        /* ---------- DOM ---------- */

        var root = document.createElement('div');
        root.className = 'builder';
        root.innerHTML =
            '<div class="builder-toolbar">' +
                '<button type="button" class="b-btn" data-act="view-left" aria-label="view">↺</button>' +
                '<button type="button" class="b-btn" data-act="view-right" aria-label="view">↻</button>' +
                '<span class="b-sep"></span>' +
                '<button type="button" class="b-btn" data-act="zoom-out" aria-label="zoom out">−</button>' +
                '<button type="button" class="b-btn" data-act="zoom-in" aria-label="zoom in">+</button>' +
                '<span class="b-sep"></span>' +
                '<button type="button" class="b-btn" data-act="rotate" aria-label="rotate">⟲</button>' +
                '<button type="button" class="b-btn" data-act="erase" aria-label="erase">⌫</button>' +
                '<button type="button" class="b-btn" data-act="undo" aria-label="undo">↶</button>' +
                '<button type="button" class="b-btn" data-act="clear" aria-label="clear">🗑</button>' +
            '</div>' +
            '<div class="builder-stage"><canvas></canvas>' +
                '<div class="builder-empty"></div>' +
            '</div>' +
            '<div class="builder-palette">' +
                '<div class="b-row b-sizes"></div>' +
                '<div class="b-row b-colors"></div>' +
            '</div>' +
            '<div class="builder-stats"></div>' +
            '<div class="builder-mode-hint"></div>';

        host.appendChild(root);

        var canvas = root.querySelector('canvas');
        var stage = root.querySelector('.builder-stage');
        var emptyHint = root.querySelector('.builder-empty');
        var sizesBox = root.querySelector('.b-sizes');
        var colorsBox = root.querySelector('.b-colors');
        var statsBox = root.querySelector('.builder-stats');
        var modeHint = root.querySelector('.builder-mode-hint');
        var ctx = canvas.getContext('2d');

        /* ---------- Палитра ---------- */

        var sizeButtons = [];
        SIZES.forEach(function (size) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'b-size';
            btn.title = size.w + '×' + size.d;
            btn.innerHTML = '<span class="b-mini" style="width:' + (6 + size.w * 6) + 'px;height:' + (6 + size.d * 6) + 'px"></span>' +
                '<span class="b-size-label">' + size.w + '×' + size.d + '</span>';
            btn.addEventListener('click', function () {
                state.sel.w = size.w;
                state.sel.d = size.d;
                refreshPalette();
            });
            sizesBox.appendChild(btn);
            sizeButtons.push({ el: btn, size: size });
        });

        var colorButtons = [];
        COLORS.forEach(function (color) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'b-color';
            btn.style.background = color.hex;
            btn.title = color.id;
            btn.setAttribute('aria-label', color.id);
            btn.addEventListener('click', function () {
                state.sel.color = color.hex;
                refreshPalette();
            });
            colorsBox.appendChild(btn);
            colorButtons.push({ el: btn, color: color });
        });

        function refreshPalette() {
            sizeButtons.forEach(function (item) {
                item.el.classList.toggle('is-active', item.size.w === state.sel.w && item.size.d === state.sel.d);
            });
            colorButtons.forEach(function (item) {
                item.el.classList.toggle('is-active', item.color.hex === state.sel.color);
            });
            root.style.setProperty('--brick-color', state.sel.color);
            root.querySelectorAll('.b-mini').forEach(function (mini) {
                mini.style.background = state.sel.color;
            });
            root.querySelector('[data-act="erase"]').classList.toggle('is-active', state.mode === 'erase');
            root.querySelector('[data-act="rotate"]').classList.toggle('is-active', state.mode === 'rotate');
        }

        /* ---------- Проекция ---------- */

        function projector(g) {
            var c = Math.cos(g.yaw), s = Math.sin(g.yaw);
            var sp = Math.sin(g.pitch), cp = Math.cos(g.pitch);
            return function (x, y, z) {
                var u = x * c - z * s;
                var v = (x * s + z * c) * sp - y * cp;
                return { x: g.cx + u * g.k, y: g.cy + v * g.k };
            };
        }

        function unproject(g, sx, sy, y) {
            var c = Math.cos(g.yaw), s = Math.sin(g.yaw);
            var sp = Math.sin(g.pitch), cp = Math.cos(g.pitch);
            var u = (sx - g.cx) / g.k;
            var v = (sy - g.cy) / g.k;
            var w = (v + y * cp) / sp;
            return {
                x: u * c + w * s + NX / 2,
                z: -u * s + w * c + NZ / 2
            };
        }

        function viewDir(g) {
            return { x: Math.sin(g.yaw), y: Math.tan(g.pitch), z: Math.cos(g.yaw) };
        }

        /* ---------- Отрисовка ---------- */

        function drawBox(g, P, x0, z0, x1, z1, y0, y1, color, alpha) {
            var X0 = x0 - NX / 2, X1 = x1 - NX / 2;
            var Z0 = z0 - NZ / 2, Z1 = z1 - NZ / 2;
            var d = viewDir(g);

            var faces = [
                { n: [0, 1, 0], pts: [[X0, y1, Z0], [X1, y1, Z0], [X1, y1, Z1], [X0, y1, Z1]], k: 1.16 },
                { n: [1, 0, 0], pts: [[X1, y0, Z0], [X1, y1, Z0], [X1, y1, Z1], [X1, y0, Z1]], k: 0.88 },
                { n: [-1, 0, 0], pts: [[X0, y0, Z0], [X0, y1, Z0], [X0, y1, Z1], [X0, y0, Z1]], k: 0.72 },
                { n: [0, 0, 1], pts: [[X0, y0, Z1], [X1, y0, Z1], [X1, y1, Z1], [X0, y1, Z1]], k: 0.8 },
                { n: [0, 0, -1], pts: [[X0, y0, Z0], [X1, y0, Z0], [X1, y1, Z0], [X0, y1, Z0]], k: 0.66 }
            ];

            ctx.save();
            ctx.globalAlpha = alpha === undefined ? 1 : alpha;

            for (var i = 0; i < faces.length; i++) {
                var f = faces[i];
                var dot = f.n[0] * d.x + f.n[1] * d.y + f.n[2] * d.z;
                if (dot <= 0) continue;
                ctx.beginPath();
                for (var j = 0; j < 4; j++) {
                    var p = P(f.pts[j][0], f.pts[j][1], f.pts[j][2]);
                    if (j === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.closePath();
                ctx.fillStyle = shade(color, f.k);
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.12)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            /* Шипы сверху */
            var sp = Math.sin(g.pitch);
            var rx = 0.3 * g.k;
            var ry = Math.max(1.2, rx * sp);
            for (var bx = x0; bx < x1 - 0.01; bx++) {
                for (var bz = z0; bz < z1 - 0.01; bz++) {
                    var c = P(bx + 0.5 - NX / 2, y1, bz + 0.5 - NZ / 2);
                    ctx.beginPath();
                    ctx.ellipse(c.x, c.y, rx, ry, 0, 0, Math.PI * 2);
                    ctx.fillStyle = shade(color, 1.3);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
                    ctx.stroke();
                }
            }

            ctx.restore();
        }

        function render() {
            var W = stage.clientWidth;
            var H = stage.clientHeight;
            if (!W || !H) return;

            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
                canvas.width = Math.round(W * dpr);
                canvas.height = Math.round(H * dpr);
            }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);

            var k = Math.min(W / ((NX + NZ) * 0.75 + 6), H / ((NX + NZ) * 0.33 + 6)) * state.zoom;
            var g = {
                k: k,
                cx: W / 2,
                cy: H / 2 + Math.min(H * 0.1, 34),
                yaw: state.yaw,
                pitch: state.pitch
            };
            lastG = g;

            var P = projector(g);
            hits = [];

            /* Подставка (стол) */
            ctx.fillStyle = 'rgba(120, 150, 110, 0.12)';
            ctx.beginPath();
            var corners = [
                P(-NX / 2 - 1.5, -0.9, -NZ / 2 - 1.5),
                P(NX / 2 + 1.5, -0.9, -NZ / 2 - 1.5),
                P(NX / 2 + 1.5, -0.9, NZ / 2 + 1.5),
                P(-NX / 2 - 1.5, -0.9, NZ / 2 + 1.5)
            ];
            ctx.moveTo(corners[0].x, corners[0].y);
            for (var ci = 1; ci < 4; ci++) ctx.lineTo(corners[ci].x, corners[ci].y);
            ctx.closePath();
            ctx.fill();

            /* Пластина */
            drawBox(g, P, 0, 0, NX, NZ, -0.6, 0, '#7fa65f', 1);

            /* Сетка шипов */
            ctx.beginPath();
            for (var i = 0; i <= NX; i++) {
                var a1 = P(i - NX / 2, 0.001, -NZ / 2);
                var a2 = P(i - NX / 2, 0.001, NZ / 2);
                ctx.moveTo(a1.x, a1.y);
                ctx.lineTo(a2.x, a2.y);
            }
            for (var j = 0; j <= NZ; j++) {
                var b1 = P(-NX / 2, 0.001, j - NZ / 2);
                var b2 = P(NX / 2, 0.001, j - NZ / 2);
                ctx.moveTo(b1.x, b1.y);
                ctx.lineTo(b2.x, b2.y);
            }
            ctx.strokeStyle = 'rgba(255,255,255,0.22)';
            ctx.lineWidth = 1;
            ctx.stroke();

            /* Кирпичики: от дальних к ближним */
            var dir = viewDir(g);
            var list = state.bricks.slice().sort(function (a, b) {
                var da = (a.x + a.w / 2) * dir.x + (a.z + a.d / 2) * dir.z + a.level * 0.001;
                var db = (b.x + b.w / 2) * dir.x + (b.z + b.d / 2) * dir.z + b.level * 0.001;
                return da - db;
            });

            list.forEach(function (brick) {
                var y0 = brick.level * BRICK_H;
                var y1 = y0 + BRICK_H;
                drawBox(g, P, brick.x, brick.z, brick.x + brick.w, brick.z + brick.d, y0, y1, brick.color, 1);

                var pts = [];
                for (var dx = 0; dx <= 1; dx++) {
                    for (var dz = 0; dz <= 1; dz++) {
                        for (var dy = 0; dy <= 1; dy++) {
                            pts.push(P(brick.x + dx * brick.w - NX / 2, y0 + dy * BRICK_H, brick.z + dz * brick.d - NZ / 2));
                        }
                    }
                }
                hits.push({ brick: brick, poly: convexHull(pts) });
            });

            /* Подсветка кирпичика под курсором в режимах поворота/ластика */
            if (state.hoverId !== null && (state.mode === 'rotate' || state.mode === 'erase')) {
                for (var hi = 0; hi < hits.length; hi++) {
                    if (hits[hi].brick.id === state.hoverId) {
                        var hp = hits[hi].poly;
                        ctx.beginPath();
                        ctx.moveTo(hp[0].x, hp[0].y);
                        for (var hpi = 1; hpi < hp.length; hpi++) ctx.lineTo(hp[hpi].x, hp[hpi].y);
                        ctx.closePath();
                        ctx.strokeStyle = state.mode === 'rotate' ? 'rgba(0, 105, 192, 0.9)' : 'rgba(209, 52, 56, 0.9)';
                        ctx.lineWidth = 3;
                        ctx.stroke();
                        break;
                    }
                }
            }

            /* Призрак нового кирпичика */
            if (state.ghost) {
                var gh = state.ghost;
                var gcolor = gh.ok ? '#2e8b3d' : '#d13438';
                drawBox(g, P, gh.x, gh.z, gh.x + gh.w, gh.z + gh.d,
                    gh.level * BRICK_H, gh.level * BRICK_H + BRICK_H, gcolor, 0.5);
            }

            /* Подсказка на пустой пластине */
            if (emptyHint) {
                emptyHint.classList.toggle('is-visible', state.bricks.length === 0 && !state.ghost);
                emptyHint.textContent = state.bricks.length === 0 ? label('emptyHint') : '';
            }

            updateStats();
        }

        function updateStats() {
            if (!statsBox) return;
            var studs = 0;
            var height = 0;
            var minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
            state.bricks.forEach(function (b) {
                studs += b.w * b.d;
                height = Math.max(height, b.level + 1);
                minX = Math.min(minX, b.x);
                maxX = Math.max(maxX, b.x + b.w);
                minZ = Math.min(minZ, b.z);
                maxZ = Math.max(maxZ, b.z + b.d);
            });
            var length = state.bricks.length ? maxX - minX : 0;
            var width = state.bricks.length ? maxZ - minZ : 0;
            statsBox.textContent = label('bricks') + ': ' + state.bricks.length +
                ' · ' + label('studs') + ': ' + studs +
                ' · ' + label('length') + ': ' + length +
                ' · ' + label('width') + ': ' + width +
                ' · ' + label('height') + ': ' + height;

            if (modeHint) {
                if (state.mode === 'rotate') {
                    modeHint.textContent = label('rotateModeHint');
                } else if (state.mode === 'erase') {
                    modeHint.textContent = label('eraseModeHint');
                } else {
                    modeHint.textContent = '';
                }
                modeHint.classList.toggle('is-visible', state.mode !== 'build');
            }
        }

        /* ---------- Логика сетки ---------- */

        function effectiveSize() {
            return { w: state.sel.w, d: state.sel.d };
        }

        function topAt(cx, cz, exceptId) {
            var top = 0;
            for (var i = 0; i < state.bricks.length; i++) {
                var b = state.bricks[i];
                if (exceptId !== undefined && b.id === exceptId) continue;
                if (cx >= b.x && cx < b.x + b.w && cz >= b.z && cz < b.z + b.d) {
                    if (b.level + 1 > top) top = b.level + 1;
                }
            }
            return top;
        }

        function placement(cx, cz, w, d) {
            var x0 = clamp(cx - Math.floor((w - 1) / 2), 0, NX - w);
            var z0 = clamp(cz - Math.floor((d - 1) / 2), 0, NZ - d);
            var level = -1;
            var ok = true;
            for (var i = 0; i < w; i++) {
                for (var j = 0; j < d; j++) {
                    var t = topAt(x0 + i, z0 + j);
                    if (level < 0) level = t;
                    else if (t !== level) ok = false;
                }
            }
            if (level < 0) level = 0;
            return { x: x0, z: z0, w: w, d: d, level: level, ok: ok };
        }

        function settle() {
            var moved = true;
            var guard = 0;
            while (moved && guard++ < 300) {
                moved = false;
                state.bricks.sort(function (a, b) { return a.level - b.level; });
                for (var i = 0; i < state.bricks.length; i++) {
                    var b = state.bricks[i];
                    while (b.level > 0) {
                        var canFall = true;
                        for (var x = b.x; x < b.x + b.w && canFall; x++) {
                            for (var z = b.z; z < b.z + b.d && canFall; z++) {
                                if (topAt(x, z, b.id) >= b.level) canFall = false;
                            }
                        }
                        if (!canFall) break;
                        b.level--;
                        moved = true;
                    }
                }
            }
        }

        /* ---------- Взаимодействие ---------- */

        function canvasPoint(event) {
            var rect = canvas.getBoundingClientRect();
            return { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }

        function hitTest(pt) {
            for (var i = hits.length - 1; i >= 0; i--) {
                if (pointInPolygon(pt, hits[i].poly)) return hits[i];
            }
            return null;
        }

        function hoverAt(pt) {
            if (!lastG) return null;
            var hit = hitTest(pt);
            var level = hit ? hit.brick.level + 1 : 0;
            var world = unproject(lastG, pt.x, pt.y, level * BRICK_H);
            var cx = Math.floor(world.x);
            var cz = Math.floor(world.z);
            if (hit) {
                cx = clamp(cx, hit.brick.x, hit.brick.x + hit.brick.w - 1);
                cz = clamp(cz, hit.brick.z, hit.brick.z + hit.brick.d - 1);
            }
            if (cx < 0 || cz < 0 || cx >= NX || cz >= NZ) return null;
            var size = effectiveSize();
            return { hit: hit, place: placement(cx, cz, size.w, size.d) };
        }

        function commit(pl) {
            if (!pl || !pl.ok) return false;
            history.push(serialize());
            if (history.length > 60) history.shift();
            state.bricks.push({
                id: nextId++,
                x: pl.x, z: pl.z, w: pl.w, d: pl.d,
                level: pl.level,
                color: state.sel.color
            });
            emit();
            render();
            return true;
        }

        function erase(hit) {
            if (!hit) return false;
            history.push(serialize());
            if (history.length > 60) history.shift();
            state.bricks = state.bricks.filter(function (b) {
                return b.id !== hit.brick.id;
            });
            settle();
            emit();
            render();
            return true;
        }

        function rotateBrick(id) {
            var brick = null;
            for (var i = 0; i < state.bricks.length; i++) {
                if (state.bricks[i].id === id) { brick = state.bricks[i]; break; }
            }
            if (!brick || brick.w === brick.d) return;
            var nw = brick.d, nd = brick.w;
            var nx = clamp(brick.x + Math.round((brick.w - nw) / 2), 0, NX - nw);
            var nz = clamp(brick.z + Math.round((brick.d - nd) / 2), 0, NZ - nd);
            /* Проверка: не сталкивается ли с другими кирпичиками на том же уровне */
            var conflict = false;
            for (var i = 0; i < state.bricks.length && !conflict; i++) {
                var ob = state.bricks[i];
                if (ob.id === brick.id) continue;
                if (ob.level !== brick.level) continue;
                if (nx < ob.x + ob.w && nx + nw > ob.x && nz < ob.z + ob.d && nz + nd > ob.z) conflict = true;
            }
            if (conflict) return;
            history.push(serialize());
            if (history.length > 60) history.shift();
            brick.w = nw; brick.d = nd;
            brick.x = nx; brick.z = nz;
            settle();
            emit();
            render();
        }

        function emit() {
            onChange(serialize());
        }

        function serialize() {
            return state.bricks.map(function (b) {
                return { x: b.x, z: b.z, w: b.w, d: b.d, level: b.level, color: b.color };
            });
        }

        function load(list, silent) {
            state.bricks = (list || []).map(function (b) {
                return {
                    id: nextId++,
                    x: clamp(b.x | 0, 0, NX - 1),
                    z: clamp(b.z | 0, 0, NZ - 1),
                    w: clamp(b.w | 0, 1, NX),
                    d: clamp(b.d | 0, 1, NZ),
                    level: Math.max(0, b.level | 0),
                    color: typeof b.color === 'string' ? b.color : COLORS[0].hex
                };
            });
            history = [];
            render();
            if (!silent) emit();
        }

        canvas.addEventListener('pointerdown', function (event) {
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            canvas.setPointerCapture(event.pointerId);
            var pt = canvasPoint(event);
            active[event.pointerId] = pt;

            var ids = Object.keys(active);
            if (ids.length === 1) {
                gesture = {
                    type: 'drag',
                    id: event.pointerId,
                    lastX: pt.x,
                    lastY: pt.y,
                    startX: pt.x,
                    startY: pt.y,
                    moved: false
                };
            } else if (ids.length === 2) {
                var a = active[ids[0]];
                var b = active[ids[1]];
                gesture = {
                    type: 'pinch',
                    dist: Math.hypot(a.x - b.x, a.y - b.y),
                    zoom: state.zoom
                };
                state.ghost = null;
            }
        });

        canvas.addEventListener('pointermove', function (event) {
            var pt = canvasPoint(event);

            if (!(event.pointerId in active)) {
                if (event.pointerType === 'mouse') {
                    if (state.mode === 'build') {
                        var hover = hoverAt(pt);
                        state.ghost = hover ? hover.place : null;
                        state.hoverId = null;
                    } else {
                        state.ghost = null;
                        var hov = hitTest(pt);
                        state.hoverId = hov ? hov.brick.id : null;
                    }
                    render();
                }
                return;
            }

            active[event.pointerId] = pt;

            if (gesture && gesture.type === 'pinch') {
                var ids = Object.keys(active);
                if (ids.length >= 2) {
                    var a = active[ids[0]];
                    var b = active[ids[1]];
                    var dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (gesture.dist > 4) {
                        state.zoom = clamp(gesture.zoom * (dist / gesture.dist), 0.5, 2.6);
                        render();
                    }
                }
                return;
            }

            if (!gesture || gesture.type !== 'drag' || gesture.id !== event.pointerId) return;

            var dx = pt.x - gesture.lastX;
            var dy = pt.y - gesture.lastY;
            gesture.lastX = pt.x;
            gesture.lastY = pt.y;
            if (!gesture.moved && Math.hypot(pt.x - gesture.startX, pt.y - gesture.startY) > 6) {
                gesture.moved = true;
            }
            if (gesture.moved) {
                state.yaw += dx * 0.008;
                state.pitch = clamp(state.pitch - dy * 0.006, 0.28, 1.25);
                state.ghost = null;
                render();
            } else if (event.pointerType === 'mouse') {
                if (state.mode === 'build') {
                    var hover2 = hoverAt(pt);
                    state.ghost = hover2 ? hover2.place : null;
                    state.hoverId = null;
                } else {
                    state.ghost = null;
                    var hov2 = hitTest(pt);
                    state.hoverId = hov2 ? hov2.brick.id : null;
                }
                render();
            }
        });

        function endPointer(event) {
            if (!(event.pointerId in active)) return;
            var pt = canvasPoint(event);
            delete active[event.pointerId];

            var g = gesture;
            var remaining = Object.keys(active).length;
            if (remaining === 0) {
                gesture = null;
            } else if (remaining === 1) {
                var only = active[Object.keys(active)[0]];
                gesture = {
                    type: 'drag',
                    id: parseInt(Object.keys(active)[0], 10),
                    lastX: only.x,
                    lastY: only.y,
                    startX: only.x,
                    startY: only.y,
                    moved: true
                };
            }

            if (!g || g.type !== 'drag' || g.id !== event.pointerId || g.moved) {
                state.ghost = null;
                render();
                return;
            }

            if (state.mode === 'rotate') {
                var rotHit = hitTest(pt);
                state.hoverId = null;
                if (rotHit) rotateBrick(rotHit.brick.id);
                render();
                return;
            }
            if (state.mode === 'erase') {
                var delHit = hitTest(pt);
                if (delHit) erase(delHit);
                return;
            }

            var hover = hoverAt(pt);
            if (!hover) {
                state.ghost = null;
                render();
                return;
            }
            if (!hover.hit) {
                commit(hover.place);
                state.ghost = null;
                render();
                return;
            }
            if (hover.place.ok) {
                commit(hover.place);
            }
            state.ghost = null;
            render();
        }

        canvas.addEventListener('pointerup', endPointer);
        canvas.addEventListener('pointercancel', function (event) {
            delete active[event.pointerId];
            if (!Object.keys(active).length) gesture = null;
            state.ghost = null;
            render();
        });

        canvas.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            var ctxHit = hitTest(canvasPoint(event));
            if (ctxHit) erase(ctxHit);
        });

        canvas.addEventListener('wheel', function (event) {
            event.preventDefault();
            var factor = Math.exp(-event.deltaY * 0.0012);
            state.zoom = clamp(state.zoom * factor, 0.5, 2.6);
            render();
        }, { passive: false });

        canvas.addEventListener('pointerleave', function () {
            if (!Object.keys(active).length && (state.ghost || state.hoverId !== null)) {
                state.ghost = null;
                state.hoverId = null;
                render();
            }
        });

        /* ---------- Кнопки ---------- */

        root.addEventListener('click', function (event) {
            var btn = event.target.closest('[data-act]');
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            switch (act) {
                case 'view-left':
                    state.yaw -= Math.PI / 4;
                    render();
                    break;
                case 'view-right':
                    state.yaw += Math.PI / 4;
                    render();
                    break;
                case 'zoom-in':
                    state.zoom = clamp(state.zoom * 1.15, 0.5, 2.6);
                    render();
                    break;
                case 'zoom-out':
                    state.zoom = clamp(state.zoom / 1.15, 0.5, 2.6);
                    render();
                    break;
                case 'rotate':
                    state.mode = state.mode === 'rotate' ? 'build' : 'rotate';
                    state.ghost = null;
                    state.hoverId = null;
                    refreshPalette();
                    render();
                    break;
                case 'erase':
                    state.mode = state.mode === 'erase' ? 'build' : 'erase';
                    state.ghost = null;
                    state.hoverId = null;
                    refreshPalette();
                    render();
                    break;
                case 'undo':
                    if (history.length) {
                        load(history.pop(), false);
                    }
                    break;
                case 'clear':
                    if (!state.bricks.length) return;
                    history.push(serialize());
                    state.bricks = [];
                    emit();
                    render();
                    break;
                default:
                    break;
            }
        });

        /* ---------- Размеры ---------- */

        function resize() {
            render();
        }

        if (window.ResizeObserver) {
            var ro = new ResizeObserver(resize);
            ro.observe(stage);
        }
        window.addEventListener('resize', resize);

        /* ---------- Публичный интерфейс ---------- */

        var api = {
            setBricks: function (list) {
                load(list, true);
            },
            setSize: function (cols, rows) {
                var nx = clamp(cols | 0, 4, 60);
                var nz = clamp(rows | 0, 4, 60);
                if (nx === NX && nz === NZ) return;
                NX = nx;
                NZ = nz;
                state.bricks.forEach(function (b) {
                    b.w = Math.min(b.w, NX);
                    b.d = Math.min(b.d, NZ);
                    b.x = clamp(b.x, 0, NX - b.w);
                    b.z = clamp(b.z, 0, NZ - b.d);
                });
                settle();
                render();
            },
            getBricks: function () {
                return serialize();
            },
            clear: function () {
                history.push(serialize());
                state.bricks = [];
                emit();
                render();
            },
            undo: function () {
                if (history.length) load(history.pop(), false);
            },
            setMode: function (mode) {
                state.mode = (mode === 'erase' || mode === 'rotate') ? mode : 'build';
                state.ghost = null;
                state.hoverId = null;
                refreshPalette();
                render();
            },
            setLabels: function (fn) {
                label = fn || label;
                root.querySelectorAll('[data-act]').forEach(function (btn) {
                    var act = btn.getAttribute('data-act');
                    var key = ACTIONS[act];
                    if (key) btn.title = label(key);
                });
                updateStats();
                render();
            },
            resize: resize,
            dispose: function () {
                if (window.ResizeObserver && ro) ro.disconnect();
                window.removeEventListener('resize', resize);
                if (root.parentNode) root.parentNode.removeChild(root);
            }
        };

        refreshPalette();
        api.setLabels(label);
        render();

        return api;
    }

    window.MBBuilder = { mount: mount, COLORS: COLORS, SIZES: SIZES };
})();
