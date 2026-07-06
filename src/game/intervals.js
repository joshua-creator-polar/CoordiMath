export const UNIVERSE = Object.freeze({ start: -16, end: 16, leftClosed: true, rightClosed: true });

export function makeInterval(start, end, leftClosed, rightClosed) {
  return { start: Number(start), end: Number(end), leftClosed: Boolean(leftClosed), rightClosed: Boolean(rightClosed) };
}

export function validateSetDefinition(name, definition) {
  if (definition.empty) return "";
  const start = Number(definition.start);
  const end = Number(definition.end);
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return `El conjunto ${name} debe tener extremos numéricos.`;
  }
  if (start < UNIVERSE.start || end > UNIVERSE.end) {
    return `El conjunto ${name} debe estar dentro del rango de −16 a +16.`;
  }
  if (start >= end) {
    return "El extremo izquierdo del intervalo debe ser menor que el derecho.";
  }
  return "";
}

export function definitionToInterval(definition) {
  if (definition.empty) return [];
  return [makeInterval(definition.start, definition.end, definition.leftClosed, definition.rightClosed)];
}

export function intervalToText(interval) {
  const left = interval.leftClosed ? "[" : "(";
  const right = interval.rightClosed ? "]" : ")";
  return `${left}${formatNumber(interval.start)}, ${formatNumber(interval.end)}${right}`;
}

export function setToText(intervals) {
  const normalized = normalize(intervals);
  if (normalized.length === 0) return "∅";
  return normalized.map(intervalToText).join(" ∪ ");
}

export function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(2)));
}

export function normalize(intervals) {
  const valid = intervals
    .map((interval) => clampInterval(interval))
    .filter((interval) => interval && !isEmpty(interval))
    .sort((a, b) => a.start - b.start || Number(b.leftClosed) - Number(a.leftClosed));

  const result = [];
  for (const interval of valid) {
    const last = result[result.length - 1];
    if (!last) {
      result.push({ ...interval });
      continue;
    }

    const overlaps = interval.start < last.end;
    const touches = interval.start === last.end && (last.rightClosed || interval.leftClosed);
    if (overlaps || touches) {
      if (interval.end > last.end) {
        last.end = interval.end;
        last.rightClosed = interval.rightClosed;
      } else if (interval.end === last.end) {
        last.rightClosed = last.rightClosed || interval.rightClosed;
      }
    } else {
      result.push({ ...interval });
    }
  }
  return result;
}

export function union(a, b) {
  return normalize([...a, ...b]);
}

export function intersection(a, b) {
  const result = [];
  for (const left of normalize(a)) {
    for (const right of normalize(b)) {
      const start = Math.max(left.start, right.start);
      const end = Math.min(left.end, right.end);
      const candidate = makeInterval(
        start,
        end,
        includesPoint(left, start) && includesPoint(right, start),
        includesPoint(left, end) && includesPoint(right, end),
      );
      if (!isEmpty(candidate)) result.push(candidate);
    }
  }
  return normalize(result);
}

export function difference(a, b) {
  return intersection(a, complement(b));
}

export function symmetricDifference(a, b) {
  return union(difference(a, b), difference(b, a));
}

export function complement(intervals) {
  const normalized = normalize(intervals);
  if (normalized.length === 0) return [UNIVERSE];

  const result = [];
  let cursor = UNIVERSE.start;
  let cursorClosed = true;

  for (const interval of normalized) {
    const gap = makeInterval(cursor, interval.start, cursorClosed, !interval.leftClosed);
    if (!isEmpty(gap)) result.push(gap);
    cursor = interval.end;
    cursorClosed = !interval.rightClosed;
  }

  const tail = makeInterval(cursor, UNIVERSE.end, cursorClosed, true);
  if (!isEmpty(tail)) result.push(tail);
  return normalize(result);
}

