import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "stuck-map-v10-4-soft-ui";
const INTRO_KEY = "stuck-map-intro-v10-2-flow-signal";

const FLOW_STATUSES = ["TODO", "DOING", "DONE"];
const SIGNAL_STATUSES = ["HELP", "WAIT", "CHECK", "REVIEW"];
const SIGNAL_NONE = "NONE";
const FILTER_STATUSES = ["ALL", ...FLOW_STATUSES, ...SIGNAL_STATUSES];

const STATUS_META = {
  TODO: {
    label: "これから",
    code: "TODO",
    icon: "○",
    tone: "todo",
    short: "着手前",
    description: "まだ着手していない作業。流れの入口に置く。",
    empty: "次に置く作業があれば追加できます。",
  },
  DOING: {
    label: "作業中",
    code: "DOING",
    icon: "▶",
    tone: "doing",
    short: "進行中",
    description: "いま手を動かしている作業。詰まりそうならサインを重ねる。",
    empty: "いま動いているカードはありません。",
  },
  HELP: {
    label: "手助け",
    code: "HELP",
    icon: "!",
    bubble: "HELP!",
    tone: "help",
    short: "少し手を借りたい",
    description: "一人で抱えすぎる前に、軽く助けを呼ぶサイン。",
    empty: "手助けサインはありません。",
    defaultReason: "少し手を借りたい",
  },
  WAIT: {
    label: "方向相談",
    code: "WAIT",
    icon: "Ⅱ",
    bubble: "方向!",
    tone: "wait",
    short: "向きを合わせたい",
    description: "判断を迫る前に、方向だけ合わせたいサイン。",
    empty: "方向相談サインはありません。",
    defaultReason: "方向相談",
  },
  CHECK: {
    label: "確認",
    code: "CHECK",
    icon: "?",
    bubble: "確認!",
    tone: "check",
    short: "軽く見てほしい",
    description: "小さな認識ズレや表示崩れを早めにほどくサイン。",
    empty: "確認サインはありません。",
    defaultReason: "軽く確認",
  },
  REVIEW: {
    label: "レビュー",
    code: "REVIEW",
    icon: "◎",
    bubble: "見て!",
    tone: "review",
    short: "一度見てほしい",
    description: "完成前に見直し・レビューしてほしいサイン。",
    empty: "レビューサインはありません。",
    defaultReason: "レビュー待ち",
  },
  DONE: {
    label: "完了",
    code: "DONE",
    icon: "✓",
    tone: "done",
    short: "完了済み",
    description: "終わった作業。流れの出口。",
    empty: "完了カードはまだありません。",
  },
};

const CATEGORY_SEED = [
  { id: "UI", label: "画面", icon: "◇" },
  { id: "COPY", label: "文言", icon: "✎" },
  { id: "FLOW", label: "流れ", icon: "◎" },
  { id: "REVIEW", label: "レビュー", icon: "◉" },
  { id: "DOC", label: "資料", icon: "▤" },
  { id: "OPS", label: "運用", icon: "⚙" },
  { id: "RELEASE", label: "公開", icon: "↑" },
  { id: "DATA", label: "データ", icon: "▦" },
];

const MEMBER_SEED = [
  {
    id: "m1",
    name: "リーダー",
    role: "方向を見る人",
    memo: "判断と方向合わせで、チームの流れを支える。",
  },
  {
    id: "m2",
    name: "レビュー担当",
    role: "レビュー / 確認担当",
    memo: "レビューと確認で、手戻りを小さくする。",
  },
  {
    id: "m3",
    name: "実装担当",
    role: "実装担当",
    memo: "作業を進めながら、小さな確認を早めに出す。",
  },
  {
    id: "m4",
    name: "R",
    role: "整理 / PMO補佐",
    memo: "状況を整理して、次に見る場所を見つける。",
  },
];

