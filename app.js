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
const rerollButton = document.querySelector("#rerollButton");
const copyButton = document.querySelector("#copyButton");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const historyList = document.querySelector("#historyList");

let activeGenreKey = "";
let currentQuestion = "";
let previousQuestion = "";
let history = [];

function drawGenres() {
  genreGrid.innerHTML = Object.entries(genreQuestions)
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
  return [...commonQuestions, ...genreQuestions[genreKey].questions];
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
    .map((item) => `<li><strong>${item.genre}</strong> · ${item.question}</li>`)
    .join("");
}

function drawQuestion(genreKey) {
  const genre = genreQuestions[genreKey];
  activeGenreKey = genreKey;
  previousQuestion = currentQuestion;
  currentQuestion = pickQuestion(genreKey);

  selectedGenre.textContent = genre.label;
  questionPool.textContent = `총 ${getPool(genreKey).length}개 질문 중 선택`;
  questionText.textContent = currentQuestion;
  rerollButton.disabled = false;
  copyButton.disabled = false;

  history = [{ genre: genre.label, question: currentQuestion }, ...history].slice(0, 8);
  updateActiveButton();
  renderHistory();
}

genreGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".genre-button");
  if (!button) return;
  drawQuestion(button.dataset.genre);
});

rerollButton.addEventListener("click", () => {
  if (!activeGenreKey) return;
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
renderHistory();