export function resolveExpression(expression, definitions) {
  const definitionError = Object.entries(definitions)
    .map(([name, definition]) => validateSetDefinition(name, definition))
    .find(Boolean);
  if (definitionError) return { ok: false, error: definitionError };

  const tokens = tokenize(expression);
  if (tokens.error) return { ok: false, error: tokens.error };
  if (tokens.items.length === 0) return { ok: false, error: "Construye una expresión antes de resolver." };

  const parser = createParser(tokens.items);
  const ast = parser.parseExpression();
  if (ast.error) return { ok: false, error: ast.error };
  if (!parser.isAtEnd()) return { ok: false, error: "La expresión contiene símbolos en una posición inválida." };

  const usedSets = [...new Set(tokens.items.filter((token) => ["A", "B", "C"].includes(token)))];
  const steps = [
    {
      operation: "Validación inicial",
      detail: "Se revisan extremos, símbolos permitidos, operadores y paréntesis balanceados.",
      result: "La expresión es válida para resolverse.",
    },
    {
      operation: "Conjuntos de partida",
      detail: usedSets.length > 0 ? usedSets.map((name) => `${name} = ${setToText(definitionToInterval(definitions[name]))}`).join("; ") : "No hay conjuntos usados.",
      result: "Estos intervalos son la base del cálculo.",
    },
    {
      operation: "Orden de resolución",
      detail: "Primero se resuelven paréntesis y complementos; después ∩; finalmente ∪, − y △ de izquierda a derecha.",
      result: expression,
    },
  ];
  const evaluated = evaluateAst(ast.node, definitions, steps);
  return {
    ok: true,
    result: normalize(evaluated),
    steps,
    interpretation: describeAst(ast.node),
  };
}

export function tokenCanAppend(expression, token) {
  const trimmed = expression.replaceAll(" ", "");
  const last = trimmed.at(-1) || "";
  const isOperand = (value) => ["A", "B", "C"].includes(value);
  const isBinary = (value) => ["∪", "∩", "−", "△"].includes(value);

  if (token === "clear" || token === "back") return true;
  if (isOperand(token)) return !last || isBinary(last) || last === "(";
  if (isBinary(token)) return isOperand(last) || last === ")" || last === "'";
  if (token === "'") return isOperand(last) || last === ")" || last === "'";
  if (token === "(") return !last || isBinary(last) || last === "(";
  if (token === ")") {
    const depth = [...trimmed].reduce((count, char) => count + (char === "(" ? 1 : char === ")" ? -1 : 0), 0);
    return depth > 0 && (isOperand(last) || last === ")" || last === "'");
  }
  return false;
}

function createParser(tokens) {
  let index = 0;
  const peek = () => tokens[index];
  const consume = () => tokens[index++];
  const isAtEnd = () => index >= tokens.length;

  function parseExpression() {
    return parseUnionLevel();
  }

  function parseUnionLevel() {
    let left = parseIntersectionLevel();
    if (left.error) return left;
    while (["∪", "−", "△"].includes(peek())) {
      const operator = consume();
      const right = parseIntersectionLevel();
      if (right.error) return right;
      left = { node: { type: "binary", operator, left: left.node, right: right.node } };
    }
    return left;
  }

  function parseIntersectionLevel() {
    let left = parsePostfixLevel();
    if (left.error) return left;
    while (peek() === "∩") {
      const operator = consume();
      const right = parsePostfixLevel();
      if (right.error) return right;
      left = { node: { type: "binary", operator, left: left.node, right: right.node } };
    }
    return left;
  }

  function parsePostfixLevel() {
    let target = parsePrimary();
    if (target.error) return target;
    while (peek() === "'") {
      consume();
      target = { node: { type: "complement", value: target.node } };
    }
    return target;
  }

  function parsePrimary() {
    const token = consume();
    if (["A", "B", "C"].includes(token)) return { node: { type: "set", name: token } };
    if (token === "(") {
      const inner = parseExpression();
      if (inner.error) return inner;
      if (peek() !== ")") return { error: "La expresión contiene un paréntesis sin cerrar." };
      consume();
      return inner;
    }
    if (!token) return { error: "La expresión está incompleta." };
    return { error: `El símbolo “${token}” no puede aparecer en esa posición.` };
  }

  return { parseExpression, isAtEnd };
}

