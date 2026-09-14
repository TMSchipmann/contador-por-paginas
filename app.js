(function () {
  "use strict";

  const STORAGE_KEY = "contador-por-paginas-v1";
  const $ = (id) => document.getElementById(id);
  const el = {
    setup: $("setup-screen"), counter: $("counter-screen"), form: $("setup-form"),
    pages: $("pages-input"), initial: $("initial-input"), step: $("step-input"), goal: $("goal-input"),
    showPage: $("show-page-input"), confirmReset: $("confirm-reset-input"), customColor: $("custom-color-input"),
    customColorLabel: document.querySelector(".custom-color"), formError: $("form-error"),
    continueCard: $("continue-card"), continueButton: $("continue-button"), savedSummary: $("saved-summary"),
    countCircle: $("count-circle"), currentValue: $("current-value"), circleCaption: $("circle-caption"),
    progressText: $("progress-text"), progressDetail: $("progress-detail"), pageLabel: $("page-label"),
    pageTopNumber: $("page-top-number"), primaryButton: $("primary-button"), primaryStepLabel: $("primary-step-label"),
    secondaryButton: $("secondary-button"), undoButton: $("undo-button"), resetButton: $("reset-button"),
    previousButton: $("previous-button"), nextButton: $("next-button"), pageNavigationLabel: $("page-navigation-label"),
    newSessionButton: $("new-session-button"), jumpButton: $("jump-button"), jumpDialog: $("jump-dialog"),
    jumpForm: $("jump-form"), jumpInput: $("jump-input"), jumpError: $("jump-error"), cancelJump: $("cancel-jump"),
    keyboardHint: $("keyboard-hint"), saveStatus: $("save-status")
  };

  let session = loadSession();
  let selectedColor = "#2995ed";
  const formatter = new Intl.NumberFormat("es-CL");

  function integer(text, allowNegative) {
    const value = String(text).trim();
    if (!(allowNegative ? /^-?\d+$/ : /^\d+$/).test(value)) return null;
    try { return BigInt(value); } catch { return null; }
  }

  function format(value) { return formatter.format(BigInt(value)); }
  function plural(value, singular, pluralForm) { return value === 1n ? singular : pluralForm; }
  function hexColor(value) { return /^#[0-9a-fA-F]{6}$/.test(value); }

  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== 1 || !data.config || !data.pages || typeof data.pages !== "object") return null;
      const c = data.config;
      if (integer(c.pages, false) === null || BigInt(c.pages) < 1n ||
          integer(c.initial, true) === null || integer(c.step, false) === null || BigInt(c.step) < 1n ||
          integer(c.goal, false) === null || BigInt(c.goal) < 1n ||
          !["up", "down"].includes(c.direction) || !hexColor(c.color) ||
          typeof c.showPage !== "boolean" || typeof c.confirmReset !== "boolean" ||
          integer(data.currentPage, false) === null || BigInt(data.currentPage) < 1n ||
          BigInt(data.currentPage) > BigInt(c.pages)) return null;
      return data;
    } catch { return null; }
  }

  function saveSession() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      el.saveStatus.textContent = "";
    } catch {
      el.saveStatus.textContent = "No se pudo guardar. Libera espacio en el navegador para conservar los cambios.";
    }
  }

  function setColor(color) {
    selectedColor = color;
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--accent-soft", `color-mix(in srgb, ${color} 12%, white)`);
  }

  function updateContinueCard() {
    el.continueCard.hidden = !session;
    if (session) {
      const total = BigInt(session.config.pages);
      el.savedSummary.textContent = `${format(total)} ${plural(total, "página", "páginas")} · última visita: página ${format(session.currentPage)}`;
    }
  }

  function showSetup() {
    el.counter.hidden = true;
    el.keyboardHint.hidden = true;
    el.setup.hidden = false;
    setColor(document.querySelector('input[name="color-preset"]:checked')?.value || el.customColor.value);
    updateContinueCard();
    el.formError.hidden = true;
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  function showCounter() {
    if (!session) return;
    setColor(session.config.color);
    el.setup.hidden = true;
    el.counter.hidden = false;
    el.keyboardHint.hidden = false;
    render();
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  function directionSign() { return session.config.direction === "up" ? 1n : -1n; }
  function seedFor(page) {
    const c = session.config;
    return BigInt(c.initial) + directionSign() * (BigInt(page) - 1n) * BigInt(c.step);
  }
  function pageState() {
    const saved = session.pages[session.currentPage];
    return saved && integer(saved.value, true) !== null
      ? { value: BigInt(saved.value), lastValue: integer(saved.lastValue, true) }
      : { value: seedFor(session.currentPage), lastValue: null };
  }

  function writePage(value, lastValue) {
    const key = session.currentPage;
    if (value === seedFor(key) && lastValue === null) delete session.pages[key];
    else session.pages[key] = { value: value.toString(), lastValue: lastValue === null ? null : lastValue.toString() };
    saveSession();
    render();
  }

  function progress(value) {
    const c = session.config;
    const start = seedFor(session.currentPage);
    const step = BigInt(c.step);
    const goal = BigInt(c.goal);
    const distance = (value - start) * directionSign();
    const completed = distance <= 0n ? 0n : distance / step;
    const remaining = completed >= goal ? 0n : goal - completed;
    const percentage = completed >= goal ? 100 : Number((completed * 10000n) / goal) / 100;
    return { completed, goal, remaining, percentage };
  }

  function render() {
    if (!session) return;
    const c = session.config;
    const state = pageState();
    const p = progress(state.value);
    const currentText = format(state.value);
    const pageNumber = format(session.currentPage);
    const totalPages = format(c.pages);
    el.currentValue.textContent = currentText;
    el.currentValue.title = currentText;
    el.currentValue.classList.toggle("long", currentText.length > 7);
    el.currentValue.classList.toggle("very-long", currentText.length > 13);
    el.countCircle.style.setProperty("--progress", `${p.percentage}%`);
    el.countCircle.setAttribute("aria-label", `Valor ${currentText}. Avanzar ${format(c.step)}.`);
    el.circleCaption.textContent = c.direction === "up" ? "TOCA PARA AUMENTAR" : "TOCA PARA RETROCEDER";
    el.progressText.textContent = p.remaining === 0n ? "Meta alcanzada" : `${format(p.remaining)} ${plural(p.remaining, "toque restante", "toques restantes")}`;
    el.progressDetail.textContent = `${format(p.completed)} / ${format(p.goal)} toques`;
    el.pageLabel.firstChild.textContent = c.showPage ? "PÁGINA " : "CONTADOR";
    el.pageTopNumber.textContent = c.showPage ? `${pageNumber} DE ${totalPages}` : "";
    el.pageNavigationLabel.textContent = c.showPage ? `Página ${pageNumber} de ${totalPages}` : "Navegación de páginas";
    const primarySign = c.direction === "up" ? "＋" : "−";
    const secondarySign = c.direction === "up" ? "−" : "＋";
    el.primaryButton.firstChild.textContent = `${primarySign} `;
    el.primaryStepLabel.textContent = format(c.step);
    el.primaryButton.setAttribute("aria-label", `${c.direction === "up" ? "Aumentar" : "Disminuir"} ${format(c.step)}`);
    el.secondaryButton.textContent = secondarySign;
    el.secondaryButton.setAttribute("aria-label", `${c.direction === "up" ? "Disminuir" : "Aumentar"} ${format(c.step)}`);
    el.undoButton.disabled = state.lastValue === null;
    el.previousButton.disabled = BigInt(session.currentPage) === 1n;
    el.nextButton.disabled = BigInt(session.currentPage) === BigInt(c.pages);
  }

  function count(inMainDirection) {
    if (!session) return;
    const state = pageState();
    const delta = directionSign() * BigInt(session.config.step) * (inMainDirection ? 1n : -1n);
    writePage(state.value + delta, state.value);
  }

  function undo() {
    if (!session) return;
    const state = pageState();
    if (state.lastValue !== null) writePage(state.lastValue, null);
  }

  function reset() {
    if (!session) return;
    const state = pageState();
    const seed = seedFor(session.currentPage);
    if (state.value === seed) return;
    if (session.config.confirmReset && !window.confirm("¿Reiniciar esta página a su valor inicial?")) return;
    writePage(seed, state.value);
  }

  function navigate(delta) {
    if (!session) return;
    const next = BigInt(session.currentPage) + delta;
    if (next < 1n || next > BigInt(session.config.pages)) return;
    session.currentPage = next.toString();
    saveSession();
    render();
  }

  function setupFromForm(event) {
    event.preventDefault();
    const pages = integer(el.pages.value, false);
    const initial = integer(el.initial.value, true);
    const step = integer(el.step.value, false);
    const goal = integer(el.goal.value, false);
    if (pages === null || pages < 1n || initial === null || step === null || step < 1n || goal === null || goal < 1n) {
      el.formError.textContent = "Revisa los números: páginas, paso y meta deben ser mayores que cero; el valor inicial puede ser negativo.";
      el.formError.hidden = false;
      return;
    }
    if (session && !window.confirm("¿Iniciar una nueva sesión? La sesión guardada se reemplazará.")) return;
    el.formError.hidden = true;
    session = {
      version: 1,
      config: {
        pages: pages.toString(), initial: initial.toString(), step: step.toString(), goal: goal.toString(),
        direction: el.form.querySelector('input[name="direction"]:checked').value,
        color: selectedColor, showPage: el.showPage.checked, confirmReset: el.confirmReset.checked
      },
      currentPage: "1", pages: {}
    };
    saveSession();
    showCounter();
  }

  document.querySelectorAll('input[name="color-preset"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        el.customColorLabel.classList.remove("custom-selected");
        setColor(input.value);
      }
    });
  });
  el.customColor.addEventListener("input", () => {
    document.querySelectorAll('input[name="color-preset"]').forEach((input) => { input.checked = false; });
    el.customColorLabel.classList.add("custom-selected");
    el.customColorLabel.style.setProperty("--selected-color", el.customColor.value);
    setColor(el.customColor.value);
  });

  el.form.addEventListener("submit", setupFromForm);
  el.continueButton.addEventListener("click", showCounter);
  el.newSessionButton.addEventListener("click", showSetup);
  el.countCircle.addEventListener("click", () => count(true));
  el.primaryButton.addEventListener("click", () => count(true));
  el.secondaryButton.addEventListener("click", () => count(false));
  el.undoButton.addEventListener("click", undo);
  el.resetButton.addEventListener("click", reset);
  el.previousButton.addEventListener("click", () => navigate(-1n));
  el.nextButton.addEventListener("click", () => navigate(1n));
  el.jumpButton.addEventListener("click", () => {
    el.jumpInput.value = session.currentPage;
    el.jumpError.hidden = true;
    el.jumpDialog.showModal();
    el.jumpInput.focus();
    el.jumpInput.select();
  });
  el.cancelJump.addEventListener("click", () => el.jumpDialog.close());
  el.jumpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const target = integer(el.jumpInput.value, false);
    if (target === null || target < 1n || target > BigInt(session.config.pages)) {
      el.jumpError.textContent = `Escribe un número entre 1 y ${format(session.config.pages)}.`;
      el.jumpError.hidden = false;
      return;
    }
    session.currentPage = target.toString();
    saveSession();
    render();
    el.jumpDialog.close();
  });

  document.addEventListener("keydown", (event) => {
    if (!session || el.counter.hidden || el.jumpDialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
    const tag = event.target.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || event.target.isContentEditable) return;
    if (event.key === "+" || event.key === "=" || (event.code === "Space" && tag !== "BUTTON")) {
      event.preventDefault(); count(true);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault(); count(false);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault(); navigate(-1n);
    } else if (event.key === "ArrowRight") {
      event.preventDefault(); navigate(1n);
    } else if (event.key.toLowerCase() === "z") {
      event.preventDefault(); undo();
    }
  });

  updateContinueCard();
  showSetup();
})();
