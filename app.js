const commonQuestions = [
  "출근길용 / 자기 전용 / 여행용 중 하나 고르기",
  "이 책 분위기에 어울리는 계절은?",
  "친구가 이 책 읽는다고 하면 해주고 싶은 한마디",
  "읽고 나서 기분이 좋아지는 책인지, 생각 많아지는 책인지",
  "하루 만에 몰아읽기 vs 천천히 읽기",
  "이 책 읽기 가장 좋은 장소는?",
  "기대 이상이었다 vs 예상했던 느낌이었다",
  "후속편이나 작가의 다른 책도 읽어볼 의향이 있는지",
];

const questionStorageKey = "wandok-custom-questions-v1";
const themeStorageKey = "wandok-custom-themes-v1";
const baseThemeLabels = {
  common: "공통",
  fiction: "문학 / 소설",
  nonfiction: "비문학",
  essay: "에세이",
};

const genreQuestions = {
  fiction: {
    label: "문학 / 소설",
    description: "인물, 장면, 결말을 중심으로",
    questions: [
      "등장인물 중 같이 술 마시고 싶은 사람",
      "이 책을 드라마화한다면 주인공 캐스팅은?",
      "내가 이 책 속 세계관에서 하루 살아야 한다면 가능할까?",
      "주인공이 내 동료라면 친해질 수 있을 것 같은지",
      "가장 현실적이라고 느낀 장면 하나",
      "이 세계관 여행 상품이 있으면 신청 가능할까?",
      "결말이 마음에 들었는지",
      "내가 주인공이었다면 같은 선택을 했을 것 같은지",
    ],
  },
  nonfiction: {
    label: "비문학",
    description: "지식, 관점, 실천을 중심으로",
    questions: [
      "작가랑 5분 대화 가능하면 물어보고 싶은 것",
      "가장 공감했던 문장이나 생각 하나",
      "읽고 바로 해보고 싶어진 행동이나 습관이 있는지",
      "맞는 말인데 실천은 어렵다고 싶었던 부분",
      "나랑 가장 생각이 달랐던 부분",
      "이 책이 위로형인지 자극형인지",
      "한 번쯤 메모해두고 싶은 내용이 있었는지",
      "이 책 읽고 누군가 떠올랐는지",
    ],
  },
  essay: {
    label: "에세이",
    description: "감정, 문장, 일상을 중심으로",
    questions: [
      "작가랑 5분 대화 가능하면 물어보고 싶은 것",
      "가장 공감했던 문장이나 생각 하나",
      "읽고 바로 해보고 싶어진 행동이나 습관이 있는지",
      "맞는 말인데 실천은 어렵다고 싶었던 부분",
      "나랑 가장 생각이 달랐던 부분",
      "이 책이 위로형인지 자극형인지",
      "한 번쯤 메모해두고 싶은 내용이 있었는지",
      "이 책 읽고 누군가 떠올랐는지",
    ],
  },
};

const genreGrid = document.querySelector("#genreGrid");
const selectedGenre = document.querySelector("#selectedGenre");
const questionPool = document.querySelector("#questionPool");
const questionText = document.querySelector("#questionText");
const questionPanel = document.querySelector(".question-panel");
const rerollButton = document.querySelector("#rerollButton");
const copyButton = document.querySelector("#copyButton");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const historyList = document.querySelector("#historyList");
const themeTabs = document.querySelector("#themeTabs");
const libraryCount = document.querySelector("#libraryCount");
const questionList = document.querySelector("#questionList");
const addThemeForm = document.querySelector("#addThemeForm");
const newThemeInput = document.querySelector("#newThemeInput");
const themeMessage = document.querySelector("#themeMessage");
const addQuestionForm = document.querySelector("#addQuestionForm");
const newQuestionInput = document.querySelector("#newQuestionInput");
const formMessage = document.querySelector("#formMessage");
const deleteThemeButton = document.querySelector("#deleteThemeButton");

let activeGenreKey = "";
let currentQuestion = "";
let previousQuestion = "";
let history = [];
let isDrawing = false;
let activeLibraryTheme = "common";
let customThemes = loadCustomThemes();
let customQuestions = loadCustomQuestions();
const drawDelay = 1000;

function getQuestionFallback() {
  return Object.fromEntries(getThemeKeys().map((key) => [key, []]));
}

function getThemeKeys() {
  return ["common", ...Object.keys(genreQuestions), ...Object.keys(customThemes)];
}

function getGenreEntries() {
  return [
    ...Object.entries(genreQuestions),
    ...Object.entries(customThemes).map(([key, theme]) => [
      key,
      {
        label: theme.label,
        description: theme.description,
        questions: [],
      },
    ]),
  ];
}

function getThemeLabel(themeKey) {
  if (baseThemeLabels[themeKey]) return baseThemeLabels[themeKey];
  return customThemes[themeKey]?.label || "테마";
}

function isCustomTheme(themeKey) {
  return Boolean(customThemes[themeKey]);
}