function evaluateAst(node, definitions, steps) {
  if (node.type === "set") {
    return definitionToInterval(definitions[node.name]);
  }

  if (node.type === "complement") {
    const source = evaluateAst(node.value, definitions, steps);
    const result = complement(source);
    steps.push({ operation: "Complemento", detail: `Se toma el universo [−16, 16] y se elimina ${setToText(source)}.`, result: setToText(result) });
    return result;
  }

  const left = evaluateAst(node.left, definitions, steps);
  const right = evaluateAst(node.right, definitions, steps);
  const result = applyOperator(node.operator, left, right);
  steps.push({ operation: operatorName(node.operator), detail: operationDetail(node.operator, left, right), result: setToText(result) });
  return result;
}

function applyOperator(operator, left, right) {
  if (operator === "∪") return union(left, right);
  if (operator === "∩") return intersection(left, right);
  if (operator === "−") return difference(left, right);
  return symmetricDifference(left, right);
}

function operatorName(operator) {
  return {
    "∪": "Unión",
    "∩": "Intersección",
    "−": "Diferencia",
    "△": "Diferencia simétrica",
  }[operator] || "Operación";
}

function operationDetail(operator, left, right) {
  const leftText = setToText(left);
  const rightText = setToText(right);
  if (operator === "∪") return `Se juntan todas las regiones de ${leftText} y ${rightText}.`;
  if (operator === "∩") return `Se conserva solo la zona que aparece al mismo tiempo en ${leftText} y ${rightText}.`;
  if (operator === "−") return `Se parte de ${leftText} y se recorta todo lo que coincida con ${rightText}.`;
  return `Se combinan ${leftText} y ${rightText}, eliminando la zona común para dejar solo las partes exclusivas.`;
}

function describeAst(node) {
  if (node.type === "set") return `Se utiliza el conjunto ${node.name}.`;
  if (node.type === "complement") {
    return `Se toma todo lo que pertenece al universo de −16 a +16 y se excluye el resultado de: ${describeShort(node.value)}.`;
  }
  const left = describeShort(node.left);
  const right = describeShort(node.right);
  const messages = {
    "∪": `Se calcula la unión: se conservan los elementos que pertenecen a ${left}, a ${right} o a ambos.`,
    "∩": `Se calcula la intersección: se conservan únicamente los elementos comunes entre ${left} y ${right}.`,
    "−": `Se calcula la diferencia: se parte de ${left} y se eliminan los elementos que también pertenecen a ${right}.`,
    "△": `Se calcula la diferencia simétrica: se conservan los elementos que están en ${left} o en ${right}, pero no en ambos a la vez.`,
  };
  return messages[node.operator];
}

function describeShort(node) {
  if (node.type === "set") return `el conjunto ${node.name}`;
  if (node.type === "complement") return `el complemento de (${describeShort(node.value)})`;
  const names = { "∪": "unión", "∩": "intersección", "−": "diferencia", "△": "diferencia simétrica" };
  return `la ${names[node.operator]} entre (${describeShort(node.left)}) y (${describeShort(node.right)})`;
}

function tokenize(expression) {
  const allowed = new Set(["A", "B", "C", "∪", "∩", "−", "△", "'", "(", ")"]);
  const items = [];
  for (const raw of expression.replaceAll(" ", "")) {
    const token = raw === "-" ? "−" : raw;
    if (!allowed.has(token)) return { error: `El símbolo “${raw}” no está permitido.` };
    items.push(token);
  }
  const balance = items.reduce((count, token) => count + (token === "(" ? 1 : token === ")" ? -1 : 0), 0);
  if (balance !== 0) return { error: "La expresión contiene un paréntesis sin cerrar." };
  return { items };
}

function clampInterval(interval) {
  const start = Math.max(UNIVERSE.start, Number(interval.start));
  const end = Math.min(UNIVERSE.end, Number(interval.end));
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return makeInterval(
    start,
    end,
    start === interval.start ? interval.leftClosed : true,
    end === interval.end ? interval.rightClosed : true,
  );
}

function isEmpty(interval) {
  if (interval.start > interval.end) return true;
  if (interval.start === interval.end) return !(interval.leftClosed && interval.rightClosed);
  return false;
}

function includesPoint(interval, point) {
  const afterStart = point > interval.start || (point === interval.start && interval.leftClosed);
  const beforeEnd = point < interval.end || (point === interval.end && interval.rightClosed);
  return afterStart && beforeEnd;
}