const SAMPLE_TEMPLATES = {
  personal: {
    label: "週末個人開発",
    project: {
      name: "Stuck Map 改善ボード",
      memo: "UI整理・文言調整・公開前確認を、止まる前に拾う。",
    },
    tasks: [
      task("p1", "フローとサインの役割を分け直す", "m4", "m1", "DOING", "UI", "作業中", "進行を見る場所と、助けを拾う場所を分離する。"),
      task("p2", "HELPの文言を重すぎない表現にする", "m3", "m2", "HELP", "COPY", "少し手を借りたい", "『助けてください』より、声を出しやすい軽さに寄せる。"),
      task("p3", "サインタブだけ吹き出しを出す", "m4", "m2", "CHECK", "UI", "表示確認", "フロー側を落ち着かせ、サイン側だけ目立たせる。"),
      task("p4", "READMEの説明と画面文言を合わせる", "m1", "m2", "REVIEW", "DOC", "レビュー待ち", "アプリ内の言葉と README の言葉がズレていないか見る。"),
      task("p5", "用途別サンプルデータの見え方を整える", "m4", "m1", "WAIT", "FLOW", "方向相談", "プロジェクト管理に見えすぎないよう、デモ切替として見せる。"),
      task("p6", "GitHub Pages 公開前の表示確認", "m2", "m2", "TODO", "RELEASE", "これから", "PC幅で崩れないか、カードが詰まりすぎないかを確認する。"),
      task("p7", "初回説明モーダルの文を短くする", "m4", "m1", "DONE", "COPY", "完了", "思想は残しつつ、初見で読める長さにする。"),
    ],
  },
  medical: {
    label: "医療システム導入",
    project: {
      name: "医療システム導入ボード",
      memo: "現場確認・設定・レビュー・公開前確認を、会議前に見える化する。",
    },
    tasks: [
      task("m-1", "部門別の確認フローを整理する", "m4", "m1", "WAIT", "FLOW", "方向相談", "誰に、どの順番で、何を確認するか。判断待ちが一点に溜まらないように流れを見る。"),
      task("m-2", "マスタ設定の不明点を軽く確認する", "m3", "m2", "CHECK", "OPS", "軽く確認", "設定値の意味が現場運用と合っているか、公開前に小さく確認する。"),
      task("m-3", "移行データの例外パターンを拾う", "m4", "m3", "HELP", "DATA", "少し手を借りたい", "CSVの例外パターンを一人で抱えず、早めに一緒に見る。"),
      task("m-4", "利用者向け説明文をレビューする", "m2", "m1", "REVIEW", "DOC", "レビュー待ち", "操作説明が現場に伝わる文になっているか、リリース前に確認する。"),
      task("m-5", "本番反映前のチェックリストを作る", "m1", "m1", "DOING", "RELEASE", "作業中", "公開前に見る項目を、担当者の記憶ではなくチェックリストに移す。"),
      task("m-6", "初回説明会の資料を用意する", "m2", "m2", "TODO", "DOC", "これから", "導入後に迷わないよう、操作の入り口だけ先に整理する。"),
      task("m-7", "現場ヒアリングの未回答をまとめる", "m4", "m1", "WAIT", "OPS", "確認待ち", "誰の回答待ちで止まっているか、責めずに見えるようにする。"),
      task("m-8", "権限設定のパターン表を確認する", "m3", "m2", "CHECK", "DATA", "軽く確認", "部署別の見え方が想定どおりか、例外だけ先に見る。"),
      task("m-9", "テスト環境で帳票出力を確認する", "m2", "m2", "DONE", "OPS", "完了", "帳票の項目欠けとレイアウト崩れを確認済み。"),
    ],
  },
  web: {
    label: "Webサイト改修",
    project: {
      name: "Webサイト改修ボード",
      memo: "文言・表示・公開確認を、レビュー待ちで止めないためのボード。",
    },
    tasks: [
      task("w-1", "長い掲載文の表示崩れを確認する", "m3", "m2", "CHECK", "UI", "表示確認", "PC/SPで見たときに、改行や余白が崩れていないか軽く見てほしい。"),
      task("w-2", "公開前の文言トーンを合わせる", "m4", "m1", "WAIT", "COPY", "方向相談", "原稿の意図を壊さず、ページとして読みやすい表現に寄せる方針を合わせる。"),
      task("w-3", "サムネイル候補を出す", "m2", "m1", "TODO", "UI", "これから", "一覧で埋もれないよう、カードに合う見え方を検討する。"),
      task("w-4", "公開URLを共有する前に最終確認する", "m1", "m2", "REVIEW", "RELEASE", "レビュー待ち", "公開後に慌てないよう、リンク・表示・文言の最終確認を置いておく。"),
      task("w-5", "エスケープ処理まわりを一緒に見る", "m3", "m4", "HELP", "OPS", "少し手を借りたい", "タグが文字列として出る原因を、ソース側から確認する。"),
      task("w-6", "スマホ幅の余白を調整する", "m4", "m2", "DOING", "UI", "作業中", "カードが詰まりすぎないよう、余白と折り返しを整える。"),
      task("w-7", "更新依頼のフォーマットを作る", "m1", "m1", "DONE", "DOC", "完了", "掲載依頼時に必要な情報を、先に揃えられるようにする。"),
    ],
  },
  onboarding: {
    label: "新人オンボーディング",
    project: {
      name: "新人オンボーディングボード",
      memo: "質問しにくい小さな詰まりを早めに見つけ、安心して立ち上がる。",
    },
    tasks: [
      task("o-1", "開発環境の初期設定で詰まりそう", "m3", "m2", "HELP", "OPS", "少し手を借りたい", "エラーが出たところだけ一緒に見れば進めそう。重い相談にする前に置いておく。"),
      task("o-2", "最初のレビュー依頼の出し方を確認する", "m4", "m1", "CHECK", "FLOW", "軽く確認", "どの粒度で依頼すればよいか、最初に合わせておく。"),
      task("o-3", "よくある質問をメモにする", "m2", "m2", "DOING", "DOC", "作業中", "繰り返し出る確認を、次の人が見られる形にする。"),
      task("o-4", "担当範囲の境界を合わせる", "m4", "m1", "WAIT", "FLOW", "方向相談", "どこまで自分で進めて、どこから相談するかを早めに合わせる。"),
      task("o-5", "初回タスクの完了条件を確認する", "m1", "m2", "REVIEW", "REVIEW", "レビュー待ち", "できた／まだ見る、の基準を曖昧にしない。"),
      task("o-6", "社内ルールの置き場所を確認する", "m3", "m4", "CHECK", "DOC", "軽く確認", "見れば分かる場所を、最初に確認しておく。"),
    ],
  },
  heavy: {
    label: "多タスク耐性テスト",
    project: {
      name: "多タスク耐性テストボード",
      memo: "カードが増えても、今拾うサインと流れが見失われないかを確認する。",
    },
    tasks: [
      task("h-1", "仕様メモを1枚にまとめる", "m4", "m1", "DOING", "DOC", "作業中", "複数のメモを、判断できる単位までまとめる。"),
      task("h-2", "一覧画面の余白を調整する", "m3", "m2", "CHECK", "UI", "軽く確認", "幅が広いとき、カードが伸びすぎないか見る。"),
      task("h-3", "サインの優先順位を見直す", "m4", "m1", "WAIT", "FLOW", "方向相談", "HELP / WAIT / CHECK / REVIEW の並びが実運用に合っているか見る。"),
      task("h-4", "CSV取込の例外を確認する", "m3", "m4", "HELP", "DATA", "少し手を借りたい", "空行・クォート・改行入りセルの扱いを一緒に確認したい。"),
      task("h-5", "レビュー観点を3つに絞る", "m2", "m1", "REVIEW", "REVIEW", "レビュー待ち", "見る観点が多すぎるので、公開前に見るものを絞る。"),
      task("h-6", "デモ用スクショを撮り直す", "m1", "m2", "TODO", "RELEASE", "これから", "画面が整った後で、README用に撮り直す。"),
      task("h-7", "カテゴリ名を短くする", "m4", "m2", "CHECK", "COPY", "表示確認", "カード内で長くなりすぎないよう、短い名称に寄せる。"),
      task("h-8", "会議前に見るカードを抽出する", "m1", "m1", "DOING", "FLOW", "作業中", "全部ではなく、会議で見るべきものだけ抽出する。"),
      task("h-9", "完了カードの圧を下げる", "m2", "m2", "DONE", "UI", "完了", "完了済みは見えるが、主役になりすぎないようにする。"),
      task("h-10", "ヘルプ文言を軽くする", "m3", "m1", "HELP", "COPY", "少し手を借りたい", "頼みにくさが出ない表現にする。"),
      task("h-11", "公開前チェックを自動化候補にする", "m4", "m1", "WAIT", "OPS", "方向相談", "今やるか、次フェーズに回すかを決めたい。"),
      task("h-12", "説明文の重複を削る", "m2", "m4", "REVIEW", "COPY", "レビュー待ち", "同じ説明が複数箇所に出ていないか見る。"),
      task("h-13", "タスク追加フォームの初期値を見直す", "m4", "m2", "CHECK", "UI", "軽く確認", "サイン作成と通常タスク追加の違いが伝わるか見る。"),
      task("h-14", "localStorageリセット動線を残す", "m1", "m1", "DONE", "OPS", "完了", "デモが壊れたとき、初期状態へ戻せるようにする。"),
      task("h-15", "READMEに多タスク時の見え方を書く", "m4", "m2", "TODO", "DOC", "これから", "カードが増えたときの設計意図を短く書く。"),
    ],
  },
};