function loadCustomQuestions() {
  const fallback = getQuestionFallback();

  try {
    const saved = JSON.parse(localStorage.getItem(questionStorageKey));
    return Object.fromEntries(
      Object.entries({ ...fallback, ...saved }).map(([key, value]) => [key, Array.isArray(value) ? value : []]),
    );
  } catch {
    return fallback;
  }
}

function saveCustomQuestions() {
  try {
    localStorage.setItem(questionStorageKey, JSON.stringify(customQuestions));
    return true;
  } catch {
    return false;
  }
}

function loadCustomThemes() {
  try {
    const saved = JSON.parse(localStorage.getItem(themeStorageKey));
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};

    return Object.fromEntries(
      Object.entries(saved)
        .filter(([, theme]) => theme && typeof theme.label === "string")
        .map(([key, theme]) => [
          key,
          {
            label: theme.label,
            description: theme.description || "직접 추가한 테마",
          },
        ]),
    );
  } catch {
    return {};
  }
}

function saveCustomThemes() {
  try {
    localStorage.setItem(themeStorageKey, JSON.stringify(customThemes));
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getBaseQuestions(themeKey) {
  if (themeKey === "common") return commonQuestions;
  return genreQuestions[themeKey]?.questions || [];
}

function getThemeQuestions(themeKey) {
  return [...getBaseQuestions(themeKey), ...(customQuestions[themeKey] || [])];
}

function drawGenres() {
  genreGrid.innerHTML = getGenreEntries()
    .map(
      ([key, genre]) => `
        <button class="genre-button" type="button" data-genre="${key}">
          <span class="genre-title">${genre.label}</span>
          <span class="genre-desc">${genre.description}</span>
        </button>
      `,
    )
    .join("");
}

function getPool(genreKey) {
  return [...getThemeQuestions("common"), ...getThemeQuestions(genreKey)];
}

function pickQuestion(genreKey) {
  const pool = getPool(genreKey);
  const candidates = pool.filter((question) => question !== previousQuestion);
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function updateActiveButton() {
  document.querySelectorAll(".genre-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.genre === activeGenreKey);
  });
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<li class="empty-history">아직 뽑은 질문이 없습니다.</li>';
    return;
  }

  historyList.innerHTML = history
    .map((item) => `<li><strong>${escapeHtml(item.genre)}</strong> · ${escapeHtml(item.question)}</li>`)
    .join("");
}

function drawThemeTabs() {
  themeTabs.innerHTML = getThemeKeys()
    .map(
      (key) => `
        <button class="theme-tab" type="button" data-theme="${key}">
          ${escapeHtml(getThemeLabel(key))}
        </button>
      `,
    )
    .join("");
  updateThemeTabs();
}

function updateThemeTabs() {
  document.querySelectorAll(".theme-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === activeLibraryTheme);
  });
}

function renderQuestionList() {
  const baseQuestions = getBaseQuestions(activeLibraryTheme);
  const addedQuestions = customQuestions[activeLibraryTheme] || [];
  libraryCount.textContent = `${baseQuestions.length + addedQuestions.length}개`;
  deleteThemeButton.hidden = !isCustomTheme(activeLibraryTheme);

  const baseItems = baseQuestions.map(
    (question) => `
      <li>
        <span>${escapeHtml(question)}</span>
        <span class="base-badge">기본</span>
      </li>
    `,
  );
  const customItems = addedQuestions.map(
    (question, index) => `
      <li>
        <span>${escapeHtml(question)}</span>
        <button class="delete-question-button" type="button" data-index="${index}">삭제</button>
      </li>
    `,
  );

  questionList.innerHTML = [...baseItems, ...customItems].join("");
}

function setDrawingState(genreKey) {
  const genre = Object.fromEntries(getGenreEntries())[genreKey];
  activeGenreKey = genreKey;
  isDrawing = true;

  questionPanel.classList.remove("is-revealed");
  selectedGenre.textContent = genre.label;
  questionPool.textContent = "질문을 고르는 중";
  questionText.innerHTML = '<span class="loading-text">잠시 후 공개됩니다</span>';
  questionPanel.classList.add("is-loading");
  rerollButton.disabled = true;
  copyButton.disabled = true;
  updateActiveButton();
}

function revealQuestion(genreKey) {
  const genre = Object.fromEntries(getGenreEntries())[genreKey];
  previousQuestion = currentQuestion;
  currentQuestion = pickQuestion(genreKey);

  questionPool.textContent = `총 ${getPool(genreKey).length}개 질문 중 선택`;
  questionText.textContent = currentQuestion;
  rerollButton.disabled = false;
  copyButton.disabled = false;
  questionPanel.classList.remove("is-loading");
  questionPanel.classList.remove("is-revealed");
  void questionPanel.offsetWidth;
  questionPanel.classList.add("is-revealed");
  isDrawing = false;

  history = [{ genre: genre.label, question: currentQuestion }, ...history].slice(0, 8);
  renderHistory();
}

