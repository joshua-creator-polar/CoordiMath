import { resolveExpression, setToText } from "./intervals.js";

export function createQuiz(definitions) {
  const intersection = resolveExpression("A∩B", definitions);
  const union = resolveExpression("A∪B", definitions);
  const difference = resolveExpression("(A∪B)−C", definitions);
  const complement = resolveExpression("((A∩B)−C)'", definitions);

  return [
    {
      type: "concept",
      prompt: "¿Qué operación conserva únicamente los elementos comunes entre dos conjuntos?",
      options: ["Unión", "Intersección", "Complemento", "Diferencia simétrica"],
      answer: "Intersección",
      explanation: "La intersección (∩) mantiene solo la parte compartida por los conjuntos.",
    },
    {
      type: "result",
      prompt: "Con los intervalos actuales, ¿cuál es el resultado de A ∩ B?",
      options: uniqueOptions([
        setToText(intersection.ok ? intersection.result : []),
        setToText(union.ok ? union.result : []),
        "∅",
        "[−16, 16]",
      ]),
      answer: setToText(intersection.ok ? intersection.result : []),
      explanation: "Se toma la región que A y B tienen en común.",
    },
    {
      type: "symbol",
      prompt: "¿Qué símbolo representa la diferencia simétrica?",
      options: ["∪", "∩", "△", "'"],
      answer: "△",
      explanation: "La diferencia simétrica se escribe △ y deja las partes que no se superponen.",
    },
    {
      type: "result",
      prompt: "¿Qué resultado produce (A ∪ B) − C con los intervalos actuales?",
      options: uniqueOptions([
        setToText(difference.ok ? difference.result : []),
        setToText(union.ok ? union.result : []),
        setToText(intersection.ok ? intersection.result : []),
        setToText(complement.ok ? complement.result : []),
      ]),
      answer: setToText(difference.ok ? difference.result : []),
      explanation: "Primero se reúnen A y B; después se elimina toda parte que pertenezca a C.",
    },
    {
      type: "interpretation",
      prompt: "¿Cómo se interpreta el complemento A'?",
      options: [
        "Todo lo que está dentro de A",
        "Todo lo que no pertenece a A dentro del universo",
        "La parte común de A y B",
        "La distancia entre extremos",
      ],
      answer: "Todo lo que no pertenece a A dentro del universo",
      explanation: "El complemento toma los elementos del universo que quedan fuera del conjunto indicado.",
    },
  ];
}

export function gradeQuiz(answers, questions) {
  const details = questions.map((question, index) => {
    const selected = answers[index] || "";
    return {
      prompt: question.prompt,
      selected,
      answer: question.answer,
      correct: selected === question.answer,
      explanation: question.explanation,
    };
  });
  const correct = details.filter((item) => item.correct).length;
  return {
    correct,
    incorrect: questions.length - correct,
    score: Math.round((correct / questions.length) * 100),
    details,
  };
}

function uniqueOptions(options) {
  const unique = [...new Set(options)];
  const fillers = ["∅", "[−16, 16]", "(−16, 16)", "[0, 1]"];
  for (const filler of fillers) {
    if (unique.length >= 4) break;
    if (!unique.includes(filler)) unique.push(filler);
  }
  return unique.slice(0, 4);
}
