import { formatNumber, setToText, UNIVERSE } from "./intervals.js";

const RANGE = 16;

export function createPoint(id, x, y) {
  return { id, x: clampCoordinate(x), y: clampCoordinate(y), color: pointColor(id) };
}

export function clampCoordinate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(-RANGE, Math.min(RANGE, Math.round(number)));
}

export function distanceBetween(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function midpointBetween(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function symmetryPoints(point) {
  return [
    { label: "Simetría en eje X", x: point.x, y: -point.y, color: "#2f80ed" },
    { label: "Simetría en eje Y", x: -point.x, y: point.y, color: "#27ae60" },
    { label: "Simetría en origen", x: -point.x, y: -point.y, color: "#8e44ad" },
  ];
}

export function drawCoordinateScene(canvas, state, now = performance.now()) {
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const cssSize = Math.max(500, Math.floor(Math.min(rect.width, rect.height || rect.width)));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelSize = Math.floor(cssSize * ratio);

  if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
    canvas.width = pixelSize;
    canvas.height = pixelSize;
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, cssSize, cssSize);

  const margin = clamp(cssSize * 0.105 * state.settings.visualScale, 30, 48);
  const plotSize = cssSize - margin * 2;
  const transform = { size: cssSize, margin, plotSize };
  state.cartesian.transform = transform;

  drawPlane(context, transform, state.settings);
  if (state.labMode === "intervals") {
    drawIntervalLab(context, transform, state, now);
  } else {
    drawCartesianObjects(context, transform, state);
  }
}

export function screenToCoordinate(state, clientX, clientY, canvas) {
  const rect = canvas.getBoundingClientRect();
  const transform = state.cartesian.transform;
  if (!transform) return { x: 0, y: 0 };
  const x = ((clientX - rect.left - transform.margin) / transform.plotSize) * (RANGE * 2) - RANGE;
  const y = RANGE - ((clientY - rect.top - transform.margin) / transform.plotSize) * (RANGE * 2);
  return { x: clampCoordinate(x), y: clampCoordinate(y) };
}

export function findPointNear(state, clientX, clientY, canvas) {
  const rect = canvas.getBoundingClientRect();
  const transform = state.cartesian.transform;
  if (!transform) return null;
  const px = clientX - rect.left;
  const py = clientY - rect.top;
  let nearest = null;
  let nearestDistance = 18;

  for (const point of state.cartesian.points) {
    const position = toScreen(point.x, point.y, transform);
    const distance = Math.hypot(position.x - px, position.y - py);
    if (distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function drawPlane(context, transform, settings) {
  const { size, margin, plotSize } = transform;
  context.save();
  roundRect(context, 0, 0, size, size, 16);
  context.clip();
  context.fillStyle = settings.theme === "dark" ? "#0f172a" : "#ffffff";
  context.fillRect(0, 0, size, size);

  context.fillStyle = settings.theme === "dark" ? "rgba(33, 46, 72, 0.92)" : "#fbfdff";
  context.fillRect(margin, margin, plotSize, plotSize);

  if (settings.showGrid) {
    for (let value = -RANGE; value <= RANGE; value += 1) {
      const pos = toScreen(value, value, transform);
      const major = value % 4 === 0;
      context.strokeStyle = major ? "rgba(71, 89, 120, 0.23)" : "rgba(71, 89, 120, 0.12)";
      context.lineWidth = major ? 1.1 : 0.7;
      line(context, pos.x, margin, pos.x, margin + plotSize);
      line(context, margin, pos.y, margin + plotSize, pos.y);
    }
  }

  const origin = toScreen(0, 0, transform);
  context.strokeStyle = settings.theme === "dark" ? "#dce7f7" : "#1f2937";
  context.lineWidth = 2.2;
  line(context, margin, origin.y, margin + plotSize, origin.y);
  line(context, origin.x, margin, origin.x, margin + plotSize);
  drawArrow(context, margin + plotSize, origin.y, 0);
  drawArrow(context, margin, origin.y, Math.PI);
  drawArrow(context, origin.x, margin, -Math.PI / 2);
  drawArrow(context, origin.x, margin + plotSize, Math.PI / 2);

  if (settings.showNumbers) drawNumbers(context, transform, settings);
  context.restore();
}

function drawNumbers(context, transform, settings) {
  const { size, margin, plotSize } = transform;
  const origin = toScreen(0, 0, transform);
  const step = size < 380 ? 4 : 2;
  context.fillStyle = settings.theme === "dark" ? "#d8e4f6" : "#1f2937";
  context.font = `700 ${size < 380 ? 10 : 12}px "Nunito Sans", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "top";

  for (let value = -RANGE; value <= RANGE; value += step) {
    if (value === 0) continue;
    const x = toScreen(value, 0, transform).x;
    const y = toScreen(0, value, transform).y;
    context.fillText(formatSigned(value), x, Math.min(margin + plotSize - 14, origin.y + 6));
    context.textAlign = "right";
    context.textBaseline = "middle";
    context.fillText(formatSigned(value), Math.max(22, origin.x - 7), y);
    context.textAlign = "center";
    context.textBaseline = "top";
  }

  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText("x", margin + plotSize - 10, origin.y - 14);
  context.fillText("y", origin.x + 10, margin + 10);
  context.textAlign = "right";
  context.fillText("0", origin.x - 7, origin.y + 12);
}

function drawIntervalLab(context, transform, state, now) {
  const definitions = state.sets;
  const lanes = [
    ["A", 11],
    ["B", 8],
    ["C", 5],
  ];
  for (const [name, y] of lanes) {
    if (definitions[name].visible === false) continue;
    drawIntervalSet(context, transform, [{
      start: definitions[name].start,
      end: definitions[name].end,
      leftClosed: definitions[name].leftClosed,
      rightClosed: definitions[name].rightClosed,
    }].filter(() => !definitions[name].empty), y, definitions[name].color, name, 0.88);
  }

  const result = state.intervalResult;
  if (result?.ok) {
    const elapsed = now - (result.animatedAt || now);
    const alpha = state.settings.animations ? clamp(elapsed / 650, 0.12, 1) : 1;
    drawIntervalSet(context, transform, result.result, -4, "#e94d5f", "Resultado", alpha, true);
    if (alpha < 1) state.needsAnimation = true;
  }
}

function drawIntervalSet(context, transform, intervals, yValue, color, label, alpha, glow = false) {
  const y = toScreen(0, yValue, transform).y;
  context.save();
  context.globalAlpha = alpha;
  context.lineCap = "round";
  context.lineWidth = glow ? 8 : 6;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.font = "800 12px \"Nunito Sans\", sans-serif";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(label, transform.margin + 6, y - 16);

  if (glow) {
    context.shadowColor = color;
    context.shadowBlur = 15;
  }

  for (const interval of intervals) {
    const x1 = toScreen(Math.max(UNIVERSE.start, interval.start), 0, transform).x;
    const x2 = toScreen(Math.min(UNIVERSE.end, interval.end), 0, transform).x;
    line(context, x1, y, x2, y);
    drawEndpoint(context, x1, y, interval.leftClosed, color);
    drawEndpoint(context, x2, y, interval.rightClosed, color);
  }
  context.shadowBlur = 0;
  context.font = "700 11px \"Nunito Sans\", sans-serif";
  context.fillStyle = color;
  context.textAlign = "right";
  context.fillText(setToText(intervals), transform.margin + transform.plotSize - 4, y - 16);
  context.restore();
}

function drawEndpoint(context, x, y, closed, color) {
  context.save();
  context.lineWidth = 2;
  context.strokeStyle = color;
  context.fillStyle = closed ? color : "#ffffff";
  context.beginPath();
  context.arc(x, y, 5.5, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function drawCartesianObjects(context, transform, state) {
  const points = state.cartesian.points;
  if (state.cartesian.connectSegments && points.length > 1) {
    context.save();
    context.strokeStyle = "rgba(47, 128, 237, 0.75)";
    context.lineWidth = 3;
    context.lineJoin = "round";
    context.beginPath();
    points.forEach((point, index) => {
      const screen = toScreen(point.x, point.y, transform);
      if (index === 0) context.moveTo(screen.x, screen.y);
      else context.lineTo(screen.x, screen.y);
    });
    context.stroke();
    context.restore();
  }

  for (const ghost of state.cartesian.ghosts) {
    const screen = toScreen(ghost.x, ghost.y, transform);
    context.save();
    context.globalAlpha = 0.7;
    context.strokeStyle = ghost.color;
    context.setLineDash([5, 5]);
    const origin = toScreen(0, 0, transform);
    line(context, origin.x, origin.y, screen.x, screen.y);
    context.setLineDash([]);
    context.fillStyle = ghost.color;
    context.beginPath();
    context.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
    context.fill();
    drawPointLabel(context, `${ghost.label}: (${formatNumber(ghost.x)}, ${formatNumber(ghost.y)})`, screen.x, screen.y, ghost.color);
    context.restore();
  }

  for (const point of points) {
    const screen = toScreen(point.x, point.y, transform);
    const selected = point.id === state.cartesian.selectedId;
    context.save();
    context.fillStyle = point.color;
    context.shadowColor = point.color;
    context.shadowBlur = selected ? 18 : 8;
    context.beginPath();
    context.arc(screen.x, screen.y, selected ? 7.5 : 6, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    if (selected) {
      context.strokeStyle = "#ffffff";
      context.lineWidth = 3;
      context.stroke();
    }
    drawPointLabel(context, `P${point.id} (${formatNumber(point.x)}, ${formatNumber(point.y)})`, screen.x, screen.y, point.color);
    context.restore();
  }
}

function drawPointLabel(context, text, x, y, color) {
  context.font = "800 11px \"Nunito Sans\", sans-serif";
  const width = context.measureText(text).width + 10;
  const cssSize = context.canvas.getBoundingClientRect().width || context.canvas.width;
  const labelX = clamp(x + 9, 5, cssSize - width - 5);
  const labelY = clamp(y - 25, 5, cssSize - 24);
  context.fillStyle = "rgba(255, 255, 255, 0.90)";
  roundRect(context, labelX, labelY, width, 20, 8);
  context.fill();
  context.fillStyle = color;
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(text, labelX + 5, labelY + 10);
}

function toScreen(x, y, transform) {
  return {
    x: transform.margin + ((x + RANGE) / (RANGE * 2)) * transform.plotSize,
    y: transform.margin + ((RANGE - y) / (RANGE * 2)) * transform.plotSize,
  };
}

function line(context, x1, y1, x2, y2) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function drawArrow(context, x, y, angle) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(-7, -4);
  context.lineTo(-7, 4);
  context.closePath();
  context.fillStyle = context.strokeStyle;
  context.fill();
  context.restore();
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function pointColor(id) {
  const colors = ["#e94d5f", "#2f80ed", "#27ae60", "#8e44ad", "#f2994a", "#1abc9c"];
  return colors[(id - 1) % colors.length];
}

function formatSigned(value) {
  return value > 0 ? `+${value}` : String(value);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