const EMPTY_TASK_FORM = {
  id: "",
  title: "",
  ownerId: "m4",
  needId: "m1",
  flowStatus: "DOING",
  signalStatus: "HELP",
  category: "FLOW",
  reason: "少し手を借りたい",
  description: "",
};

function splitLegacyStatus(status) {
  if (FLOW_STATUSES.includes(status)) {
    return { flowStatus: status, signalStatus: SIGNAL_NONE };
  }

  if (SIGNAL_STATUSES.includes(status)) {
    return { flowStatus: "DOING", signalStatus: status };
  }

  return { flowStatus: "TODO", signalStatus: SIGNAL_NONE };
}

function task(id, title, ownerId, needId, status, category, reason, description) {
  const split = splitLegacyStatus(status);
  return { id, title, ownerId, needId, ...split, category, reason, description };
}

function normalizeTask(item) {
  const legacy = splitLegacyStatus(item.status);
  const flowStatus = FLOW_STATUSES.includes(item.flowStatus) ? item.flowStatus : legacy.flowStatus;
  const signalStatus = SIGNAL_STATUSES.includes(item.signalStatus) ? item.signalStatus : legacy.signalStatus;

  return {
    ...item,
    flowStatus,
    signalStatus,
    status: undefined,
  };
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeCategoryId(value) {
  return value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "").toUpperCase();
}

function avatarFromName(name) {
  const normalized = String(name || "").trim();
  if (!normalized) return "?";
  if (/^[a-zA-Z0-9]+$/.test(normalized)) return normalized.slice(0, 2).toUpperCase();
  return Array.from(normalized.replace(/\s+/g, "")).slice(0, 2).join("");
}

function cloneTasks(tasks) {
  return tasks.map((item) => ({ ...item }));
}

function createInitialState(sampleId = "personal") {
  const template = SAMPLE_TEMPLATES[sampleId] || SAMPLE_TEMPLATES.personal;
  return {
    project: { ...template.project },
    members: MEMBER_SEED.map((member) => ({ ...member, avatar: avatarFromName(member.name) })),
    categories: CATEGORY_SEED.map((category) => ({ ...category })),
    tasks: cloneTasks(template.tasks).map(normalizeTask),
    sampleId,
  };
}

function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tasks)) return createInitialState();
    return {
      project: parsed.project || createInitialState().project,
      members: Array.isArray(parsed.members) && parsed.members.length ? parsed.members : createInitialState().members,
      categories: Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : createInitialState().categories,
      tasks: parsed.tasks.map(normalizeTask),
      sampleId: parsed.sampleId || "personal",
    };
  } catch {
    return createInitialState();
  }
}

function sortTasks(a, b) {
  const signalPriority = { HELP: 1, WAIT: 2, CHECK: 3, REVIEW: 4, NONE: 9 };
  const flowPriority = { DOING: 1, TODO: 2, DONE: 3 };
  const aSignal = a.signalStatus || SIGNAL_NONE;
  const bSignal = b.signalStatus || SIGNAL_NONE;

  return (
    (signalPriority[aSignal] || 99) - (signalPriority[bSignal] || 99) ||
    (flowPriority[a.flowStatus] || 99) - (flowPriority[b.flowStatus] || 99) ||
    a.title.localeCompare(b.title, "ja")
  );
}

