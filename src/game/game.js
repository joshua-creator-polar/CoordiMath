import {
  clampCoordinate,
  createPoint,
  distanceBetween,
  drawCoordinateScene,
  findPointNear,
  midpointBetween,
  screenToCoordinate,
  symmetryPoints,
} from "./cartesian.js";
import { EXAMPLES, TOPICS } from "./content.js";
import { formatNumber, resolveExpression, setToText, tokenCanAppend } from "./intervals.js";
import { createQuiz, gradeQuiz } from "./quiz.js";

const SAVE_VERSION = 1;
const PANEL_LABELS = {
  operaciones: "Operaciones",
  ejemplos: "Ejemplos",
  pasos: "Paso a paso",
  historial: "Historial",
  interpretacion: "Interpretación",
  configuracion: "Configuración",
};

export function createGame({ mount, sdk, ready, tweaks, assets }) {
  void ready;
  void tweaks;

  const state = createInitialState();
  let root = null;
  let cleanup = () => {};
  let animationFrame = 0;
  let saveTimer = 0;

  return {
    start() {
      root = document.createElement("section");
      root.className = "coordimath-root";
      mount.replaceChildren(root);

      root.addEventListener("click", handleClick);
      root.addEventListener("input", handleInput);
      root.addEventListener("change", handleInput);
      window.addEventListener("resize", drawCanvasSoon);

      cleanup = () => {
        window.removeEventListener("resize", drawCanvasSoon);
        root?.removeEventListener("click", handleClick);
        root?.removeEventListener("input", handleInput);
        root?.removeEventListener("change", handleInput);
        cancelAnimationFrame(animationFrame);
        clearTimeout(saveTimer);
        mount.replaceChildren();
      };

      renderApp();
      preloadAssets();
      loadSavedState();
    },
    destroy() {
      cleanup();
      cleanup = () => {};
    },
    sdk,
    ready,
    tweaks,
    assets,
  };

  async function preloadAssets() {
    const markUrl = assets?.get("COORDIMATH_MARK") || "";
    const backdropUrl = assets?.get("COORDIMATH_BACKDROP") || "";
    try {
      const [mark, backdrop] = await Promise.all([loadOptionalImage(markUrl), loadOptionalImage(backdropUrl)]);
      state.images.markUrl = mark?.src || "";
      state.images.backdropUrl = backdrop?.src || "";
    } catch {
      state.assetError = "No se pudo cargar el arte; se usará el estilo base.";
    } finally {
      state.assetsReady = true;
      renderApp();
    }
  }

  async function loadSavedState() {
    try {
      const saved = await sdk.gameState.load();
      if (saved?.version === SAVE_VERSION) {
        state.history = Array.isArray(saved.history) ? saved.history.slice(0, 12) : [];
        state.bestScore = Number.isFinite(saved.bestScore) ? saved.bestScore : 0;
        if (saved.settings) state.settings = { ...state.settings, ...saved.settings };
      }
    } catch {
      state.message = { text: "El historial se mantendrá solo durante esta sesión.", type: "info" };
    }
    renderApp();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(async () => {
      try {
        await sdk.gameState.save({
          version: SAVE_VERSION,
          history: state.history.slice(0, 12),
          bestScore: state.bestScore,
          settings: state.settings,
        });
      } catch {
        // Saving is helpful, but the lab remains fully usable without persistence.
      }
    }, 250);
  }

  function renderApp() {
    if (!root) return;
    cancelAnimationFrame(animationFrame);
    root.innerHTML = `
      <div class="cm-app ${state.settings.theme === "dark" ? "dark" : "light"}">
        <div class="cm-backdrop" ${state.images.backdropUrl ? `style="background-image: url('${state.images.backdropUrl}')"` : ""}></div>
        ${renderHeader()}
        <main class="cm-content">${renderView()}</main>
        ${state.message ? `<div class="toast" role="status">${escapeHtml(state.message.text)}</div>` : ""}
        ${renderStartOverlay()}
      </div>
    `;
    attachCanvas();
  }

  function renderHeader() {
    const nav = [
      ["inicio", "Inicio"],
      ["aprender", "Aprender"],
      ["laboratorio", "Laboratorio"],
      ["evaluacion", "Evaluación"],
      ["acerca", "Acerca"],
    ];
    return `
      <header class="cm-topbar">
        <div class="brand-row">
          <div class="brand-title">
            ${state.images.markUrl ? `<img src="${state.images.markUrl}" alt="Logo de CoordiMath">` : ""}
            <div>
              <h1>CoordiMath</h1>
              <p class="brand-subtitle">Laboratorio interactivo del plano cartesiano e intervalos</p>
            </div>
          </div>
          <div class="mini-label">Universo: −16 a +16</div>
        </div>
        <nav class="view-nav" aria-label="Módulos principales">
          ${nav.map(([view, label]) => `<button type="button" class="chip ${state.view === view ? "active" : ""}" data-view="${view}">${label}</button>`).join("")}
        </nav>
      </header>
    `;
  }

  function renderView() {
    if (state.view === "aprender") return renderLearn();
    if (state.view === "laboratorio") return renderLab();
    if (state.view === "evaluacion") return renderEvaluation();
    if (state.view === "acerca") return renderAbout();
    return renderHome();
  }

  function renderHome() {
    return `
      <section class="home-grid">
        <article class="cm-card hero-card">
          <div>
            <h2>Experimenta, visualiza y comprende.</h2>
            <p class="muted">CoordiMath convierte coordenadas, intervalos y operaciones entre conjuntos en gráficas claras con pasos explicados.</p>
          </div>
          <div class="hero-metrics">
            <div class="metric"><strong>4</strong><span>Módulos</span></div>
            <div class="metric"><strong>9</strong><span>Temas guiados</span></div>
            <div class="metric"><strong>5</strong><span>Operaciones</span></div>
          </div>
          <div class="home-actions">
            <button type="button" class="primary-btn" data-view="aprender">Aprender</button>
            <button type="button" class="primary-btn" data-view="laboratorio">Laboratorio</button>
            <button type="button" class="ghost-btn" data-view="evaluacion">Evaluación</button>
            <button type="button" class="ghost-btn" data-view="acerca">Acerca del proyecto</button>
            <button type="button" class="danger-btn" data-action="exit">Salir</button>
          </div>
        </article>
        <aside class="cm-card mini-graph-card" aria-hidden="true">
          <div class="mini-graph">
            <span class="mini-line"></span>
            <span class="mini-dot a"></span>
            <span class="mini-dot b"></span>
            <span class="mini-interval"></span>
          </div>
        </aside>
      </section>
    `;
  }

  function renderLearn() {
    const topic = TOPICS[state.activeTopic] || TOPICS[0];
    return `
      <section class="learn-grid">
        <div class="topic-list" role="list" aria-label="Temas">
          ${TOPICS.map((item, index) => `
            <button type="button" class="topic-card ${index === state.activeTopic ? "active" : ""}" data-topic="${index}">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="muted">Ver explicación y ejemplo</span>
            </button>
          `).join("")}
        </div>
        <article class="learn-detail">
          <h2>${escapeHtml(topic.title)}</h2>
          <div class="concept-grid">
            ${conceptBox("Definición", topic.definition)}
            ${conceptBox("Explicación sencilla", topic.explanation)}
            ${conceptBox("Ejemplo resuelto", topic.example)}
            ${conceptBox("Error común", topic.commonError)}
          </div>
          <div class="result-box"><strong>Recomendación</strong><span>${escapeHtml(topic.tip)}</span></div>
          ${renderTopicGraphic(state.activeTopic)}
        </article>
      </section>
    `;
  }

  function renderLab() {
    return `
      <section class="lab-view">
        <div class="plane-column">
          <div class="lab-mode-row">
            <button type="button" class="chip ${state.labMode === "intervals" ? "active" : ""}" data-lab-mode="intervals">Intervalos y conjuntos</button>
            <button type="button" class="chip ${state.labMode === "cartesian" ? "active" : ""}" data-lab-mode="cartesian">Plano cartesiano</button>
          </div>
          <div class="plane-wrap">
            <canvas id="coord-plane" class="plane-canvas" aria-label="Plano cartesiano de −16 a +16"></canvas>
          </div>
          <div class="plane-note">
            <span>Rango fijo: X = −16…+16, Y = −16…+16.</span>
            <span>${state.labMode === "cartesian" ? "Toca para crear puntos; arrastra para moverlos." : "Los intervalos se muestran por niveles y el resultado en rojo."}</span>
          </div>
          ${renderLabQuickResult()}
        </div>
        <aside class="side-column">
          <div class="panel-tabs" aria-label="Paneles del laboratorio">
            ${Object.entries(PANEL_LABELS).map(([key, label]) => `<button type="button" class="chip ${state.activePanel === key ? "active" : ""}" data-panel="${key}">${label}</button>`).join("")}
          </div>
          <section class="side-panel">${renderPanel()}</section>
        </aside>
      </section>
    `;
  }

  function renderPanel() {
    if (state.activePanel === "ejemplos") return renderExamplesPanel();
    if (state.activePanel === "pasos") return renderStepsPanel();
    if (state.activePanel === "historial") return renderHistoryPanel();
    if (state.activePanel === "interpretacion") return renderInterpretationPanel();
    if (state.activePanel === "configuracion") return renderConfigPanel();
    return state.labMode === "cartesian" ? renderCartesianOperations() : renderIntervalOperations();
  }

  function renderIntervalOperations() {
    return `
      <h2>Operaciones</h2>
      <div>
        <div class="mini-label">Expresión</div>
        <div class="expression-display">${escapeHtml(state.expression) || "Selecciona símbolos"}</div>
      </div>
      ${renderResultBox()}
      <div class="keypad">
        ${["A", "B", "C", "∪", "∩", "−", "△", "'", "(", ")"].map((key) => `<button type="button" class="key-btn" data-key="${key}">${key}</button>`).join("")}
        <button type="button" class="key-btn" data-key="back">⌫</button>
        <button type="button" class="key-btn" data-key="clear">Limpiar</button>
      </div>
      <div class="button-row">
        <button type="button" class="primary-btn" data-action="resolve-expression">Resolver</button>
        <button type="button" class="ghost-btn" data-key="clear">Borrar expresión</button>
      </div>
      <div class="set-grid">${["A", "B", "C"].map(renderSetEditor).join("")}</div>
    `;
  }

  function renderSetEditor(name) {
    const set = state.sets[name];
    const type = `${set.leftClosed ? "[" : "("}${set.rightClosed ? "]" : ")"}`;
    return `
      <div class="set-editor ${set.visible === false ? "is-muted" : ""}">
        <div class="set-title"><span><span class="color-dot" style="background:${set.color}"></span> Conjunto ${name}</span><span>${set.empty ? "∅" : type.replace("]", ", b]").replace(")", ", b)").replace("[", "[a").replace("(", "(a")}</span></div>
        <div class="field-grid">
          <label class="field"><span>Izquierdo</span><input type="number" min="-16" max="15" step="1" value="${set.start}" data-set="${name}" data-set-field="start" ${set.empty ? "disabled" : ""}></label>
          <label class="field"><span>Derecho</span><input type="number" min="-15" max="16" step="1" value="${set.end}" data-set="${name}" data-set-field="end" ${set.empty ? "disabled" : ""}></label>
          <label class="field"><span>Tipo</span><select data-set="${name}" data-set-field="type" ${set.empty ? "disabled" : ""}>
            ${["()", "[]", "(]", "[)"].map((option) => `<option value="${option}" ${option === type ? "selected" : ""}>${option.replace("(", "(a, b").replace("[", "[a, b").replace(")", ")").replace("]", "]")}</option>`).join("")}
          </select></label>
          <label class="field"><span>Color</span><input type="color" value="${set.color}" data-set="${name}" data-set-field="color"></label>
        </div>
        <div class="button-row">
          <button type="button" class="small-btn" data-action="toggle-set-visible" data-set-target="${name}">${set.visible === false ? "Mostrar en gráfica" : "Ocultar de gráfica"}</button>
          <button type="button" class="small-btn" data-action="toggle-set-empty" data-set-target="${name}">${set.empty ? "Restaurar conjunto" : "Vaciar conjunto"}</button>
        </div>
      </div>
    `;
  }

  function renderCartesianOperations() {
    const selected = state.cartesian.points.find((point) => point.id === state.cartesian.selectedId);
    return `
      <h2>Plano cartesiano</h2>
      <div class="field-grid">
        <label class="field"><span>X</span><input type="number" min="-16" max="16" step="1" value="${state.pointDraft.x}" data-draft-point="x"></label>
        <label class="field"><span>Y</span><input type="number" min="-16" max="16" step="1" value="${state.pointDraft.y}" data-draft-point="y"></label>
      </div>
      <div class="button-row">
        <button type="button" class="primary-btn" data-action="add-point">Agregar punto</button>
        <button type="button" class="ghost-btn" data-action="toggle-segments">${state.cartesian.connectSegments ? "Ocultar segmentos" : "Unir segmentos"}</button>
      </div>
      <div class="button-row">
        <button type="button" class="ghost-btn" data-action="measure-points">Distancia y punto medio</button>
        <button type="button" class="ghost-btn" data-action="symmetry-point" ${selected ? "" : "disabled"}>Simetrías</button>
      </div>
      <div class="point-list">
        ${state.cartesian.points.length === 0 ? `<div class="empty-state">Aún no hay puntos. Toca el plano o usa Agregar punto.</div>` : state.cartesian.points.map(renderPointRow).join("")}
      </div>
      <div class="button-row"><button type="button" class="danger-btn" data-action="clear-points">Vaciar puntos</button></div>
      ${state.cartesian.summary ? `<div class="result-box"><strong>Resultado</strong><span>${escapeHtml(state.cartesian.summary)}</span></div>` : ""}
    `;
  }

  function renderPointRow(point) {
    return `
      <div class="point-row">
        <strong><span class="color-dot" style="background:${point.color}"></span> P${point.id}</strong>
        <div class="field-grid">
          <label class="field"><span>X</span><input type="number" min="-16" max="16" step="1" value="${point.x}" data-point="${point.id}" data-point-field="x"></label>
          <label class="field"><span>Y</span><input type="number" min="-16" max="16" step="1" value="${point.y}" data-point="${point.id}" data-point-field="y"></label>
        </div>
        <div class="button-row">
          <button type="button" class="small-btn" data-action="select-point" data-point="${point.id}">${point.id === state.cartesian.selectedId ? "Seleccionado" : "Seleccionar"}</button>
          <button type="button" class="small-btn" data-action="delete-point" data-point="${point.id}">Eliminar</button>
        </div>
      </div>
    `;
  }

  function renderExamplesPanel() {
    if (state.labMode === "cartesian") {
      return `
        <h2>Ejemplos</h2>
        <p class="muted">Crea dos puntos propios y usa distancia, punto medio o simetrías para observar el procedimiento.</p>
        <div class="example-list">
          <button type="button" class="example-btn" data-action="set-draft" data-x="4" data-y="3">Preparar punto (4, 3)</button>
          <button type="button" class="example-btn" data-action="set-draft" data-x="-5" data-y="6">Preparar punto (−5, 6)</button>
          <button type="button" class="example-btn" data-action="set-draft" data-x="7" data-y="-2">Preparar punto (7, −2)</button>
        </div>
      `;
    }
    return `
      <h2>Ejemplos</h2>
      <div class="example-list">
        ${EXAMPLES.map((example) => `
          <button type="button" class="example-btn" data-example="${example.expression}">
            <strong>${escapeHtml(example.label)}</strong><br><span class="muted">${escapeHtml(example.expression)} · ${escapeHtml(example.note)}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderStepsPanel() {
    const steps = state.labMode === "cartesian" ? state.cartesian.steps : state.intervalResult?.steps || [];
    return `
      <h2>Paso a paso</h2>
      <div class="step-list">
        ${steps.length === 0 ? `<div class="empty-state">Resuelve una expresión o calcula una medida para ver el procedimiento.</div>` : steps.map((step, index) => `
          <div class="step-item"><strong>${index + 1}. ${escapeHtml(step.operation)}</strong><br><span>${escapeHtml(step.detail)}</span><br><span class="result-text">${escapeHtml(step.result)}</span></div>
        `).join("")}
      </div>
    `;
  }

  function renderHistoryPanel() {
    return `
      <h2>Historial</h2>
      <div class="history-list">
        ${state.history.length === 0 ? `<div class="empty-state">Las operaciones resueltas aparecerán aquí.</div>` : state.history.map((item) => `
          <div class="history-item">
            <strong>${escapeHtml(item.expression)}</strong><br>
            <span class="result-text">${escapeHtml(item.resultText)}</span><br>
            <span class="mini-label">${escapeHtml(item.time)}</span>
            <div class="button-row">
              <button type="button" class="small-btn" data-action="use-history" data-history="${item.id}">Ver</button>
              <button type="button" class="small-btn" data-action="delete-history" data-history="${item.id}">Eliminar</button>
            </div>
          </div>
        `).join("")}
      </div>
      ${state.history.length > 0 ? `<button type="button" class="danger-btn" data-action="clear-history">Limpiar historial</button>` : ""}
    `;
  }

  function renderInterpretationPanel() {
    const text = state.labMode === "cartesian"
      ? state.cartesian.interpretation || "Selecciona puntos y calcula una medida para interpretar el resultado."
      : state.intervalResult?.interpretation || "Construye una expresión para explicar su significado matemático.";
    return `
      <h2>Interpretación matemática</h2>
      <div class="result-box"><p>${escapeHtml(text)}</p></div>
    `;
  }

  function renderConfigPanel() {
    return `
      <h2>Configuración</h2>
      <label class="field"><span>Cuadrícula</span><select data-setting="showGrid"><option value="true" ${state.settings.showGrid ? "selected" : ""}>Mostrar</option><option value="false" ${!state.settings.showGrid ? "selected" : ""}>Ocultar</option></select></label>
      <label class="field"><span>Numeración</span><select data-setting="showNumbers"><option value="true" ${state.settings.showNumbers ? "selected" : ""}>Mostrar</option><option value="false" ${!state.settings.showNumbers ? "selected" : ""}>Ocultar</option></select></label>
      <label class="field"><span>Animaciones</span><select data-setting="animations"><option value="true" ${state.settings.animations ? "selected" : ""}>Activar</option><option value="false" ${!state.settings.animations ? "selected" : ""}>Desactivar</option></select></label>
      <label class="field"><span>Tamaño de visualización</span><input type="range" min="0.85" max="1.12" step="0.01" value="${state.settings.visualScale}" data-setting="visualScale"></label>
      <label class="field"><span>Modo</span><select data-setting="theme"><option value="light" ${state.settings.theme === "light" ? "selected" : ""}>Claro</option><option value="dark" ${state.settings.theme === "dark" ? "selected" : ""}>Oscuro</option></select></label>
    `;
  }

  function renderResultBox() {
    if (!state.intervalResult) return "";
    if (!state.intervalResult.ok) return `<div class="result-box error"><strong>Validación</strong><span>${escapeHtml(state.intervalResult.error)}</span></div>`;
    return `<div class="result-box"><strong>Resultado</strong><span class="result-text">${escapeHtml(setToText(state.intervalResult.result))}</span></div>`;
  }

  function renderLabQuickResult() {
    if (state.labMode !== "intervals" || !state.intervalResult) return "";
    if (!state.intervalResult.ok) {
      return `<div class="result-box lab-quick-result error"><strong>Revisar</strong><span>${escapeHtml(state.intervalResult.error)}</span></div>`;
    }
    return `<div class="result-box lab-quick-result"><strong>${escapeHtml(state.expression || "Resultado")}</strong><span class="result-text">${escapeHtml(setToText(state.intervalResult.result))}</span></div>`;
  }

  function renderEvaluation() {
    if (!state.quiz.started) {
      return `
        <section class="quiz-layout">
          <article class="quiz-card">
            <h2>Evaluación</h2>
            <p class="muted">Genera ejercicios automáticos sobre intervalos, operaciones e interpretación. Se usará la configuración actual de A, B y C.</p>
            <button type="button" class="primary-btn" data-action="start-quiz">Comenzar evaluación</button>
          </article>
          <aside class="quiz-card"><h2>Mejor puntaje</h2><div class="metric"><strong>${state.bestScore}</strong><span>puntos</span></div></aside>
        </section>
      `;
    }

    if (state.quiz.finished) return renderQuizResults();
    const question = state.quiz.questions[state.quiz.index];
    const selected = state.quiz.answers[state.quiz.index];
    const progress = ((state.quiz.index + 1) / state.quiz.questions.length) * 100;
    return `
      <section class="quiz-layout">
        <article class="quiz-card">
          <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
          <h2>Pregunta ${state.quiz.index + 1} de ${state.quiz.questions.length}</h2>
          <p>${escapeHtml(question.prompt)}</p>
          <div class="answer-grid">
            ${question.options.map((option) => `<button type="button" class="answer-btn ${selected === option ? "active" : ""}" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}
          </div>
          ${selected ? `<div class="button-row"><button type="button" class="primary-btn" data-action="next-question">${state.quiz.index === state.quiz.questions.length - 1 ? "Finalizar" : "Siguiente"}</button></div>` : ""}
        </article>
        <aside class="quiz-card"><h2>Consejo</h2><p class="muted">Antes de responder, imagina qué región quedaría coloreada en rojo en el laboratorio.</p></aside>
      </section>
    `;
  }

  function renderQuizResults() {
    const result = state.quiz.result;
    return `
      <section class="quiz-layout">
        <article class="quiz-card">
          <h2>Puntaje obtenido: ${result.score}</h2>
          <div class="hero-metrics">
            <div class="metric"><strong>${result.correct}</strong><span>Correctas</span></div>
            <div class="metric"><strong>${result.incorrect}</strong><span>Incorrectas</span></div>
            <div class="metric"><strong>${state.bestScore}</strong><span>Mejor</span></div>
          </div>
          <div class="step-list">
            ${result.details.map((item, index) => `
              <div class="step-item">
                <strong>${index + 1}. ${item.correct ? "Correcta" : "Revisar"}</strong><br>
                <span>${escapeHtml(item.prompt)}</span><br>
                <span>Tu respuesta: ${escapeHtml(item.selected || "Sin responder")}</span><br>
                <span class="result-text">Respuesta: ${escapeHtml(item.answer)}</span><br>
                <span>${escapeHtml(item.explanation)}</span>
              </div>
            `).join("")}
          </div>
          <button type="button" class="primary-btn" data-action="restart-quiz">Nueva evaluación</button>
        </article>
        <aside class="quiz-card"><h2>Autoevaluación</h2><p class="muted">Vuelve al laboratorio para modificar los intervalos y generar una prueba distinta.</p></aside>
      </section>
    `;
  }

  function renderAbout() {
    return `
      <section class="home-grid">
        <article class="cm-card hero-card">
          <h2>Acerca del proyecto</h2>
          <p>CoordiMath es un laboratorio matemático moderno para practicar el plano cartesiano, los intervalos y las operaciones entre conjuntos mediante representación gráfica y explicación paso a paso.</p>
          <p class="muted">Su diseño prioriza un plano siempre legible, validaciones claras, navegación fluida y una experiencia ordenada para estudiantes.</p>
          <button type="button" class="primary-btn" data-view="laboratorio">Abrir laboratorio</button>
        </article>
        <aside class="cm-card hero-card">
          <h2>Operaciones soportadas</h2>
          <p>Unión (∪), intersección (∩), diferencia (−), complemento (') y diferencia simétrica (△), incluyendo expresiones con paréntesis.</p>
        </aside>
      </section>
    `;
  }

  function renderStartOverlay() {
    return `
      <div class="start-overlay" ${state.overlayDismissed ? "hidden" : ""}>
        <button type="button" class="start-prompt" data-action="start-app" ${state.assetsReady ? "" : "disabled"}>
          <h2>CoordiMath</h2>
          <p>${state.assetsReady ? "Toca para empezar" : "Cargando laboratorio…"}</p>
          ${state.assetError ? `<p>${escapeHtml(state.assetError)}</p>` : ""}
        </button>
      </div>
    `;
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target) return;
    const { action, view, topic, labMode, panel, key, example, answer, history, point, x, y, setTarget } = target.dataset;

    if (action === "start-app") {
      if (!state.assetsReady) return;
      state.overlayDismissed = true;
      renderApp();
      return;
    }

    if (!state.overlayDismissed) return;

    if (view) {
      state.view = view;
      state.message = null;
      renderApp();
      return;
    }
    if (topic) {
      state.activeTopic = Number(topic);
      renderApp();
      return;
    }
    if (labMode) {
      state.labMode = labMode;
      state.activePanel = "operaciones";
      renderApp();
      return;
    }
    if (panel) {
      state.activePanel = panel;
      renderApp();
      return;
    }
    if (key) {
      applyExpressionKey(key);
      return;
    }
    if (example) {
      state.expression = example;
      state.activePanel = "operaciones";
      resolveCurrentExpression(false);
      toast("Ejemplo cargado en el editor.");
      return;
    }
    if (history) {
      handleHistoryAction(action, history);
      return;
    }
    if (answer) {
      state.quiz.answers[state.quiz.index] = answer;
      renderApp();
      return;
    }
    if (point && (action === "select-point" || action === "delete-point")) {
      handlePointAction(action, Number(point));
      return;
    }
    if (setTarget && (action === "toggle-set-visible" || action === "toggle-set-empty")) {
      if (action === "toggle-set-visible") {
        state.sets[setTarget].visible = state.sets[setTarget].visible === false;
      } else {
        state.sets[setTarget].empty = !state.sets[setTarget].empty;
      }
      state.intervalResult = state.expression ? resolveExpression(state.expression, state.sets) : null;
      if (state.intervalResult?.ok) state.intervalResult.animatedAt = performance.now();
      renderApp();
      return;
    }
    if (action === "set-draft") {
      state.pointDraft = { x: Number(x), y: Number(y) };
      state.activePanel = "operaciones";
      toast("Coordenadas preparadas. Pulsa Agregar punto para graficarlas.");
      return;
    }

    handleAction(action);
  }

  function handleInput(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return;
    if (!state.overlayDismissed && !target.closest(".start-overlay")) return;

    const { set, setField, setting, draftPoint, point, pointField } = target.dataset;
    if (set && setField) {
      const liveEdit = event.type === "input" && (setField === "start" || setField === "end");
      updateSet(set, setField, target.value, !liveEdit);
      if (liveEdit) drawCanvasSoon();
      return;
    }
    if (setting) {
      updateSetting(setting, target.value);
      return;
    }
    if (draftPoint) {
      state.pointDraft[draftPoint] = clampCoordinate(target.value);
      drawCanvasSoon();
      return;
    }
    if (point && pointField) {
      const item = state.cartesian.points.find((entry) => entry.id === Number(point));
      if (item) {
        item[pointField] = clampCoordinate(target.value);
        state.cartesian.ghosts = [];
        drawCanvasSoon();
      }
    }
  }

  function handleAction(action) {
    if (action === "resolve-expression") {
      resolveCurrentExpression(true);
    } else if (action === "exit") {
      toast("Puedes cerrar la pestaña o volver a la pantalla de inicio cuando quieras.");
    } else if (action === "add-point") {
      addPoint(state.pointDraft.x, state.pointDraft.y);
    } else if (action === "toggle-segments") {
      state.cartesian.connectSegments = !state.cartesian.connectSegments;
      renderApp();
    } else if (action === "measure-points") {
      measureSelectedPoints();
    } else if (action === "symmetry-point") {
      showSymmetries();
    } else if (action === "clear-points") {
      state.cartesian.points = [];
      state.cartesian.ghosts = [];
      state.cartesian.selectedId = null;
      state.cartesian.summary = "Se vació el conjunto de puntos del plano.";
      state.cartesian.steps = [];
      renderApp();
    } else if (action === "clear-history") {
      state.history = [];
      scheduleSave();
      renderApp();
    } else if (action === "start-quiz" || action === "restart-quiz") {
      state.quiz = { started: true, finished: false, questions: createQuiz(state.sets), answers: {}, index: 0, result: null };
      renderApp();
    } else if (action === "next-question") {
      nextQuestion();
    }
  }

  function applyExpressionKey(key) {
    if (key === "clear") {
      state.expression = "";
      state.intervalResult = null;
      renderApp();
      return;
    }
    if (key === "back") {
      state.expression = state.expression.slice(0, -1);
      state.intervalResult = null;
      renderApp();
      return;
    }
    if (!tokenCanAppend(state.expression, key)) {
      state.intervalResult = { ok: false, error: "Ese símbolo no puede colocarse en esa posición." };
      renderApp();
      return;
    }
    state.expression += key;
    state.intervalResult = null;
    renderApp();
  }

  function resolveCurrentExpression(addToHistory) {
    const resolved = resolveExpression(state.expression, state.sets);
    if (!resolved.ok) {
      state.intervalResult = resolved;
      state.activePanel = "operaciones";
      renderApp();
      return;
    }
    state.intervalResult = { ...resolved, ok: true, animatedAt: performance.now() };
    state.activePanel = addToHistory ? "pasos" : state.activePanel;

    if (addToHistory) {
      state.history.unshift({
        id: String(Date.now()),
        expression: state.expression,
        resultText: setToText(resolved.result),
        time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
        sets: cloneSets(state.sets),
      });
      state.history = state.history.slice(0, 12);
      scheduleSave();
    }
    renderApp();
  }

  function updateSet(name, field, value, shouldRender = true) {
    const current = state.sets[name];
    if (field === "type") {
      current.leftClosed = value.startsWith("[");
      current.rightClosed = value.endsWith("]");
    } else if (field === "color") {
      current.color = value;
    } else {
      current[field] = clampCoordinate(value);
    }
    state.intervalResult = state.expression ? resolveExpression(state.expression, state.sets) : null;
    if (state.intervalResult?.ok) state.intervalResult.animatedAt = performance.now();
    if (shouldRender) renderApp();
  }

  function updateSetting(setting, value) {
    if (["showGrid", "showNumbers", "animations"].includes(setting)) {
      state.settings[setting] = value === "true";
    } else if (setting === "visualScale") {
      state.settings.visualScale = Number(value);
    } else if (setting === "theme") {
      state.settings.theme = value;
    }
    scheduleSave();
    renderApp();
  }

  function handleHistoryAction(action, id) {
    const item = state.history.find((entry) => entry.id === id);
    if (!item) return;
    if (action === "delete-history") {
      state.history = state.history.filter((entry) => entry.id !== id);
      scheduleSave();
      renderApp();
      return;
    }
    if (action === "use-history") {
      state.sets = cloneSets(item.sets);
      state.expression = item.expression;
      state.labMode = "intervals";
      state.activePanel = "pasos";
      resolveCurrentExpression(false);
    }
  }

  function handlePointAction(action, id) {
    if (action === "select-point") {
      state.cartesian.selectedId = id;
    } else if (action === "delete-point") {
      state.cartesian.points = state.cartesian.points.filter((point) => point.id !== id);
      if (state.cartesian.selectedId === id) state.cartesian.selectedId = null;
      state.cartesian.ghosts = [];
    }
    renderApp();
  }

  function addPoint(x, y) {
    const point = createPoint(state.cartesian.nextId, x, y);
    state.cartesian.nextId += 1;
    state.cartesian.points.push(point);
    state.cartesian.selectedId = point.id;
    state.cartesian.ghosts = [];
    state.cartesian.summary = `Se graficó P${point.id} en (${point.x}, ${point.y}).`;
    state.cartesian.interpretation = "Cada punto se ubica leyendo primero la coordenada horizontal y luego la vertical.";
    renderApp();
  }

  function measureSelectedPoints() {
    if (state.cartesian.points.length < 2) {
      state.cartesian.summary = "Necesitas al menos dos puntos para calcular distancia y punto medio.";
      renderApp();
      return;
    }
    const [a, b] = state.cartesian.points.slice(0, 2);
    const distance = distanceBetween(a, b);
    const midpoint = midpointBetween(a, b);
    state.cartesian.summary = `Entre P${a.id} y P${b.id}: distancia = ${formatNumber(distance)}, punto medio = (${formatNumber(midpoint.x)}, ${formatNumber(midpoint.y)}).`;
    state.cartesian.steps = [
      { operation: "Diferencias", detail: `Δx = ${b.x} − ${a.x}; Δy = ${b.y} − ${a.y}`, result: `Δx = ${b.x - a.x}, Δy = ${b.y - a.y}` },
      { operation: "Distancia", detail: "d = √((x₂−x₁)² + (y₂−y₁)²)", result: `d = ${formatNumber(distance)}` },
      { operation: "Punto medio", detail: "M = ((x₁+x₂)/2, (y₁+y₂)/2)", result: `M = (${formatNumber(midpoint.x)}, ${formatNumber(midpoint.y)})` },
    ];
    state.cartesian.interpretation = "La distancia mide la longitud del segmento; el punto medio divide ese segmento en dos partes iguales.";
    state.activePanel = "pasos";
    renderApp();
  }

  function showSymmetries() {
    const selected = state.cartesian.points.find((point) => point.id === state.cartesian.selectedId);
    if (!selected) return;
    state.cartesian.ghosts = symmetryPoints(selected);
    state.cartesian.summary = `Simetrías de P${selected.id}: eje X (${selected.x}, ${-selected.y}), eje Y (${-selected.x}, ${selected.y}) y origen (${-selected.x}, ${-selected.y}).`;
    state.cartesian.steps = [
      { operation: "Respecto al eje X", detail: "Se conserva x y cambia el signo de y.", result: `(${selected.x}, ${-selected.y})` },
      { operation: "Respecto al eje Y", detail: "Cambia el signo de x y se conserva y.", result: `(${-selected.x}, ${selected.y})` },
      { operation: "Respecto al origen", detail: "Cambian los signos de ambas coordenadas.", result: `(${-selected.x}, ${-selected.y})` },
    ];
    state.cartesian.interpretation = "La simetría refleja el punto como si el eje elegido fuera un espejo.";
    state.activePanel = "pasos";
    renderApp();
  }

  function nextQuestion() {
    if (state.quiz.index < state.quiz.questions.length - 1) {
      state.quiz.index += 1;
      renderApp();
      return;
    }
    state.quiz.result = gradeQuiz(state.quiz.answers, state.quiz.questions);
    state.quiz.finished = true;
    state.bestScore = Math.max(state.bestScore, state.quiz.result.score);
    scheduleSave();
    submitScore(state.quiz.result.score);
    renderApp();
  }

  async function submitScore(score) {
    if (!Number.isFinite(score)) return;
    try {
      await sdk.leaderboard.submit(score);
    } catch {
      // Leaderboard availability does not affect the educational result display.
    }
  }

  function attachCanvas() {
    const canvas = root?.querySelector("#coord-plane");
    if (!canvas) return;
    const draw = () => drawCoordinateScene(canvas, state);
    draw();
    if (state.labMode === "cartesian") attachPointDragging(canvas, draw);
    if (state.needsAnimation) {
      const animate = () => {
        state.needsAnimation = false;
        drawCoordinateScene(canvas, state);
        if (state.needsAnimation) animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function attachPointDragging(canvas, draw) {
    let draggingId = null;
    canvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const near = findPointNear(state, event.clientX, event.clientY, canvas);
      if (near) {
        draggingId = near.id;
        state.cartesian.selectedId = near.id;
      } else {
        const coord = screenToCoordinate(state, event.clientX, event.clientY, canvas);
        addPoint(coord.x, coord.y);
        return;
      }
      canvas.setPointerCapture(event.pointerId);
      draw();
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!draggingId) return;
      const point = state.cartesian.points.find((entry) => entry.id === draggingId);
      if (!point) return;
      const coord = screenToCoordinate(state, event.clientX, event.clientY, canvas);
      point.x = coord.x;
      point.y = coord.y;
      state.cartesian.ghosts = [];
      state.cartesian.summary = `P${point.id} se movió a (${point.x}, ${point.y}).`;
      draw();
    });
    canvas.addEventListener("pointerup", (event) => {
      if (!draggingId) return;
      draggingId = null;
      canvas.releasePointerCapture(event.pointerId);
      renderApp();
    });
  }

  function drawCanvasSoon() {
    const canvas = root?.querySelector("#coord-plane");
    if (!canvas) return;
    requestAnimationFrame(() => drawCoordinateScene(canvas, state));
  }

  function toast(text) {
    state.message = { text, type: "info" };
    renderApp();
    window.setTimeout(() => {
      if (state.message?.text === text) {
        state.message = null;
        renderApp();
      }
    }, 2100);
  }
}

function createInitialState() {
  const sets = {
    A: { start: -8, end: 5, leftClosed: true, rightClosed: false, color: "#2f80ed", empty: false, visible: true },
    B: { start: -3, end: 11, leftClosed: true, rightClosed: true, color: "#27ae60", empty: false, visible: true },
    C: { start: 2, end: 14, leftClosed: false, rightClosed: true, color: "#8e44ad", empty: false, visible: true },
  };
  const initial = resolveExpression("(A∪B)−C", sets);
  return {
    view: "inicio",
    overlayDismissed: false,
    assetsReady: false,
    assetError: "",
    images: { markUrl: "", backdropUrl: "" },
    activeTopic: 0,
    labMode: "intervals",
    activePanel: "operaciones",
    sets,
    expression: "(A∪B)−C",
    intervalResult: initial.ok ? { ...initial, ok: true, animatedAt: performance.now() } : null,
    history: [],
    settings: { showGrid: true, showNumbers: true, animations: true, visualScale: 1, theme: "light" },
    pointDraft: { x: 4, y: 3 },
    cartesian: {
      points: [],
      nextId: 1,
      selectedId: null,
      connectSegments: true,
      ghosts: [],
      summary: "",
      interpretation: "",
      steps: [],
      transform: null,
    },
    quiz: { started: false, finished: false, questions: [], answers: {}, index: 0, result: null },
    bestScore: 0,
    needsAnimation: false,
    message: null,
  };
}

function conceptBox(title, content) {
  return `<div class="concept-box"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(content)}</p></div>`;
}

function renderTopicGraphic(index) {
  const variants = [
    `<span class="g-point p1"></span><span class="g-point p2"></span><span class="g-line segment"></span><span class="g-label q1">I</span><span class="g-label q3">III</span>`,
    `<span class="g-point p-pair"></span><span class="g-guide gx"></span><span class="g-guide gy"></span><span class="g-tag pair">(4, 3)</span>`,
    `<span class="g-axis-label x">Eje X</span><span class="g-axis-label y">Eje Y</span><span class="g-origin">0</span>`,
    `<span class="g-quadrant q-one">I<br>(+,+)</span><span class="g-quadrant q-two">II<br>(−,+)</span><span class="g-quadrant q-three">III<br>(−,−)</span><span class="g-quadrant q-four">IV<br>(+,−)</span>`,
    `<span class="g-point d1"></span><span class="g-point d2"></span><span class="g-line distance"></span><span class="g-guide dx"></span><span class="g-guide dy"></span><span class="g-tag dist">d = 5</span>`,
    `<span class="g-point m1"></span><span class="g-point m2"></span><span class="g-point mid"></span><span class="g-line midpoint"></span><span class="g-tag midtag">M</span>`,
    `<span class="g-point sym1"></span><span class="g-point sym2"></span><span class="g-line mirror"></span><span class="g-tag symtag">reflejo</span>`,
    `<span class="number-line"></span><span class="interval-bar learn"></span><span class="end open left"></span><span class="end closed right"></span><span class="g-tag interval">(−2, 6]</span>`,
    `<span class="number-line top"></span><span class="interval-bar a"></span><span class="interval-bar b"></span><span class="interval-bar res"></span><span class="g-tag op">A ∩ B</span>`,
  ];
  return `<div class="learn-graph topic-${index}" aria-label="Representación gráfica del tema">${variants[index] || variants[0]}</div>`;
}

function cloneSets(sets) {
  return Object.fromEntries(Object.entries(sets).map(([name, value]) => [name, { ...value }]));
}

function loadOptionalImage(url) {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
    image.src = url;
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}