function drawQuestion(genreKey) {
  if (isDrawing) return;
  setDrawingState(genreKey);
  window.setTimeout(() => revealQuestion(genreKey), drawDelay);
}

genreGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".genre-button");
  if (!button) return;
  drawQuestion(button.dataset.genre);
});

themeTabs.addEventListener("click", (event) => {
  const button = event.target.closest(".theme-tab");
  if (!button) return;

  activeLibraryTheme = button.dataset.theme;
  formMessage.textContent = "";
  themeMessage.textContent = "";
  newQuestionInput.value = "";
  updateThemeTabs();
  renderQuestionList();
});

addThemeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const label = newThemeInput.value.trim();

  if (!label) {
    themeMessage.textContent = "추가할 테마 이름을 입력해주세요.";
    newThemeInput.focus();
    return;
  }

  const normalizedLabel = label.replace(/\s+/g, " ");
  const allLabels = getThemeKeys().map((key) => getThemeLabel(key));
  if (allLabels.includes(normalizedLabel)) {
    themeMessage.textContent = "이미 있는 테마입니다.";
    newThemeInput.focus();
    return;
  }

  const themeKey = `custom-${Date.now()}`;
  customThemes[themeKey] = {
    label: normalizedLabel,
    description: "직접 추가한 테마",
  };
  customQuestions[themeKey] = [];

  const themeSaved = saveCustomThemes();
  const questionSaved = saveCustomQuestions();
  activeLibraryTheme = themeKey;
  newThemeInput.value = "";
  formMessage.textContent = "";
  themeMessage.textContent =
    themeSaved && questionSaved ? `${normalizedLabel} 테마를 추가했습니다.` : "테마는 추가됐지만 이 브라우저에 저장하지 못했습니다.";
  drawGenres();
  drawThemeTabs();
  renderQuestionList();
});

addQuestionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = newQuestionInput.value.trim();

  if (!question) {
    formMessage.textContent = "추가할 질문을 입력해주세요.";
    newQuestionInput.focus();
    return;
  }

  const allQuestions = getThemeQuestions(activeLibraryTheme);
  if (allQuestions.includes(question)) {
    formMessage.textContent = "이미 있는 질문입니다.";
    newQuestionInput.focus();
    return;
  }

  customQuestions[activeLibraryTheme] = [...(customQuestions[activeLibraryTheme] || []), question];
  const saved = saveCustomQuestions();
  newQuestionInput.value = "";
  formMessage.textContent = saved
    ? `${getThemeLabel(activeLibraryTheme)} 테마에 추가했습니다.`
    : "질문은 추가됐지만 이 브라우저에 저장하지 못했습니다.";
  renderQuestionList();
});

questionList.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-question-button");
  if (!button) return;

  const index = Number(button.dataset.index);
  customQuestions[activeLibraryTheme] = (customQuestions[activeLibraryTheme] || []).filter((_, itemIndex) => itemIndex !== index);
  const saved = saveCustomQuestions();
  formMessage.textContent = saved
    ? "추가한 질문을 삭제했습니다."
    : "화면에서는 삭제됐지만 저장 상태를 갱신하지 못했습니다.";
  renderQuestionList();
});

deleteThemeButton.addEventListener("click", () => {
  if (!isCustomTheme(activeLibraryTheme)) return;

  const deletedLabel = getThemeLabel(activeLibraryTheme);
  delete customThemes[activeLibraryTheme];
  delete customQuestions[activeLibraryTheme];

  if (activeGenreKey === activeLibraryTheme) {
    activeGenreKey = "";
    selectedGenre.textContent = "책 종류를 선택해주세요";
    questionPool.textContent = "공통 질문 포함";
    questionText.textContent = "오늘 읽은 책에 맞는 버튼을 누르면 질문이 나타납니다.";
    rerollButton.disabled = true;
    copyButton.disabled = true;
  }

  activeLibraryTheme = "common";
  const themeSaved = saveCustomThemes();
  const questionSaved = saveCustomQuestions();
  formMessage.textContent = "";
  themeMessage.textContent =
    themeSaved && questionSaved ? `${deletedLabel} 테마를 삭제했습니다.` : "화면에서는 삭제됐지만 저장 상태를 갱신하지 못했습니다.";
  drawGenres();
  drawThemeTabs();
  renderQuestionList();
});

rerollButton.addEventListener("click", () => {
  if (!activeGenreKey || isDrawing) return;
  drawQuestion(activeGenreKey);
});

copyButton.addEventListener("click", async () => {
  if (!currentQuestion) return;

  try {
    await navigator.clipboard.writeText(currentQuestion);
    copyButton.textContent = "복사됨";
    window.setTimeout(() => {
      copyButton.textContent = "질문 복사";
    }, 1200);
  } catch {
    copyButton.textContent = "복사 실패";
    window.setTimeout(() => {
      copyButton.textContent = "질문 복사";
    }, 1200);
  }
});

clearHistoryButton.addEventListener("click", () => {
  history = [];
  renderHistory();
});

drawGenres();
drawThemeTabs();
renderQuestionList();
renderHistory();