export default function App() {
  const [appState, setAppState] = useState(() => safeLoad());
  const [activeTab, setActiveTab] = useState("flow");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK_FORM);
  const [taskModalMode, setTaskModalMode] = useState(null);
  const [memberDraft, setMemberDraft] = useState({ id: "", name: "", role: "", memo: "" });
  const [categoryDraft, setCategoryDraft] = useState({ id: "", label: "", icon: "◇" });
  const [showIntro, setShowIntro] = useState(() => localStorage.getItem(INTRO_KEY) !== "done");
  const [savePop, setSavePop] = useState(false);

  const { project, members, categories, tasks, sampleId } = appState;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    setSavePop(true);
    const timer = window.setTimeout(() => setSavePop(false), 550);
    return () => window.clearTimeout(timer);
  }, [appState]);

  const memberMap = useMemo(() => Object.fromEntries(members.map((member) => [member.id, member])), [members]);
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories]);

  const summary = useMemo(() => {
    const signalTasks = tasks.filter((item) => SIGNAL_STATUSES.includes(item.signalStatus));
    const doingTasks = tasks.filter((item) => item.flowStatus === "DOING");
    const doneTasks = tasks.filter((item) => item.flowStatus === "DONE");
    const busyNeedMap = signalTasks.reduce((acc, item) => {
      acc[item.needId] = (acc[item.needId] || 0) + 1;
      return acc;
    }, {});
    const busyNeed = Object.entries(busyNeedMap).sort((a, b) => b[1] - a[1])[0];

    return {
      total: tasks.length,
      signals: signalTasks.length,
      doing: doingTasks.length,
      done: doneTasks.length,
      busiestNeed: busyNeed ? memberMap[busyNeed[0]]?.name || "未設定" : "なし",
      busiestCount: busyNeed ? busyNeed[1] : 0,
    };
  }, [tasks, memberMap]);

  const filteredTasks = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return tasks
      .filter((item) => statusFilter === "ALL" ? true : FLOW_STATUSES.includes(statusFilter) ? item.flowStatus === statusFilter : item.signalStatus === statusFilter)
      .filter((item) => (categoryFilter === "ALL" ? true : item.category === categoryFilter))
      .filter((item) => (ownerFilter === "ALL" ? true : item.ownerId === ownerFilter || item.needId === ownerFilter))
      .filter((item) => {
        if (!query) return true;
        const owner = memberMap[item.ownerId]?.name || "";
        const need = memberMap[item.needId]?.name || "";
        const category = categoryMap[item.category]?.label || item.category;
        return [item.title, item.reason, item.description, owner, need, category].join(" ").toLowerCase().includes(query);
      })
      .sort(sortTasks);
  }, [tasks, statusFilter, categoryFilter, ownerFilter, searchText, memberMap, categoryMap]);

  const nextSignals = useMemo(() => tasks.filter((item) => SIGNAL_STATUSES.includes(item.signalStatus)).sort(sortTasks), [tasks]);

  const currentStatuses = activeTab === "flow" ? FLOW_STATUSES : SIGNAL_STATUSES;

  function updateState(patch) {
    setAppState((prev) => ({ ...prev, ...patch }));
  }

  function updateTask(taskId, patch) {
    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((item) => (item.id === taskId ? { ...item, ...patch } : item)),
    }));
  }

  function deleteTask(taskId) {
    setAppState((prev) => ({ ...prev, tasks: prev.tasks.filter((item) => item.id !== taskId) }));
  }

  function openCreateTask(status = activeTab === "signal" ? "HELP" : "TODO") {
    const isSignal = SIGNAL_STATUSES.includes(status);
    const flowStatus = isSignal ? "DOING" : status;
    const signalStatus = isSignal ? status : SIGNAL_NONE;

    setTaskForm({
      ...EMPTY_TASK_FORM,
      id: "",
      flowStatus,
      signalStatus,
      reason: isSignal ? STATUS_META[status]?.defaultReason || STATUS_META[status]?.short || "" : STATUS_META[flowStatus]?.short || "",
      category: isSignal ? "OPS" : "FLOW",
      ownerId: members[0]?.id || "m1",
      needId: members[0]?.id || "m1",
    });
    setTaskModalMode("create");
  }

  function openEditTask(item) {
    setTaskForm({ ...EMPTY_TASK_FORM, ...normalizeTask(item) });
    setTaskModalMode("edit");
  }

  function submitTask(event) {
    event.preventDefault();
    const cleanTitle = taskForm.title.trim();
    if (!cleanTitle) return;

    const nextTask = {
      ...taskForm,
      id: taskForm.id || createId("t"),
      title: cleanTitle,
      reason: taskForm.reason.trim() || STATUS_META[taskForm.signalStatus]?.short || STATUS_META[taskForm.flowStatus]?.short || "",
      description: taskForm.description.trim(),
      category: taskForm.category || categories[0]?.id || "FLOW",
      ownerId: taskForm.ownerId || members[0]?.id || "m1",
      needId: taskForm.needId || taskForm.ownerId || members[0]?.id || "m1",
    };

    setAppState((prev) => ({
      ...prev,
      tasks:
        taskModalMode === "edit"
          ? prev.tasks.map((item) => (item.id === nextTask.id ? nextTask : item))
          : [nextTask, ...prev.tasks],
    }));
    setTaskModalMode(null);
  }

  function quickSignal(status) {
    setActiveTab("signal");
    openCreateTask(status);
  }

  function markSignalDone(item) {
    updateTask(item.id, {
      signalStatus: SIGNAL_NONE,
      reason: item.flowStatus === "DONE" ? "完了" : "また進める",
    });
  }

  function applySample(nextSampleId) {
    const next = createInitialState(nextSampleId);
    setAppState(next);
    setActiveTab("flow");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setOwnerFilter("ALL");
    setSearchText("");
  }

  function resetBoard() {
    applySample(sampleId || "personal");
  }

  function handleDrop(status) {
    if (!draggingId) return;

    if (activeTab === "flow") {
      updateTask(draggingId, { flowStatus: status });
    } else {
      updateTask(draggingId, {
        signalStatus: status,
        reason: STATUS_META[status]?.defaultReason || STATUS_META[status]?.short || "",
      });
    }

    setDraggingId(null);
    setDragOverStatus(null);
  }

  function submitMember(event) {
    event.preventDefault();
    const name = memberDraft.name.trim();
    if (!name) return;
    const nextMember = {
      id: memberDraft.id || createId("m"),
      name,
      role: memberDraft.role.trim() || "メンバー",
      memo: memberDraft.memo.trim(),
      avatar: avatarFromName(name),
    };
    setAppState((prev) => ({
      ...prev,
      members: memberDraft.id
        ? prev.members.map((member) => (member.id === memberDraft.id ? nextMember : member))
        : [...prev.members, nextMember],
    }));
    setMemberDraft({ id: "", name: "", role: "", memo: "" });
  }

  function submitCategory(event) {
    event.preventDefault();
    const id = normalizeCategoryId(categoryDraft.id || categoryDraft.label);
    const label = categoryDraft.label.trim();
    if (!id || !label) return;
    const nextCategory = { id, label, icon: categoryDraft.icon.trim() || "◇" };
    setAppState((prev) => ({
      ...prev,
      categories: prev.categories.some((category) => category.id === id)
        ? prev.categories.map((category) => (category.id === id ? nextCategory : category))
        : [...prev.categories, nextCategory],
    }));
    setCategoryDraft({ id: "", label: "", icon: "◇" });
  }

  function closeIntro() {
    localStorage.setItem(INTRO_KEY, "done");
    setShowIntro(false);
  }

  return (
    <div className="app-shell">
      <div className="bg-grid" />
      <div className="bg-water water-a" />
      <div className="bg-water water-b" />
      <div className="bg-water water-c" />

      <main className="app-frame">
        <header className="topbar surface">
          <div className="topbar-left">
            <div className="logo-mark" aria-hidden="true"><span /></div>
            <div>
              <p className="eyebrow">Stuck Map</p>
              <strong>詰まりを、責めずに見える化する</strong>
            </div>
          </div>

          <div className="project-title-area">
            <label className="project-label">現在のボード</label>
            <input
              value={project.name}
              onChange={(event) => updateState({ project: { ...project, name: event.target.value } })}
              aria-label="ボード名"
            />
            <input
              value={project.memo}
              onChange={(event) => updateState({ project: { ...project, memo: event.target.value } })}
              aria-label="ボードメモ"
            />
          </div>

          <div className="topbar-actions">
            <span className={`save-indicator ${savePop ? "saved-pop" : ""}`}><span />自動保存</span>
            <button className="secondary-action" onClick={() => setShowIntro(true)}>使い方</button>
            <button className="danger-action" onClick={resetBoard}>初期化</button>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy-block surface">
            <p className="eyebrow">Stuck Map</p>
            <h1>Stuck Map</h1>
            <p className="hero-concept-statement">誰が遅いかではなく、何が詰まっているかを見る。</p>
            <p className="hero-copy">
              フローでは作業の流れを見る。サインでは、手助け・方向相談・確認・レビューを拾う。
              多タスクでも「今見る場所」が埋もれないように、役割を分けたボードです。
            </p>
            <div className="hero-tags">
              <span>フローは落ち着いて見る</span>
              <span>サインは早めに拾う</span>
              <span>用途別サンプルデータ</span>
              <span>localStorage 保存</span>
            </div>
          </div>

          <aside className="hero-card surface">
            <div>
              <p className="eyebrow">Next signal</p>
              <strong>{nextSignals[0] ? nextSignals[0].title : "いま拾うサインはありません"}</strong>
              <span>
                {nextSignals[0]
                  ? `${STATUS_META[nextSignals[0].signalStatus].label}：${nextSignals[0].reason || STATUS_META[nextSignals[0].signalStatus].short}`
                  : "落ち着いて、フロー側の作業を進められます。"}
              </span>
            </div>
            <div className="quick-actions">
              {SIGNAL_STATUSES.map((status) => (
                <button key={status} className={`quick-signal ${STATUS_META[status].tone}`} onClick={() => quickSignal(status)}>
                  <b>{STATUS_META[status].label}</b>
                  <span>{STATUS_META[status].short}</span>
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="summary-grid">
          <SummaryCard label="総カード" value={summary.total} text="多くても絞り込みで見る" />
          <SummaryCard label="拾うサイン" value={summary.signals} text="HELP / WAIT / CHECK / REVIEW" highlight />
          <SummaryCard label="作業中" value={summary.doing} text="今動いているカード" />
          <SummaryCard label="確認が集まる人" value={summary.busiestNeed ? summary.busiestNeed : "なし"} text={summary.busiestCount ? `${summary.busiestCount} 件のサイン` : "偏りなし"} compact />
        </section>

        <section className="sample-strip surface">
          <div>
            <p className="eyebrow">Sample data</p>
            <strong>用途別サンプルデータ</strong>
            <span>プロジェクト追加ではなく、見え方確認用のデモ切替です。</span>
          </div>
          <div className="sample-buttons">
            {Object.entries(SAMPLE_TEMPLATES).map(([id, template]) => (
              <button key={id} className={sampleId === id ? "active" : ""} onClick={() => applySample(id)}>
                {template.label}
              </button>
            ))}
          </div>
        </section>

        <section className="board-layout">
          <aside className="panel members-panel surface">
            <div className="panel-heading">
              <p className="eyebrow">People</p>
              <h2>メンバー</h2>
              <p className="panel-subtext">クリックすると、その人が担当・確認先のカードだけに絞ります。</p>
            </div>

            <div className="member-list">
              {members.map((member) => {
                const relatedTasks = tasks.filter((item) => item.ownerId === member.id || item.needId === member.id);
                const ownedTasks = tasks.filter((item) => item.ownerId === member.id);
                const signalCount = relatedTasks.filter((item) => SIGNAL_STATUSES.includes(item.signalStatus)).length;
                const doing = ownedTasks.find((item) => item.flowStatus === "DOING");
                const todoCount = ownedTasks.filter((item) => item.flowStatus === "TODO").length;
                const doingCount = ownedTasks.filter((item) => item.flowStatus === "DOING").length;
                const doneCount = ownedTasks.filter((item) => item.flowStatus === "DONE").length;
                const showSignalBadge = activeTab === "signal" && signalCount > 0;
                return (
                  <button
                    key={member.id}
                    className={`member-card ${ownerFilter === member.id ? "active" : ""} ${activeTab === "flow" ? "flow-member" : "signal-member"}`}
                    onClick={() => setOwnerFilter(ownerFilter === member.id ? "ALL" : member.id)}
                  >
                    <div className="avatar-wrap">
                      <div className="avatar">{member.avatar || avatarFromName(member.name)}</div>
                      {showSignalBadge && <span className="speech-bubble member-bubble">{signalCount}</span>}
                    </div>
                    <div className="member-body">
                      <div className="member-name-row">
                        <h3>{member.name}</h3>
                        <span className="member-role-pill">{member.role}</span>
                      </div>
                      <small>{member.memo || "メモなし"}</small>

                      {activeTab === "flow" ? (
                        <div className="member-flow-summary" aria-label="担当カードのフロー内訳">
                          <span><b>{todoCount}</b><small>これから</small></span>
                          <span><b>{doingCount}</b><small>作業中</small></span>
                          <span><b>{doneCount}</b><small>完了</small></span>
                        </div>
                      ) : (
                        <div className="member-signal-summary" aria-label="拾うサイン数">
                          <span className="member-signal-count">{signalCount}</span>
                          <span>
                            <b>{signalCount > 0 ? "拾うサインあり" : "サインなし"}</b>
                            <em>{relatedTasks.length} 件関連</em>
                          </span>
                        </div>
                      )}

                      <div className="member-task-chip">
                        <span className={`member-task-icon ${doing ? "DOING" : "FLOW"}`}>{doing ? "▶" : "○"}</span>
                        <span className="member-task-text">
                          <b>{doing ? doing.title : "着手中カードなし"}</b>
                          <em>{activeTab === "flow" ? "フロー上の現在地" : "担当・確認先の関連カード"}</em>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <details className="mini-editor">
              <summary>メンバー追加</summary>
              <form onSubmit={submitMember} className="mini-form">
                <input placeholder="名前" value={memberDraft.name} onChange={(e) => setMemberDraft({ ...memberDraft, name: e.target.value })} />
                <input placeholder="役割" value={memberDraft.role} onChange={(e) => setMemberDraft({ ...memberDraft, role: e.target.value })} />
                <textarea placeholder="メモ" value={memberDraft.memo} onChange={(e) => setMemberDraft({ ...memberDraft, memo: e.target.value })} />
                <button className="primary-action" type="submit">追加</button>
              </form>
            </details>
          </aside>

          <section className="panel tasks-panel surface">
            <div className="board-heading">
              <div className="panel-heading">
                <p className="eyebrow">Board</p>
                <h2>{activeTab === "flow" ? "フローを見る" : "サインを拾う"}</h2>
                <p className="panel-subtext">
                  {activeTab === "flow"
                    ? "これから → 作業中 → 完了。サインは旗として残し、流れは崩さず見ます。"
                    : "手助け・方向相談・確認・レビュー。ここだけ吹き出しで目立たせます。"}
                </p>
              </div>
              <div className="board-actions">
                <div className="view-tabs" role="tablist" aria-label="表示切替">
                  <button className={activeTab === "flow" ? "active" : ""} onClick={() => setActiveTab("flow")}>
                    <span>フロー</span>
                    <small>流れを見る</small>
                  </button>
                  <button className={activeTab === "signal" ? "active" : ""} onClick={() => setActiveTab("signal")}>
                    <span>サイン</span>
                    <small>詰まりを拾う</small>
                  </button>
                </div>
                <button className="primary-action" onClick={() => openCreateTask(activeTab === "signal" ? "HELP" : "TODO")}>カード追加</button>
              </div>
            </div>

            <div className="filters-panel">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="タイトル・理由・説明・担当で検索"
              />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">状態すべて</option>
                {FILTER_STATUSES.filter((status) => status !== "ALL").map((status) => <option key={status} value={status}>{STATUS_META[status].label}</option>)}
              </select>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="ALL">カテゴリすべて</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
              </select>
              <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
                <option value="ALL">メンバーすべて</option>
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>

            <div className="category-row">
              <button className={categoryFilter === "ALL" ? "active" : ""} onClick={() => setCategoryFilter("ALL")}>すべて</button>
              {categories.map((category) => (
                <button key={category.id} className={categoryFilter === category.id ? "active" : ""} onClick={() => setCategoryFilter(category.id)}>
                  <span>{category.icon}</span>{category.label}
                </button>
              ))}
            </div>

            <div className={`cluster-board ${activeTab === "flow" ? "flow-board" : "signal-board"}`}>
              {currentStatuses.map((status) => {
                const laneTasks = filteredTasks.filter((item) => activeTab === "flow" ? item.flowStatus === status : item.signalStatus === status);
                return (
                  <section
                    key={status}
                    className={`status-lane lane-${STATUS_META[status].tone} ${dragOverStatus === status ? "drag-over" : ""}`}
                    onDragOver={(event) => { event.preventDefault(); setDragOverStatus(status); }}
                    onDragLeave={() => setDragOverStatus(null)}
                    onDrop={() => handleDrop(status)}
                  >
                    <header className="lane-header">
                      <div className="lane-title-row">
                        <span className="lane-icon">{STATUS_META[status].icon}</span>
                        <div>
                          <h3>{STATUS_META[status].label}<small>{STATUS_META[status].code}</small></h3>
                          <p>{STATUS_META[status].description}</p>
                        </div>
                      </div>
                      <strong>{laneTasks.length}</strong>
                    </header>

                    <div className="lane-body">
                      {laneTasks.length === 0 ? (
                        <div className="empty-lane">{STATUS_META[status].empty}</div>
                      ) : (
                        laneTasks.map((item) => (
                          <TaskCard
                            key={item.id}
                            task={item}
                            members={memberMap}
                            category={categoryMap[item.category]}
                            signalMode={activeTab === "signal"}
                            onEdit={() => openEditTask(item)}
                            onDelete={() => deleteTask(item.id)}
                            onSignalDone={() => markSignalDone(item)}
                            onDragStart={() => setDraggingId(item.id)}
                            onDragEnd={() => { setDraggingId(null); setDragOverStatus(null); }}
                          />
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>

          <aside className="panel signals-panel surface">
            <div className="panel-heading">
              <p className="eyebrow">Pick up</p>
              <h2>次に拾うサイン</h2>
              <p className="panel-subtext">多タスク時は、全部ではなく「流れを止めそうなサイン」から見ます。</p>
            </div>

            <div className="next-signal-list">
              {nextSignals.length === 0 ? (
                <div className="empty-next">今すぐ拾うサインはありません。</div>
              ) : (
                nextSignals.slice(0, 6).map((item, index) => (
                  <button key={item.id} className={`next-signal-card ${STATUS_META[item.signalStatus].tone}`} onClick={() => { setActiveTab("signal"); setStatusFilter(item.signalStatus); }}>
                    <span className="rank">{index + 1}</span>
                    <div>
                      <b>{item.title}</b>
                      <small>{STATUS_META[item.signalStatus].label} / {memberMap[item.needId]?.name || "未設定"}に見てほしい</small>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="quick-panel">
              <p className="eyebrow">Quick sign</p>
              <strong>軽くサインを置く</strong>
              <p>重いタスク追加ではなく、止まりそうな場所を一言で置く入口。</p>
              <div className="quick-panel-grid">
                {SIGNAL_STATUSES.map((status) => (
                  <button key={status} className={`quick-panel-button ${STATUS_META[status].tone}`} onClick={() => quickSignal(status)}>
                    <span>{STATUS_META[status].bubble}</span>
                    <b>{STATUS_META[status].label}</b>
                  </button>
                ))}
              </div>
            </div>

            <details className="mini-editor">
              <summary>カテゴリ追加</summary>
              <form onSubmit={submitCategory} className="mini-form">
                <input placeholder="ID 例：QA" value={categoryDraft.id} onChange={(e) => setCategoryDraft({ ...categoryDraft, id: e.target.value })} />
                <input placeholder="表示名 例：品質" value={categoryDraft.label} onChange={(e) => setCategoryDraft({ ...categoryDraft, label: e.target.value })} />
                <input placeholder="アイコン" value={categoryDraft.icon} onChange={(e) => setCategoryDraft({ ...categoryDraft, icon: e.target.value })} />
                <button className="primary-action" type="submit">追加</button>
              </form>
            </details>
          </aside>
        </section>
      </main>

      {taskModalMode && (
        <TaskModal
          mode={taskModalMode}
          form={taskForm}
          members={members}
          categories={categories}
          onChange={setTaskForm}
          onClose={() => setTaskModalMode(null)}
          onSubmit={submitTask}
        />
      )}

      {showIntro && (
        <IntroModal onClose={closeIntro} />
      )}
    </div>
  );
}

function SummaryCard({ label, value, text, highlight = false, compact = false }) {
  return (
    <div className={`summary-card surface ${highlight ? "summary-highlight" : ""}`}>
      <span className="summary-label">{label}</span>
      <strong className={compact ? "summary-value summary-text" : "summary-value"}>{value}</strong>
      <p>{text}</p>
    </div>
  );
}

function TaskCard({ task, members, category, signalMode, onEdit, onDelete, onSignalDone, onDragStart, onDragEnd }) {
  const flowMeta = STATUS_META[task.flowStatus] || STATUS_META.TODO;
  const signalMeta = SIGNAL_STATUSES.includes(task.signalStatus) ? STATUS_META[task.signalStatus] : null;
  const mainMeta = signalMode && signalMeta ? signalMeta : flowMeta;

  return (
    <article
      className={`task-card card-${mainMeta.tone} ${signalMode ? "signal-card" : "flow-card"}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {signalMode && signalMeta && (
        <div className={`task-speech-bubble ${signalMeta.tone}`}>{signalMeta.bubble}</div>
      )}

      <div className="task-topline">
        <span className={`status-pill ${flowMeta.tone}`}><b>{flowMeta.label}</b><em>{flowMeta.code}</em></span>
        {signalMeta && <span className={`status-pill ${signalMeta.tone} signal-mini`}><b>{signalMeta.label}</b><em>{signalMeta.code}</em></span>}
        <span className="category-pill">{category?.icon || "◇"} {category?.label || task.category}</span>
      </div>

      <h4>{task.title}</h4>
      <p>{task.description || "説明なし"}</p>

      <div className="task-meta-grid">
        <span><small>担当</small><b>{members[task.ownerId]?.name || "未設定"}</b></span>
        <span><small>見てほしい</small><b>{members[task.needId]?.name || "未設定"}</b></span>
      </div>

      <div className="task-reason">{task.reason || signalMeta?.short || flowMeta.short}</div>

      <div className="task-actions">
        {signalMode && signalMeta && <button onClick={onSignalDone}>拾った</button>}
        <button onClick={onEdit}>編集</button>
        <button className="danger-link" onClick={onDelete}>削除</button>
      </div>
    </article>
  );
}

function TaskModal({ mode, form, members, categories, onChange, onClose, onSubmit }) {
  const hasSignal = SIGNAL_STATUSES.includes(form.signalStatus);
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card surface" role="dialog" aria-modal="true" aria-label="カード編集">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{mode === "edit" ? "Edit card" : hasSignal ? "Quick signal" : "New card"}</p>
            <h2>{mode === "edit" ? "カードを編集" : hasSignal ? "軽くサインを置く" : "カードを追加"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>×</button>
        </div>

        <form className="task-form" onSubmit={onSubmit}>
          <label>
            <span>タイトル</span>
            <input value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} placeholder="例：この表示崩れを一緒に見たい" autoFocus />
          </label>

          <div className="form-grid two">
            <label>
              <span>フロー</span>
              <select
                value={form.flowStatus}
                onChange={(event) => onChange({ ...form, flowStatus: event.target.value })}
              >
                {FLOW_STATUSES.map((status) => <option key={status} value={status}>{STATUS_META[status].label}</option>)}
              </select>
            </label>
            <label>
              <span>サイン</span>
              <select
                value={form.signalStatus}
                onChange={(event) => {
                  const nextSignal = event.target.value;
                  onChange({
                    ...form,
                    signalStatus: nextSignal,
                    reason: nextSignal === SIGNAL_NONE ? form.reason : STATUS_META[nextSignal]?.defaultReason || STATUS_META[nextSignal]?.short || form.reason,
                  });
                }}
              >
                <option value={SIGNAL_NONE}>なし</option>
                {SIGNAL_STATUSES.map((status) => <option key={status} value={status}>{STATUS_META[status].label}</option>)}
              </select>
            </label>
          </div>

          <div className="form-grid two">
            <label>
              <span>カテゴリ</span>
              <select value={form.category} onChange={(event) => onChange({ ...form, category: event.target.value })}>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
              </select>
            </label>
            <label>
              <span>担当</span>
              <select value={form.ownerId} onChange={(event) => onChange({ ...form, ownerId: event.target.value })}>
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </label>
          </div>

          <label>
            <span>見てほしい相手</span>
            <select value={form.needId} onChange={(event) => onChange({ ...form, needId: event.target.value })}>
              {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
          </label>

          <label>
            <span>理由 / サイン</span>
            <input value={form.reason} onChange={(event) => onChange({ ...form, reason: event.target.value })} placeholder="例：軽く確認 / 方向相談" />
          </label>

          <label>
            <span>メモ</span>
            <textarea value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} placeholder="何があると進みそうか、短く書く" />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-action" onClick={onClose}>閉じる</button>
            <button type="submit" className="primary-action">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IntroModal({ onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="intro-card surface" role="dialog" aria-modal="true" aria-label="Stuck Map の使い方">
        <p className="eyebrow">How to use</p>
        <h2>Stuck Map は、進捗管理より「詰まり検知」に寄せたボードです。</h2>
        <div className="intro-grid">
          <div>
            <b>1. フローを見る</b>
            <span>これから → 作業中 → 完了。作業の流れだけを落ち着いて見る。</span>
          </div>
          <div>
            <b>2. サインを拾う</b>
            <span>手助け・方向相談・確認・レビューは、サインタブで目立たせる。</span>
          </div>
          <div>
            <b>3. 軽く置く</b>
            <span>重い相談にする前に、一言サインとして置く。</span>
          </div>
          <div>
            <b>4. 責めない</b>
            <span>誰が遅いかではなく、何が詰まっているかを見る。</span>
          </div>
        </div>
        <button className="primary-action" onClick={onClose}>使い始める</button>
      </div>
    </div>
  );
}
