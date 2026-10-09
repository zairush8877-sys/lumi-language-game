(function (root) {
  'use strict';

  const TAU = Math.PI * 2;

  function oval(c, x, y, rx, ry, fill, stroke, width) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width || 1; c.stroke(); }
  }

  function path(c, fill, stroke, width, points) {
    c.beginPath();
    points(c);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width || 1; c.stroke(); }
  }

  function shadow(c, x, y, rx, ry, night) {
    oval(c, x, y, rx, ry, night ? 'rgba(10,25,34,.25)' : 'rgba(39,69,48,.15)');
  }

  function leaf(c, x, y, size, angle, night) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    path(c, night ? '#467256' : '#69a45f', night ? '#385c43' : '#4e824b', .7, p => {
      p.moveTo(-size, 0);
      p.quadraticCurveTo(-size * .3, -size * .9, size, 0);
      p.quadraticCurveTo(size * .25, size * .8, -size, 0);
      p.closePath();
    });
    path(c, null, night ? '#6b8e65' : '#95bc78', .65, p => {
      p.moveTo(-size * .7, 0); p.lineTo(size * .75, 0);
    });
    c.restore();
  }

  // Bounds include the handle; the centre of the complete jug is the origin.
  function jug(c, night) {
    c.translate(-.5, -2);
    c.scale(.8, 1);
    shadow(c, 0, 20, 16, 3, night);
    path(c, null, night ? '#744d3b' : '#995b3d', 5, p => {
      p.moveTo(7, -9);
      p.bezierCurveTo(21, -14, 23, 12, 8, 12);
    });
    path(c, null, night ? '#ad7853' : '#d5a36e', 1.3, p => {
      p.moveTo(10, -8);
      p.bezierCurveTo(19, -9, 19, 9, 10, 10);
    });
    const clay = c.createLinearGradient(-17, 0, 12, 0);
    clay.addColorStop(0, night ? '#85583f' : '#a96b48');
    clay.addColorStop(.38, night ? '#bd8759' : '#e0a56a');
    clay.addColorStop(1, night ? '#805038' : '#ae6845');
    path(c, clay, night ? '#654b3c' : '#966344', 1, p => {
      p.moveTo(-10, -16); p.lineTo(3, -16); p.lineTo(2, -10);
      p.bezierCurveTo(4, -4, 11, -2, 11, 7);
      p.bezierCurveTo(11, 17, 5, 20, -4, 20);
      p.bezierCurveTo(-15, 20, -19, 15, -18, 7);
      p.bezierCurveTo(-18, -1, -11, -5, -10, -10);
      p.closePath();
    });
    oval(c, -3.5, -16, 7.5, 2.5, night ? '#c39462' : '#edbd80');
    oval(c, -3.5, -16.4, 5.6, 1.2, night ? '#463b34' : '#795239');
    path(c, null, night ? '#d4ac79' : '#f3ce94', 1.5, p => {
      p.moveTo(-15, 3); p.bezierCurveTo(-10, 5, 4, 5, 8, 3);
      p.moveTo(-15, 7); p.bezierCurveTo(-9, 9, 3, 9, 8, 7);
    });
    for (const x of [-10, -4, 2]) {
      path(c, null, night ? '#764d39' : '#9b603f', 1.1, p => {
        p.moveTo(x - 2, 5.6); p.lineTo(x, 7); p.lineTo(x + 2, 5.6);
      });
    }
    oval(c, -11.5, -.5, 1.4, 4.5, night ? '#cca171' : '#efc38a');
  }

  function grapes(c, night) {
    c.translate(2, -.5);
    shadow(c, 0, 39, 34, 4, night);
    const wood = night ? '#70543e' : '#a8764c';
    const woodLight = night ? '#947557' : '#c59866';
    c.fillStyle = wood;
    c.fillRect(-32, -38, 5, 78); c.fillRect(27, -38, 5, 78);
    c.fillStyle = woodLight;
    c.fillRect(-34, -31, 68, 4); c.fillRect(-32, -5, 64, 3);
    c.fillRect(-31, 21, 62, 3);
    c.fillStyle = night ? '#b4956b' : '#e4c598';
    for (const x of [-29.5, 29.5]) {
      oval(c, x, -29, .8, .8, c.fillStyle);
      oval(c, x, -3.5, .8, .8, c.fillStyle);
    }
    path(c, null, night ? '#655a3d' : '#877041', 3.5, p => {
      p.moveTo(-18, 37); p.bezierCurveTo(-23, 12, 7, 9, -4, -19);
      p.bezierCurveTo(-12, -39, 19, -38, 29, -26);
      p.moveTo(-3, -12); p.bezierCurveTo(-14, -23, -28, -12, -30, -25);
      p.moveTo(-3, -2); p.bezierCurveTo(14, -17, 24, -6, 27, -16);
    });
    path(c, null, night ? '#7e8957' : '#8da463', .8, p => {
      p.moveTo(17, -33); p.bezierCurveTo(19, -43, 32, -42, 31, -34);
      p.bezierCurveTo(30, -29, 25, -32, 28, -35);
      p.moveTo(-27, -22); p.bezierCurveTo(-38, -28, -39, -18, -33, -18);
    });
    for (const [x, y, size, angle] of [
      [-23, -27, 10, -.45], [-7, -32, 11, .2], [13, -32, 11, -.3],
      [28, -24, 9, .9], [-23, -9, 10, .65], [10, -10, 11, -.5],
      [25, 2, 10, .55], [-10, 8, 9, -.3]
    ]) leaf(c, x, y, size, angle, night);
    for (const [bx, by] of [[-16, -10], [17, 5], [-4, -24]]) {
      path(c, null, wood, 1.2, p => { p.moveTo(bx, by - 4); p.lineTo(bx + 1, by - 11); });
      for (const [dx, dy] of [[-4, 0], [3, 0], [-7, 6], [0, 6], [6, 6], [-3.5, 12], [3.5, 12], [0, 18]]) {
        oval(c, bx + dx, by + dy, 3.8, 4.1,
          night ? '#705c87' : '#8c74ad', night ? '#50425f' : '#6c5788', .6);
        oval(c, bx + dx - 1.1, by + dy - 1.5, 1, .8, night ? '#9b83a9' : '#bd9cce');
      }
    }
  }

  function bridge(c, night, time) {
    shadow(c, 0, 20, 49, 4, night);
    // A self-contained stream makes the bridge sensible wherever it is placed.
    path(c, night ? '#456d7e' : '#8ccad0', null, 0, p => {
      p.moveTo(-17, -23); p.bezierCurveTo(6, -16, 6, -7, 23, 1);
      p.bezierCurveTo(39, 11, 14, 15, 23, 23);
      p.lineTo(-8, 23); p.bezierCurveTo(-27, 14, 1, 8, -12, 1);
      p.bezierCurveTo(-25, -7, -33, -13, -17, -23); p.closePath();
    });
    path(c, null, night ? '#7f9c9b' : '#c4e9df', 1.2, p => {
      p.moveTo(-17, -17); p.quadraticCurveTo(-12, -13, -8, -12);
      p.moveTo(9, 16); p.quadraticCurveTo(13, 18, 17, 19);
    });
    for (const [x, y, rx, ry] of [[-25, 15, 6, 3], [29, 17, 5, 3], [-29, -16, 4, 2.5]]) {
      oval(c, x, y, rx, ry, night ? '#7e877b' : '#bcc4a7');
    }
    const deck = c.createLinearGradient(0, -10, 0, 15);
    deck.addColorStop(0, night ? '#ac855a' : '#e2b77b');
    deck.addColorStop(1, night ? '#725340' : '#a8794d');
    path(c, deck, night ? '#59483a' : '#8a603f', 1.2, p => {
      p.moveTo(-48, 12); p.quadraticCurveTo(0, -10, 48, 12);
      p.lineTo(48, 18); p.quadraticCurveTo(0, -1, -48, 18); p.closePath();
    });
    for (let x = -39; x <= 39; x += 9.75) {
      const arch = 12 - 11 * (1 - x * x / (48 * 48));
      path(c, null, night ? '#76543e' : '#ab7a4f', 1, p => {
        p.moveTo(x, arch + .5); p.lineTo(x, arch + 6.5);
      });
    }
    const rail = night ? '#a17b54' : '#c5935c';
    for (const x of [-46, -23, 0, 23, 46]) {
      const y = -3 - 10 * (1 - x * x / (46 * 46));
      path(c, null, night ? '#71533d' : '#91653f', 3.5, p => {
        p.moveTo(x, y + 1); p.lineTo(x, y + 17);
      });
      oval(c, x, y, 2.5, 1.6, rail);
    }
    path(c, null, rail, 4, p => {
      p.moveTo(-48, -3); p.quadraticCurveTo(0, -24, 48, -3);
    });
    path(c, null, night ? '#c0a27a' : '#edc58a', 1, p => {
      p.moveTo(-47, -4); p.quadraticCurveTo(0, -25, 47, -4);
    });
    // Deliberately static water; only the campfire needs continuous motion.
    void time;
  }

  function lamb(c, night) {
    c.translate(-2, -1);
    shadow(c, 0, 19, 27, 3.5, night);
    c.lineCap = 'round';
    for (const [x, y] of [[-15, 8], [-5, 11], [9, 10], [18, 8]]) {
      path(c, null, night ? '#b6b5a0' : '#e2d8b9', 4, p => {
        p.moveTo(x, y); p.lineTo(x - 1, 19);
      });
      path(c, null, night ? '#4b4b43' : '#776752', 3.5, p => {
        p.moveTo(x - 2, 19); p.lineTo(x + .5, 19);
      });
    }
    oval(c, -22, -1, 5, 4, night ? '#c9c8b3' : '#f0e8ce');
    oval(c, -2, -1, 22, 14, night ? '#c3c3af' : '#eee8d1');
    for (const [x, y, size] of [[-18, -4, 7], [-13, -11, 7], [-3, -13, 7.5], [7, -10, 7.5], [15, -4, 7], [12, 4, 7], [2, 8, 7.5], [-9, 7, 7], [-18, 4, 6]]) {
      oval(c, x, y, size, size * .88, night ? '#d8d7bf' : '#fff7df');
      path(c, null, night ? '#b7baa7' : '#e1dcc6', .6, p => {
        p.arc(x, y + 1, size * .6, .2, 1.5);
      });
    }
    oval(c, 16, -10, 6.8, 3.3, night ? '#b4aa91' : '#e8d5ac');
    oval(c, 18, -10, 3.8, 1.5, night ? '#bf9f8c' : '#eabca2');
    oval(c, 26, -10, 3.5, 5.3, night ? '#c9bea1' : '#f1dfb8');
    oval(c, 24, -3, 7, 8, night ? '#c3b69a' : '#ead6ae');
    oval(c, 22, -12.5, 6, 4.3, night ? '#dddcc4' : '#fff7df');
    oval(c, 26, -4, 1.1, 1.4, '#39433b');
    oval(c, 26.3, -4.5, .35, .4, '#fff8df');
    oval(c, 29.3, .7, 1.8, 1.4, night ? '#766f61' : '#9a7e64');
    path(c, null, night ? '#837865' : '#ad9474', .8, p => {
      p.moveTo(28.5, 2); p.quadraticCurveTo(26.5, 3.5, 25.5, 2.5);
    });
  }

  function campfire(c, night, time) {
    shadow(c, 0, 22, 28, 4, night);
    if (night) {
      const glow = c.createRadialGradient(0, 3, 2, 0, 5, 29);
      glow.addColorStop(0, 'rgba(255,185,80,.23)');
      glow.addColorStop(1, 'rgba(255,170,70,0)');
      oval(c, 0, 5, 29, 24, glow);
    }
    oval(c, 0, 15, 25, 9, night ? '#444a48' : '#656a60');
    oval(c, 0, 15, 18.5, 5.5, night ? '#342f2c' : '#514738');
    for (const [x, y, rotation] of [[-1, 13, -.35], [0, 14, .35]]) {
      c.save(); c.translate(x, y); c.rotate(rotation);
      c.fillStyle = night ? '#76523c' : '#8d5f3e'; c.fillRect(-17, -2.5, 34, 5);
      path(c, null, night ? '#b27e4b' : '#c98d52', .9, p => {
        p.moveTo(-13, -1); p.lineTo(13, -1);
      });
      oval(c, 16, 0, 2, 2.5, night ? '#b38a59' : '#d0a16a'); c.restore();
    }
    const sway = Math.sin(time * 4.1) * 1.8;
    const flicker = Math.sin(time * 5.7 + .8) * 1.7;
    const flame = c.createLinearGradient(0, -23, 0, 16);
    flame.addColorStop(0, '#ffc777'); flame.addColorStop(.55, '#f79a43'); flame.addColorStop(1, '#d96535');
    path(c, flame, null, 0, p => {
      p.moveTo(-13, 12);
      p.bezierCurveTo(-19, 3, -10, -3, -9 + sway, -13);
      p.quadraticCurveTo(-5, -7, -4, -4);
      p.bezierCurveTo(1, -10, -2 + sway, -17, 4 + sway, -24 + flicker);
      p.bezierCurveTo(3, -11, 11, -11, 10, -2);
      p.quadraticCurveTo(15, -8, 14 - sway, -12);
      p.bezierCurveTo(22, 0, 17, 10, 9, 14);
      p.quadraticCurveTo(-3, 18, -13, 12); p.closePath();
    });
    path(c, '#ffdc82', null, 0, p => {
      p.moveTo(-7, 12); p.quadraticCurveTo(-9, 5, -3, 1);
      p.quadraticCurveTo(-3 + sway, -5, 1 + sway, -9 - flicker * .5);
      p.quadraticCurveTo(2, 0, 7, 4);
      p.quadraticCurveTo(13, 14, 2, 16); p.quadraticCurveTo(-3, 16, -7, 12);
    });
    oval(c, 1, 12, 4, 3.5, '#fff1b3');
    for (const [x, y, rx, ry] of [[-23, 13, 5, 4], [-17, 20, 6, 4], [-6, 23, 6, 3.5], [7, 23, 6, 3.5], [18, 19, 6, 4], [24, 12, 4.5, 4]]) {
      oval(c, x, y, rx, ry, night ? '#85887a' : '#b6b9a5', night ? '#5c665e' : '#8e9988', .7);
      oval(c, x - 1, y - 1.2, rx * .55, ry * .22, night ? '#a5a28a' : '#d5d3b8');
    }
  }

  const painters = { jug, grapes, bridge, lamb, campfire };
  const api = {
    draw(c, id, night, time) {
      const painter = Object.prototype.hasOwnProperty.call(painters, id) ? painters[id] : null;
      if (!painter) return false;
      c.save();
      try {
        c.lineJoin = 'round';
        c.lineCap = 'round';
        painter(c, Boolean(night), Number.isFinite(time) ? time : 0);
      } finally {
        c.restore();
      }
      return true;
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LumiEstateExtras = api;
})(typeof window !== 'undefined' ? window : this);
