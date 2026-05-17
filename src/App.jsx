import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const STORAGE_KEY = "stuck-map-v8";
const INTRO_STORAGE_KEY = "stuck-map-intro-v8";

const initialプロジェクト = {
  name: "Weekend Build",
  memo: "週末で、プロジェクトボードとして使えるところまで行く",
};

const initialメンバー = [
  {
    id: "m1",
    name: "リーダー",
    role: "方向を見る人",
    avatar: "リー",
    memo: "判断や方向合わせでチームを支える人",
  },
  {
    id: "m2",
    name: "レビュー担当",
    role: "レビュー / 確認担当",
    avatar: "レビ",
    memo: "レビューと確認で流れを整える人",
  },
  {
    id: "m3",
    name: "実装担当",
    role: "実装担当",
    avatar: "実装",
    memo: "実装を進めながら小さな確認を出す人",
  },
  {
    id: "m4",
    name: "R",
    role: "PMO補佐 / 整理担当",
    avatar: "R",
    memo: "状況を整理して、次に見る場所を見つける人",
  },
];

const initialTasks = [
  {
    id: "t1",
    title: "メンバーカードに着手中バッジを出す",
    ownerId: "m4",
    needId: "m3",
    status: "DOING",
    category: "UI",
    reason: "表示確認",
    description:
      "左のメンバーカードに、今触っているタスク名と小さなバッジを表示する。",
  },
  {
    id: "t2",
    title: "HELPの文言を重すぎない表現に整える",
    ownerId: "m3",
    needId: "m2",
    status: "HELP",
    category: "COPY",
    reason: "表現確認",
    description:
      "『助けてください』ではなく、『少し手を借りたい』くらいの軽さに寄せる。",
  },
  {
    id: "t3",
    title: "方向を見る置き場を右側に集約する",
    ownerId: "m4",
    needId: "m1",
    status: "WAIT",
    category: "FLOW",
    reason: "方向相談",
    description:
      "どこを見れば前に進むかを、進捗会議前に見えるようにする。",
  },
  {
    id: "t4",
    title: "レビュー待ちカードの見え方を整える",
    ownerId: "m2",
    needId: "m2",
    status: "REVIEW",
    category: "REVIEW",
    reason: "レビュー待ち",
    description:
      "レビュー依頼が埋もれないように、色とラベルを調整する。",
  },
  {
    id: "t5",
    title: "ダミーアイコン案をカードに置く",
    ownerId: "m3",
    needId: "m1",
    status: "CHECK",
    category: "ICON",
    reason: "軽く見てほしい",
    description:
      "本番アイコンの前に、絵文字や簡易記号でイメージを固める。方向性だけ軽く確認したい。",
  },
  {
    id: "t6",
    title: "GitHub Pages に載せる前の最終整理",
    ownerId: "m4",
    needId: "m1",
    status: "TODO",
    category: "RELEASE",
    reason: "公開準備",
    description:
      "README・表示確認・不要ファイル整理をして公開できる状態にする。",
  },
  {
    id: "t7",
    title: "README を Stuck Map 用に差し替える",
    ownerId: "m1",
    needId: "m1",
    status: "DONE",
    category: "DOC",
    reason: "完了",
    description:
      "Vite 初期文から、Stuck Map の背景と目的が伝わる説明に更新する。",
  },
  {
    id: "t8",
    title: "状態フィルターを上部に置く",
    ownerId: "m1",
    needId: "m1",
    status: "DONE",
    category: "UI",
    reason: "完了",
    description:
      "すべて / 進行中 / HELP などで今見たい状態だけに絞れるようにする。",
  },
];


const sampleProjectTemplates = {
  personal: {
    label: "週末個人開発",
    project: {
      name: "週末個人開発プロジェクト",
      memo: "週末で、プロジェクトボードとして使えるところまで行く",
    },
    tasks: initialTasks,
  },
  business: {
    label: "業務システム導入",
    project: {
      name: "業務システム導入プロジェクト",
      memo: "業務確認・設定・レビュー・公開前確認を、止まる前に拾う",
    },
    tasks: [
      {
        id: "biz-1",
        title: "部門別の確認フローを整理する",
        ownerId: "m4",
        needId: "m1",
        status: "WAIT",
        category: "FLOW",
        reason: "方向相談",
        description: "誰に、どの順番で、何を確認するか。判断待ちが一点に溜まらないように流れを見る。",
      },
      {
        id: "biz-2",
        title: "マスタ設定の不明点を軽く確認する",
        ownerId: "m3",
        needId: "m2",
        status: "CHECK",
        category: "OPS",
        reason: "軽く確認",
        description: "設定値の意味が現場運用と合っているか、公開前に小さく確認する。",
      },
      {
        id: "biz-3",
        title: "移行データの例外パターンを拾う",
        ownerId: "m4",
        needId: "m3",
        status: "HELP",
        category: "OPS",
        reason: "少し手を借りたい",
        description: "CSVの例外パターンを一人で抱えず、早めに一緒に見る。",
      },
      {
        id: "biz-4",
        title: "利用者向け説明文をレビューする",
        ownerId: "m2",
        needId: "m1",
        status: "REVIEW",
        category: "DOC",
        reason: "レビュー待ち",
        description: "操作説明が現場に伝わる文になっているか、リリース前に確認する。",
      },
      {
        id: "biz-5",
        title: "本番反映前のチェックリストを作る",
        ownerId: "m1",
        needId: "m1",
        status: "DOING",
        category: "RELEASE",
        reason: "作業中",
        description: "公開前に見る項目を、担当者の記憶ではなくチェックリストに移す。",
      },
      {
        id: "biz-6",
        title: "初回説明会の資料を用意する",
        ownerId: "m2",
        needId: "m2",
        status: "TODO",
        category: "DOC",
        reason: "これから",
        description: "導入後に迷わないよう、操作の入り口だけ先に整理する。",
      },
    ],
  },
  web: {
    label: "Webサイト改修",
    project: {
      name: "Webサイト改修プロジェクト",
      memo: "文言・表示・公開確認を、レビュー待ちで止めないための改修ボード",
    },
    tasks: [
      {
        id: "web-1",
        title: "長い掲載文の表示崩れを確認する",
        ownerId: "m3",
        needId: "m2",
        status: "CHECK",
        category: "UI",
        reason: "表示確認",
        description: "PC/SPで見たときに、改行や余白が崩れていないか軽く見てほしい。",
      },
      {
        id: "web-2",
        title: "公開前の文言トーンを合わせる",
        ownerId: "m4",
        needId: "m1",
        status: "WAIT",
        category: "COPY",
        reason: "方向相談",
        description: "原稿の意図を壊さず、ページとして読みやすい表現に寄せる方針を合わせる。",
      },
      {
        id: "web-3",
        title: "サムネイル候補を出す",
        ownerId: "m2",
        needId: "m1",
        status: "TODO",
        category: "ICON",
        reason: "これから",
        description: "一覧で埋もれないよう、カードに合う見え方を検討する。",
      },
      {
        id: "web-4",
        title: "公開URLを共有する前に最終確認する",
        ownerId: "m1",
        needId: "m2",
        status: "REVIEW",
        category: "RELEASE",
        reason: "レビュー待ち",
        description: "公開後に慌てないよう、リンク・表示・文言の最終確認を置いておく。",
      },
      {
        id: "web-5",
        title: "エスケープ処理まわりを一緒に見る",
        ownerId: "m3",
        needId: "m4",
        status: "HELP",
        category: "OPS",
        reason: "少し手を借りたい",
        description: "タグが文字列として出る原因を、ソース側から確認する。",
      },
    ],
  },
  onboarding: {
    label: "新人オンボーディング",
    project: {
      name: "新人オンボーディングプロジェクト",
      memo: "質問しにくい小さな詰まりを早めに見つけ、安心して立ち上がるためのボード",
    },
    tasks: [
      {
        id: "on-1",
        title: "開発環境の初期設定で詰まりそう",
        ownerId: "m3",
        needId: "m2",
        status: "HELP",
        category: "OPS",
        reason: "少し手を借りたい",
        description: "エラーが出たところだけ一緒に見れば進めそう。重い相談にする前に置いておく。",
      },
      {
        id: "on-2",
        title: "最初のレビュー依頼の出し方を確認する",
        ownerId: "m4",
        needId: "m1",
        status: "CHECK",
        category: "FLOW",
        reason: "軽く確認",
        description: "どの粒度で依頼すればよいか、最初に合わせておく。",
      },
      {
        id: "on-3",
        title: "よくある質問をメモにする",
        ownerId: "m2",
        needId: "m2",
        status: "DOING",
        category: "DOC",
        reason: "作業中",
        description: "繰り返し出る確認を、次の人が見られる形にする。",
      },
      {
        id: "on-4",
        title: "担当範囲の境界を合わせる",
        ownerId: "m4",
        needId: "m1",
        status: "WAIT",
        category: "FLOW",
        reason: "方向相談",
        description: "どこまで自分で進めて、どこから相談するかを早めに合わせる。",
      },
      {
        id: "on-5",
        title: "初回タスクの完了条件を確認する",
        ownerId: "m1",
        needId: "m2",
        status: "REVIEW",
        category: "REVIEW",
        reason: "レビュー待ち",
        description: "できた／まだ見る、の基準を曖昧にしない。",
      },
    ],
  },
};

function cloneTasks(tasks) {
  return tasks.map((task) => ({ ...task }));
}

function getSampleTemplate(sampleId) {
  return sampleProjectTemplates[sampleId] || sampleProjectTemplates.personal;
}

const statusList = [
  "ALL",
  "TODO",
  "DOING",
  "HELP",
  "WAIT",
  "CHECK",
  "REVIEW",
  "DONE",
];

const statusDisplayLabels = {
  ALL: "すべて",
  TODO: "これから",
  DOING: "作業中",
  HELP: "手助け",
  WAIT: "方向相談",
  CHECK: "確認",
  REVIEW: "レビュー",
  DONE: "完了",
};

const statusCodeLabels = {
  ALL: "ALL",
  TODO: "TODO",
  DOING: "DOING",
  HELP: "HELP",
  WAIT: "WAIT",
  CHECK: "CHECK",
  REVIEW: "REVIEW",
  DONE: "DONE",
};

function getStatusLabel(status) {
  return statusDisplayLabels[status] || statusMeta[status]?.label || status;
}

function renderStatusLabel(status) {
  return (
    <>
      <span className="status-main-label">{getStatusLabel(status)}</span>
      {statusCodeLabels[status] && status !== "ALL" && (
        <span className="status-code-label">{statusCodeLabels[status]}</span>
      )}
    </>
  );
}

const supportClusters = ["HELP", "WAIT", "CHECK", "REVIEW"];
const flowClusters = ["TODO", "DOING", "DONE"];
const allStatuses = ["TODO", "DOING", "HELP", "WAIT", "CHECK", "REVIEW", "DONE"];
const quickSignalList = ["CHECK", "WAIT", "HELP", "REVIEW", "DONE"];
const signalStatuses = ["HELP", "WAIT", "CHECK", "REVIEW"];
const createCommandStatuses = ["HELP", "WAIT", "CHECK", "REVIEW", "TODO"];

const supportPriority = {
  HELP: 1,
  WAIT: 2,
  CHECK: 3,
  REVIEW: 4,
};

const supportActionMeta = {
  HELP: {
    label: "助かった！",
    nextStatus: "DOING",
    message: "手を借りられたら、また進めます",
  },
  WAIT: {
    label: "方向OK",
    nextStatus: "DOING",
    message: "向きが見えたら、また進めます",
  },
  CHECK: {
    label: "確認OK",
    nextStatus: "DOING",
    message: "確認できたら、また進めます",
  },
  REVIEW: {
    label: "レビューOK",
    nextStatus: "DONE",
    message: "見終わったら、完了へ進めます",
  },
};

const statusPriority = {
  HELP: 1,
  WAIT: 2,
  CHECK: 3,
  REVIEW: 4,
  DOING: 5,
  TODO: 6,
  DONE: 7,
};

const statusMeta = {
  ALL: {
    label: "すべて",
    icon: "◌",
    signal: "",
    laneTitle: "すべて",
    laneHelp: "全体を見る",
    softLabel: "全体を見る",
    summary: "全体を見る",
    bubble: "全体",
    commandTitle: "全体を見る",
    promptTitle: "全体を見たい？",
    promptDescription: "プロジェクト全体の流れを見直します。",
    titlePlaceholder: "見たいことを書いておく",
    reasonPlaceholder: "例：全体確認",
    descriptionPlaceholder: "どこを見直したいかを軽く書く",
  },
  TODO: {
    label: "これから",
    icon: "○",
    signal: "",
    laneTitle: "これから",
    laneHelp: "着手前",
    softLabel: "これから",
    summary: "まだ手をつけていない",
    bubble: "これから",
    commandTitle: "これから置く",
    promptTitle: "これから何を置く？",
    promptDescription: "まだ着手していない作業を、忘れないうちに置いておきます。",
    titlePlaceholder: "例：READMEを整える",
    reasonPlaceholder: "例：これから / 公開準備",
    descriptionPlaceholder: "これからやること、着手前に見ておきたいことを書く",
  },
  DOING: {
    label: "作業中",
    icon: "▶",
    signal: "",
    laneTitle: "作業中",
    laneHelp: "手を動かしているカード",
    softLabel: "作業中",
    summary: "いま動いている",
    bubble: "進行中",
    commandTitle: "進行中",
    promptTitle: "今進めていることは？",
    promptDescription: "現在動いている作業を見えるようにします。",
    titlePlaceholder: "例：一覧画面の表示調整",
    reasonPlaceholder: "例：作業中",
    descriptionPlaceholder: "今どこまで進んでいるか、次に何を見るかを書く",
  },
  HELP: {
    label: "手助け",
    icon: "!",
    signal: "HELP!",
    laneTitle: "HELP",
    laneHelp: "早めに拾いたい",
    softLabel: "少し手を借りたい",
    summary: "一人で抱えすぎる前のサイン",
    bubble: "HELP!",
    commandTitle: "手助けがほしい",
    promptTitle: "何に手を借りたい？",
    promptDescription: "一人で抱え込む前に、少しだけ助けてほしい場所を置きます。",
    titlePlaceholder: "例：この表示崩れを一緒に見たい",
    reasonPlaceholder: "例：表現確認 / 実装相談 / 詰まりそう",
    descriptionPlaceholder: "どこで手を借りたいか、何があると進めそうかを書く",
  },
  WAIT: {
    label: "方向相談",
    icon: "Ⅱ",
    signal: "WAIT",
    laneTitle: "WAIT",
    laneHelp: "一緒に方向を見る",
    softLabel: "方向を見たい",
    summary: "決めつける前に向きを合わせる",
    bubble: "方向!",
    commandTitle: "方向を相談する",
    promptTitle: "どの方向を一緒に見たい？",
    promptDescription: "判断を迫るのではなく、向きを合わせたい場所を置きます。",
    titlePlaceholder: "例：この仕様の方向を合わせたい",
    reasonPlaceholder: "例：方向相談 / 方針確認",
    descriptionPlaceholder: "どの選択肢で迷っているか、何を合わせたいかを書く",
  },
  CHECK: {
    label: "確認",
    icon: "?",
    signal: "CHECK",
    laneTitle: "CHECK",
    laneHelp: "軽く見てほしい",
    softLabel: "確認したい",
    summary: "小さな認識ズレを早めに確認",
    bubble: "確認!",
    commandTitle: "確認をお願いする",
    promptTitle: "どこを軽く確認したい？",
    promptDescription: "小さな認識ズレを早めにほどくためのサインです。",
    titlePlaceholder: "例：文言の見え方だけ確認したい",
    reasonPlaceholder: "例：軽く確認 / 表示確認",
    descriptionPlaceholder: "見てほしい箇所、確認したい観点を軽く書く",
  },
  REVIEW: {
    label: "レビュー",
    icon: "◎",
    signal: "REVIEW",
    laneTitle: "REVIEW",
    laneHelp: "レビュー・見直し",
    softLabel: "一度見てほしい",
    summary: "品質確認の置き場",
    bubble: "見て!",
    commandTitle: "レビューをお願いする",
    promptTitle: "何を一度見てほしい？",
    promptDescription: "完成前に見直したいもの、レビューしてほしいものを置きます。",
    titlePlaceholder: "例：テスト観点を一度見てほしい",
    reasonPlaceholder: "例：レビュー待ち / 品質確認",
    descriptionPlaceholder: "どんな観点で見てほしいかを書く",
  },
  DONE: {
    label: "完了",
    icon: "✓",
    signal: "",
    laneTitle: "DONE",
    laneHelp: "完了済み",
    softLabel: "完了",
    summary: "完了済み",
    bubble: "できた",
    commandTitle: "完了にする",
    promptTitle: "完了したことは？",
    promptDescription: "終わったことをグリーンに置きます。",
    titlePlaceholder: "例：READMEを更新した",
    reasonPlaceholder: "例：完了",
    descriptionPlaceholder: "完了内容や共有したことを書く",
  },
};

const initialCategories = [
  { id: "UI", label: "画面", icon: "◇" },
  { id: "COPY", label: "文言", icon: "✎" },
  { id: "FLOW", label: "流れ", icon: "◎" },
  { id: "REVIEW", label: "レビュー", icon: "◉" },
  { id: "ICON", label: "アイコン", icon: "✦" },
  { id: "RELEASE", label: "公開", icon: "↑" },
  { id: "DOC", label: "資料", icon: "▤" },
  { id: "OPS", label: "運用", icon: "⚙" },
];

const defaultTaskForm = {
  title: "",
  ownerId: "m1",
  needId: "m1",
  status: "HELP",
  category: "FLOW",
  reason: "少し手を借りたい",
  description: "",
};

const defaultMemberForm = {
  name: "",
  role: "",
  avatar: "",
  memo: "",
};

const defaultCategoryForm = {
  id: "",
  label: "",
  icon: "◇",
};

function createTaskId() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createMemberId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeCategoryId(value) {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toUpperCase();
}

function createAvatarFromName(name) {
  const normalized = name.trim();

  if (!normalized) {
    return "?";
  }

  const chars = Array.from(normalized.replace(/\s+/g, ""));

  if (/^[a-zA-Z0-9]+$/.test(normalized)) {
    return normalized.slice(0, 2).toUpperCase();
  }

  return chars.slice(0, 2).join("");
}

function getSafeメンバー(members) {
  return Array.isArray(members) && members.length > 0 ? members : initialメンバー;
}

function getSafeCategories(categories) {
  const defaultMap = initialCategories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {});

  if (!Array.isArray(categories) || categories.length === 0) {
    return initialCategories;
  }

  return categories.map((category) => {
    const defaultCategory = defaultMap[category.id];

    if (!defaultCategory) {
      return category;
    }

    const isOldDefaultLabel = category.label === category.id;

    return {
      ...category,
      label: isOldDefaultLabel ? defaultCategory.label : category.label,
      icon: category.icon || defaultCategory.icon,
    };
  });
}

function load保存dState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.tasks)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function App() {
  const savedState = load保存dState();

  const [project, setプロジェクト] = useState(savedState?.project || initialプロジェクト);
  const [members, setメンバー] = useState(getSafeメンバー(savedState?.members));
  const [categories, setCategories] = useState(
    getSafeCategories(savedState?.categories)
  );
  const [tasks, setTasks] = useState(savedState?.tasks || cloneTasks(initialTasks));
  const [activeSampleId, setActiveSampleId] = useState(savedState?.activeSampleId || "personal");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeBoardTab, setActiveBoardTab] = useState("progress");
  const [isProgressTimelineOpen, setIsProgressTimelineOpen] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isプロジェクトEditing, setIsプロジェクトEditing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(defaultTaskForm);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState(defaultMemberForm);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
  const [saveNotice, set保存Notice] = useState("保存済み");
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(() => {
    return localStorage.getItem(INTRO_STORAGE_KEY) !== "seen";
  });
  const hasMountedRef = useRef(false);
  const saveNoticeTimerRef = useRef(null);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || null;
  const selectedMember =
    members.find((member) => member.id === selectedMemberId) || null;

  const fallbackMemberId = members[0]?.id || "m1";
  const fallbackCategoryId = categories[0]?.id || "FLOW";

  const categoryMeta = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {});
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        project,
        members,
        categories,
        tasks,
        activeSampleId,
        updatedAt: new Date().toISOString(),
      })
    );

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    set保存Notice("保存しました");

    if (saveNoticeTimerRef.current) {
      window.clearTimeout(saveNoticeTimerRef.current);
    }

    saveNoticeTimerRef.current = window.setTimeout(() => {
      set保存Notice("保存済み");
    }, 1200);
  }, [project, members, categories, tasks, activeSampleId]);

  useEffect(() => {
    return () => {
      if (saveNoticeTimerRef.current) {
        window.clearTimeout(saveNoticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedTask) {
      return;
    }

    setTaskForm({
      title: selectedTask.title,
      ownerId: selectedTask.ownerId,
      needId: selectedTask.needId,
      status: selectedTask.status,
      category: selectedTask.category,
      reason: selectedTask.reason,
      description: selectedTask.description,
    });
  }, [selectedTask]);

  const signalTasks = useMemo(() => {
    return tasks.filter((task) => signalStatuses.includes(task.status));
  }, [tasks]);

  const supportQueue = useMemo(() => {
    return [...signalTasks].sort((a, b) => {
      return supportPriority[a.status] - supportPriority[b.status];
    });
  }, [signalTasks]);

  const nextSupportTask = supportQueue[0] || null;
  const completedCount = tasks.filter((task) => task.status === "DONE").length;

  const active拾うサイン = {
    HELP: tasks.filter((task) => task.status === "HELP").length,
    WAIT: tasks.filter((task) => task.status === "WAIT").length,
    CHECK: tasks.filter((task) => task.status === "CHECK").length,
    REVIEW: tasks.filter((task) => task.status === "REVIEW").length,
  };

  const visibleSupportClusters = useMemo(() => {
    if (activeFilter === "ALL") {
      return supportClusters;
    }

    return supportClusters.includes(activeFilter) ? [activeFilter] : [];
  }, [activeFilter]);

  const visibleFlowClusters = useMemo(() => {
    if (activeFilter === "ALL") {
      return flowClusters;
    }

    return flowClusters.includes(activeFilter) ? [activeFilter] : [];
  }, [activeFilter]);

  useEffect(() => {
    if (flowClusters.includes(activeFilter)) {
      setIsProgressTimelineOpen(true);
    }
  }, [activeFilter]);

  const getMember = (memberId) => {
    return members.find((member) => member.id === memberId) || members[0];
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const getCurrentTaskForMember = (memberId) => {
    const memberTasks = tasks
      .filter((task) => task.ownerId === memberId)
      .sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

    return memberTasks.find((task) => task.status !== "DONE") || null;
  };

  const getMemberStatusList = (memberId) => {
    const uniqueStatuses = [
      ...new Set(
        tasks
          .filter((task) => task.ownerId === memberId && task.status !== "DONE")
          .map((task) => task.status)
      ),
    ];

    return uniqueStatuses.sort(
      (a, b) => statusPriority[a] - statusPriority[b]
    );
  };

  const updateTaskStatus = (taskId, nextStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );

    setFocusedTaskId(taskId);
  };

  const resolveSupportTask = (task, shouldScroll = false) => {
    const action = supportActionMeta[task.status];

    if (!action) {
      if (shouldScroll) {
        scrollToTask(task.id);
      }
      return;
    }

    updateTaskStatus(task.id, action.nextStatus);

    if (shouldScroll) {
      window.setTimeout(() => {
        scrollToTask(task.id);
      }, 80);
    }
  };

  const updateTask = (taskId, nextTask) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, ...nextTask } : task
      )
    );

    setFocusedTaskId(taskId);
  };

  const createTask = () => {
    const trimmedTitle = taskForm.title.trim();

    if (!trimmedTitle) {
      return;
    }

    const nextTask = {
      id: createTaskId(),
      title: trimmedTitle,
      ownerId: taskForm.ownerId || fallbackMemberId,
      needId: taskForm.needId || fallbackMemberId,
      status: taskForm.status,
      category: categoryMeta[taskForm.category] ? taskForm.category : fallbackCategoryId,
      reason: taskForm.reason.trim() || statusMeta[taskForm.status].softLabel,
      description:
        taskForm.description.trim() ||
        "まだ詳細は仮置きです。止まる前にサインを置いています。",
    };

    setTasks((currentTasks) => [nextTask, ...currentTasks]);
    setFocusedTaskId(nextTask.id);
    setSelectedTaskId(nextTask.id);
    setIsCreateModalOpen(false);
    setTaskForm({
      ...defaultTaskForm,
      ownerId: fallbackMemberId,
      needId: fallbackMemberId,
      category: fallbackCategoryId,
    });

    window.setTimeout(() => {
      scrollToTask(nextTask.id);
    }, 120);
  };

  const saveSelectedTask = () => {
    if (!selectedTask) {
      return;
    }

    const trimmedTitle = taskForm.title.trim();

    if (!trimmedTitle) {
      return;
    }

    updateTask(selectedTask.id, {
      title: trimmedTitle,
      ownerId: taskForm.ownerId || fallbackMemberId,
      needId: taskForm.needId || fallbackMemberId,
      status: taskForm.status,
      category: categoryMeta[taskForm.category] ? taskForm.category : fallbackCategoryId,
      reason: taskForm.reason.trim() || statusMeta[taskForm.status].softLabel,
      description:
        taskForm.description.trim() ||
        "まだ詳細は仮置きです。止まる前にサインを置いています。",
    });
  };

  const closeSelectedTask = () => {
    if (!selectedTask) {
      return;
    }

    updateTaskStatus(selectedTask.id, "DONE");
  };

  const deleteSelectedTask = () => {
    if (!selectedTask) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== selectedTask.id)
    );

    setSelectedTaskId(null);
  };

  const applySampleProject = (sampleId) => {
    const sample = getSampleTemplate(sampleId);

    setActiveSampleId(sampleId);
    setプロジェクト(sample.project);
    setメンバー(initialメンバー);
    setCategories(initialCategories);
    setTasks(cloneTasks(sample.tasks));
    setActiveFilter("ALL");
    setActiveBoardTab("progress");
    setIsProgressTimelineOpen(false);
    setSelectedTaskId(null);
    setFocusedTaskId(null);
    setSelectedMemberId(null);
  };

  const closeIntroModal = () => {
    localStorage.setItem(INTRO_STORAGE_KEY, "seen");
    setIsIntroModalOpen(false);
  };

  const resetBoard = () => {
    const sample = getSampleTemplate(activeSampleId);
    setプロジェクト(sample.project);
    setメンバー(initialメンバー);
    setCategories(initialCategories);
    setTasks(cloneTasks(sample.tasks));
    setActiveFilter("ALL");
    setActiveBoardTab("progress");
    setIsProgressTimelineOpen(false);
    setSelectedTaskId(null);
    setFocusedTaskId(null);
    setSelectedMemberId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const scrollToTask = (taskId) => {
    const targetTask = tasks.find((task) => task.id === taskId);
    setActiveFilter("ALL");
    setActiveBoardTab(
      targetTask && signalStatuses.includes(targetTask.status) ? "signals" : "progress"
    );
    setFocusedTaskId(taskId);

    window.setTimeout(() => {
      const target = document.getElementById(`task-${taskId}`);

      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, 80);
  };

  const handleMemberClick = (memberId) => {
    const currentTask = getCurrentTaskForMember(memberId);

    if (!currentTask) {
      return;
    }

    scrollToTask(currentTask.id);
  };

  const handleDragStart = (event, taskId) => {
    setDraggingTaskId(taskId);
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverStatus(null);
  };

  const handleClusterDragOver = (event, status) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  };

  const handleClusterDrop = (event, status) => {
    event.preventDefault();

    const droppedTaskId =
      event.dataTransfer.getData("text/plain") || draggingTaskId;

    if (!droppedTaskId) {
      return;
    }

    updateTaskStatus(droppedTaskId, status);
    setDraggingTaskId(null);
    setDragOverStatus(null);
  };

  const openTaskModal = (taskId) => {
    setSelectedTaskId(taskId);
    setFocusedTaskId(taskId);
  };

  const closeTaskModal = () => {
    setSelectedTaskId(null);
  };

  const openCreateModal = () => {
    const initialStatus = "HELP";
    setTaskForm({
      ...defaultTaskForm,
      status: initialStatus,
      reason: statusMeta[initialStatus].softLabel,
      ownerId: fallbackMemberId,
      needId: fallbackMemberId,
      category: fallbackCategoryId,
    });
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setTaskForm({
      ...defaultTaskForm,
      ownerId: fallbackMemberId,
      needId: fallbackMemberId,
      category: fallbackCategoryId,
    });
  };

  const updateTaskForm = (field, value) => {
    setTaskForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const chooseCreateStatus = (status) => {
    setTaskForm((current) => ({
      ...current,
      status,
      reason:
        current.reason === "" ||
        Object.values(statusMeta).some((meta) => meta.softLabel === current.reason)
          ? statusMeta[status].softLabel
          : current.reason,
    }));
  };

  const openMemberCreateModal = () => {
    setSelectedMemberId(null);
    setMemberForm(defaultMemberForm);
    setIsMemberModalOpen(true);
  };

  const openMemberEditModal = (event, memberId) => {
    event.stopPropagation();
    const member = getMember(memberId);

    if (!member) {
      return;
    }

    setSelectedMemberId(member.id);
    setMemberForm({
      name: member.name,
      role: member.role,
      avatar: member.avatar,
      memo: member.memo,
    });
    setIsMemberModalOpen(true);
  };

  const closeMemberModal = () => {
    setSelectedMemberId(null);
    setMemberForm(defaultMemberForm);
    setIsMemberModalOpen(false);
  };

  const updateMemberForm = (field, value) => {
    setMemberForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveMember = () => {
    const trimmedName = memberForm.name.trim();

    if (!trimmedName) {
      return;
    }

    const nextMember = {
      id: selectedMemberId || createMemberId(),
      name: trimmedName,
      role: memberForm.role.trim() || "チームメンバー",
      avatar: memberForm.avatar.trim() || createAvatarFromName(trimmedName),
      memo: memberForm.memo.trim() || "プロジェクトを前に進めるメンバー",
    };

    if (selectedMemberId) {
      setメンバー((currentメンバー) =>
        currentメンバー.map((member) =>
          member.id === selectedMemberId ? nextMember : member
        )
      );
    } else {
      setメンバー((currentメンバー) => [...currentメンバー, nextMember]);
    }

    closeMemberModal();
  };

  const deleteMember = () => {
    if (!selectedMemberId || members.length <= 1) {
      return;
    }

    const replacementMember = members.find(
      (member) => member.id !== selectedMemberId
    );

    if (!replacementMember) {
      return;
    }

    setメンバー((currentメンバー) =>
      currentメンバー.filter((member) => member.id !== selectedMemberId)
    );

    setTasks((currentTasks) =>
      currentTasks.map((task) => ({
        ...task,
        ownerId:
          task.ownerId === selectedMemberId ? replacementMember.id : task.ownerId,
        needId:
          task.needId === selectedMemberId ? replacementMember.id : task.needId,
      }))
    );

    closeMemberModal();
  };


  const openCategoryCreateModal = () => {
    setSelectedCategoryId(null);
    setCategoryForm(defaultCategoryForm);
    setIsCategoryModalOpen(true);
  };

  const openCategoryEditModal = (categoryId) => {
    const category = categoryMeta[categoryId];

    if (!category) {
      return;
    }

    setSelectedCategoryId(category.id);
    setCategoryForm({
      id: category.id,
      label: category.label,
      icon: category.icon,
    });
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setSelectedCategoryId(null);
    setCategoryForm(defaultCategoryForm);
    setIsCategoryModalOpen(false);
  };

  const updateCategoryForm = (field, value) => {
    setCategoryForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveCategory = () => {
    const nextId = normalizeCategoryId(categoryForm.id);
    const nextLabel = categoryForm.label.trim() || nextId;
    const nextIcon = categoryForm.icon.trim().slice(0, 2) || "◇";

    if (!nextId) {
      return;
    }

    const idExists = categories.some(
      (category) => category.id === nextId && category.id !== selectedCategoryId
    );

    if (idExists) {
      return;
    }

    if (selectedCategoryId) {
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === selectedCategoryId
            ? { id: nextId, label: nextLabel, icon: nextIcon }
            : category
        )
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.category === selectedCategoryId ? { ...task, category: nextId } : task
        )
      );
    } else {
      setCategories((currentCategories) => [
        ...currentCategories,
        { id: nextId, label: nextLabel, icon: nextIcon },
      ]);
    }

    closeCategoryModal();
  };

  const deleteCategory = () => {
    if (!selectedCategoryId || categories.length <= 1) {
      return;
    }

    const replacementCategory = categories.find(
      (category) => category.id !== selectedCategoryId
    );

    if (!replacementCategory) {
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== selectedCategoryId)
    );

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.category === selectedCategoryId
          ? { ...task, category: replacementCategory.id }
          : task
      )
    );

    if (taskForm.category === selectedCategoryId) {
      setTaskForm((current) => ({
        ...current,
        category: replacementCategory.id,
      }));
    }

    closeCategoryModal();
  };

  const renderCreateCommandPicker = () => {
    return (
      <div className="command-picker">
        {createCommandStatuses.map((status) => (
          <button
            key={`create-command-${status}`}
            type="button"
            className={`command-card ${status} ${
              taskForm.status === status ? "active" : ""
            }`}
            onClick={() => chooseCreateStatus(status)}
          >
            <span className={`command-icon ${status}`}>
              {statusMeta[status].icon}
            </span>
            <strong>{statusMeta[status].commandTitle}</strong>
            <small>{statusMeta[status].summary}</small>
          </button>
        ))}
      </div>
    );
  };

  const renderTaskFields = () => {
    const currentMeta = statusMeta[taskForm.status];

    return (
      <div className="edit-form-grid">
        <label className="form-field wide">
          <span>タイトル</span>
          <input
            value={taskForm.title}
            onChange={(event) => updateTaskForm("title", event.target.value)}
            placeholder={currentMeta.titlePlaceholder}
          />
        </label>

        <label className="form-field">
          <span>担当者</span>
          <select
            value={taskForm.ownerId}
            onChange={(event) => updateTaskForm("ownerId", event.target.value)}
          >
            {members.map((member) => (
              <option key={`owner-${member.id}`} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>相手</span>
          <select
            value={taskForm.needId}
            onChange={(event) => updateTaskForm("needId", event.target.value)}
          >
            {members.map((member) => (
              <option key={`need-${member.id}`} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>状態</span>
          <select
            value={taskForm.status}
            onChange={(event) => chooseCreateStatus(event.target.value)}
          >
            {allStatuses.map((status) => (
              <option value={status} key={`status-${status}`}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>カテゴリ</span>
          <select
            value={taskForm.category}
            onChange={(event) => updateTaskForm("category", event.target.value)}
          >
            {categories.map((category) => (
              <option value={category.id} key={`category-${category.id}`}>
                {category.id}：{category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field wide">
          <span>理由</span>
          <input
            value={taskForm.reason}
            onChange={(event) => updateTaskForm("reason", event.target.value)}
            placeholder={currentMeta.reasonPlaceholder}
          />
        </label>

        <label className="form-field wide">
          <span>説明</span>
          <textarea
            value={taskForm.description}
            onChange={(event) =>
              updateTaskForm("description", event.target.value)
            }
            placeholder={currentMeta.descriptionPlaceholder}
            rows={4}
          />
        </label>
      </div>
    );
  };

  const renderTaskCard = (task) => {
    const owner = getMember(task.ownerId);
    const needMember = getMember(task.needId);
    const category = categoryMeta[task.category] || categoryMeta[fallbackCategoryId];

    return (
      <div
        key={task.id}
        className={`task-card-wrap status-${task.status} ${
          focusedTaskId === task.id ? "focused" : ""
        }`}
      >
        <div className={`task-speech-bubble ${task.status}`}>
          <span>{statusMeta[task.status].bubble}</span>
        </div>

        <article
          id={`task-${task.id}`}
          className={`task-card status-${task.status} ${
            draggingTaskId === task.id ? "dragging" : ""
          } ${focusedTaskId === task.id ? "focused" : ""}`}
          draggable
          role="button"
          tabIndex={0}
          onClick={() => openTaskModal(task.id)}
          onDragStart={(event) => handleDragStart(event, task.id)}
          onDragEnd={handleDragEnd}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openTaskModal(task.id);
            }
          }}
        >
          <div className="drag-handle" title="ドラッグして状態を移動">
            <span />
            <span />
            <span />
          </div>

          <div className="task-card-top">
            <div className="task-meta-left">
              <span className={`task-status-pill ${task.status}`}>
                {renderStatusLabel(task.status)}
              </span>

              <span className="category-pill">
                <span>{category?.icon}</span>
                {category?.label}
              </span>
            </div>

            <span className="task-owner">{owner?.name}</span>
          </div>

          <h3>{task.title}</h3>

          <div className="task-info-row">
            <span className={`reason-chip ${task.status}`}>{task.reason}</span>
            <span className="need-chip">相手: {needMember?.name}</span>
          </div>

          <p className="compact-hint">クリックで編集・作戦を見る</p>
        </article>
      </div>
    );
  };

  const renderCluster = (status) => {
    const clusterTasks = getTasksByStatus(status);
    const isDragOver = dragOverStatus === status;

    return (
      <section
        key={status}
        className={`status-cluster cluster-${status} ${
          isDragOver ? "drag-over" : ""
        } ${clusterTasks.length > 0 ? "has-items" : ""}`}
        onDragOver={(event) => handleClusterDragOver(event, status)}
        onDragLeave={() => setDragOverStatus(null)}
        onDrop={(event) => handleClusterDrop(event, status)}
      >
        <div className="cluster-header">
          <div className="cluster-title-row">
            <span className={`cluster-icon ${status}`}>
              {statusMeta[status].icon}
            </span>

            <div>
              <h3>{getStatusLabel(status)}</h3>
              <p className="status-code-caption">{statusCodeLabels[status]}</p>
            </div>
          </div>

          <div className="cluster-status-right">
            {clusterTasks.length > 0 && <span className="signal-on">サインあり</span>}
            <span className="cluster-count">{clusterTasks.length}</span>
          </div>
        </div>

        <div className="cluster-helper">{statusMeta[status].laneHelp}</div>

        <div className="cluster-drop-zone">
          {clusterTasks.length > 0 ? (
            clusterTasks.map((task) => renderTaskCard(task))
          ) : (
            <div className="cluster-empty">
              <span>{statusMeta[status].icon}</span>
              <p>ここにカードを置けます</p>
            </div>
          )}
        </div>
      </section>
    );
  };


  const renderIntroModal = () => {
    if (!isIntroModalOpen) {
      return null;
    }

    return (
      <div className="modal-backdrop" onClick={closeIntroModal}>
        <section
          className="task-modal intro-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-modal-title"
        >
          <div className="modal-top">
            <div className="modal-title-block">
              <p className="eyebrow">はじめに</p>
              <h2 id="intro-modal-title">Stuck Map は、詰まりを見るボードです</h2>
            </div>

            <button
              className="modal-close"
              type="button"
              onClick={closeIntroModal}
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <div className="intro-message-box">
            <strong>誰が遅いかではなく、何が詰まっているかを見る。</strong>
            <p>
              Stuck Map は、プロジェクトの詰まりを早く見つけて助け合うための進行支援ボードです。
              HELP・確認・方向相談・レビューを、責める材料ではなく早めに拾うサインとして扱います。
            </p>
          </div>

          <div className="intro-grid">
            <div>
              <span>1</span>
              <strong>小さく出す</strong>
              <p>重い報告になる前に、HELP や確認を短文で置きます。</p>
            </div>
            <div>
              <span>2</span>
              <strong>拾う場所を見る</strong>
              <p>右側のキューで、次に見ると流れそうなサインを確認します。</p>
            </div>
            <div>
              <span>3</span>
              <strong>流れに戻す</strong>
              <p>助かったら作業中へ。レビューが終わったら完了へ戻します。</p>
            </div>
          </div>

          <div className="modal-button-row">
            <button type="button" className="primary-action" onClick={closeIntroModal}>
              ボードを見る
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderCreateModal = () => {
    if (!isCreateModalOpen) {
      return null;
    }

    const currentMeta = statusMeta[taskForm.status];

    return (
      <div className="modal-backdrop" onClick={closeCreateModal}>
        <section
          className="task-modal create-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-modal-title"
        >
          <div className="modal-top">
            <div className="modal-title-block">
              <p className="eyebrow">サイン選択</p>
              <h2 id="create-modal-title">サインを置く</h2>
            </div>

            <button
              className="modal-close"
              type="button"
              onClick={closeCreateModal}
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <p className="modal-description">
            まずサインを選ぶ。細かい整理はあとでOK。
          </p>

          {renderCreateCommandPicker()}

          <div className={`command-guide ${taskForm.status}`}>
            <span>{currentMeta.icon}</span>
            <div>
              <strong>{currentMeta.promptTitle}</strong>
              <p>{currentMeta.promptDescription}</p>
            </div>
          </div>

          {renderTaskFields()}

          <div className="modal-button-row">
            <button
              type="button"
              className="secondary-action"
              onClick={closeCreateModal}
            >
              やめる
            </button>

            <button type="button" className="primary-action" onClick={createTask}>
              サインを置く
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderTaskModal = () => {
    if (!selectedTask) {
      return null;
    }

    const owner = getMember(selectedTask.ownerId);
    const needMember = getMember(selectedTask.needId);
    const category =
      categoryMeta[selectedTask.category] || categoryMeta[fallbackCategoryId];

    return (
      <div className="modal-backdrop" onClick={closeTaskModal}>
        <section
          className={`task-modal status-${selectedTask.status}`}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
        >
          <div className="modal-top">
            <div className="modal-title-block">
              <p className="eyebrow">詳細・編集</p>
              <h2 id="task-modal-title">{selectedTask.title}</h2>
            </div>

            <button
              className="modal-close"
              type="button"
              onClick={closeTaskModal}
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <div className="modal-status-row">
            <span className={`task-status-pill ${selectedTask.status}`}>
              {renderStatusLabel(selectedTask.status)}
            </span>

            <span className="category-pill">
              <span>{category?.icon}</span>
              {category?.label}
            </span>

            <span className="task-owner">{owner?.name}</span>
          </div>

          <p className="modal-description">{selectedTask.description}</p>

          <div className="modal-info-grid">
            <div>
              <span>今の状態</span>
              <strong>{statusMeta[selectedTask.status].softLabel}</strong>
            </div>

            <div>
              <span>発信</span>
              <strong>{owner?.name}</strong>
            </div>

            <div>
              <span>相手</span>
              <strong>{needMember?.name}</strong>
            </div>

            <div>
              <span>理由</span>
              <strong>{selectedTask.reason}</strong>
            </div>
          </div>

          <div className="modal-message">
            <strong>サインは仮置きでOK。</strong>
            <p>
              正しく分類することより、止まる前に置いておくことを優先します。
            </p>
          </div>

          <div className="modal-actions">
            <p className="modal-section-title">軽くサインを置く</p>

            <div className="modal-action-grid">
              {quickSignalList.map((status) => (
                <button
                  key={`modal-${selectedTask.id}-${status}`}
                  type="button"
                  className={`modal-action ${status} ${
                    selectedTask.status === status ? "active" : ""
                  }`}
                  onClick={() => {
                    updateTaskStatus(selectedTask.id, status);
                    updateTaskForm("status", status);
                  }}
                >
                  <span>{statusMeta[status].icon}</span>
                  <strong>{statusMeta[status].softLabel}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="edit-block">
            <p className="modal-section-title">内容を編集する</p>
            {renderTaskFields()}
          </div>

          <div className="modal-button-row split">
            <div className="danger-zone">
              <button
                type="button"
                className="secondary-action"
                onClick={closeSelectedTask}
              >
                完了にする
              </button>

              <button
                type="button"
                className="danger-action"
                onClick={deleteSelectedTask}
              >
                削除
              </button>
            </div>

            <div className="save-zone">
              <button
                type="button"
                className="secondary-action"
                onClick={closeTaskModal}
              >
                閉じる
              </button>

              <button
                type="button"
                className="primary-action"
                onClick={saveSelectedTask}
              >
                保存する
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderMemberModal = () => {
    if (!isMemberModalOpen) {
      return null;
    }

    return (
      <div className="modal-backdrop" onClick={closeMemberModal}>
        <section
          className="task-modal member-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-modal-title"
        >
          <div className="modal-top">
            <div className="modal-title-block">
              <p className="eyebrow">メンバー設定</p>
              <h2 id="member-modal-title">
                {selectedMember ? "メンバーを編集" : "メンバーを追加"}
              </h2>
            </div>

            <button
              className="modal-close"
              type="button"
              onClick={closeMemberModal}
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <div className="edit-form-grid">
            <label className="form-field">
              <span>名前</span>
              <input
                value={memberForm.name}
                onChange={(event) => updateMemberForm("name", event.target.value)}
                placeholder="例：リーダー"
              />
            </label>

            <label className="form-field">
              <span>アイコン</span>
              <input
                value={memberForm.avatar}
                onChange={(event) =>
                  updateMemberForm("avatar", event.target.value)
                }
                placeholder="例：S"
                maxLength={2}
              />
            </label>

            <label className="form-field wide">
              <span>役割</span>
              <input
                value={memberForm.role}
                onChange={(event) => updateMemberForm("role", event.target.value)}
                placeholder="例：レビュー担当 / 実装担当"
              />
            </label>

            <label className="form-field wide">
              <span>メモ</span>
              <textarea
                value={memberForm.memo}
                onChange={(event) => updateMemberForm("memo", event.target.value)}
                placeholder="この人がどんな支え方をするか"
                rows={3}
              />
            </label>
          </div>

          <div className="modal-button-row split">
            <div className="danger-zone">
              {selectedMember && (
                <button
                  type="button"
                  className="danger-action"
                  onClick={deleteMember}
                  disabled={members.length <= 1}
                >
                  削除
                </button>
              )}
            </div>

            <div className="save-zone">
              <button
                type="button"
                className="secondary-action"
                onClick={closeMemberModal}
              >
                閉じる
              </button>

              <button type="button" className="primary-action" onClick={saveMember}>
                保存する
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  };


  const renderCategoryModal = () => {
    if (!isCategoryModalOpen) {
      return null;
    }

    const isEditing = Boolean(selectedCategoryId);
    const normalizedPreview = normalizeCategoryId(categoryForm.id);
    const duplicateExists = categories.some(
      (category) => category.id === normalizedPreview && category.id !== selectedCategoryId
    );

    return (
      <div className="modal-backdrop" onClick={closeCategoryModal}>
        <section
          className="task-modal category-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-top">
            <div className="modal-title-block">
              <p className="eyebrow">カテゴリ設定</p>
              <h2 id="category-modal-title">
                {isEditing ? "カテゴリを編集する" : "カテゴリを追加する"}
              </h2>
            </div>

            <button
              className="modal-close"
              type="button"
              onClick={closeCategoryModal}
              aria-label="カテゴリ設定を閉じる"
            >
              ×
            </button>
          </div>

          <p className="modal-description">
            サインに付ける分類を編集できます。削除したカテゴリを使っていたカードは、別カテゴリへ退避します。
          </p>

          <div className="category-manager-grid">
            <div className="category-list-box">
              <p className="modal-section-title">現在のカテゴリ</p>

              <div className="category-list">
                {categories.map((category) => (
                  <button
                    key={`category-edit-${category.id}`}
                    type="button"
                    className={`category-edit-chip ${
                      selectedCategoryId === category.id ? "active" : ""
                    }`}
                    onClick={() => openCategoryEditModal(category.id)}
                  >
                    <span>{category.icon}</span>
                    <strong>{category.id}</strong>
                    <small>{category.label}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="category-form-box">
              <div className="edit-form-grid single-column">
                <label className="form-field wide">
                  <span>カテゴリID</span>
                  <input
                    value={categoryForm.id}
                    onChange={(event) => updateCategoryForm("id", event.target.value)}
                    placeholder="例：DESIGN"
                    disabled={isEditing}
                  />
                </label>

                <label className="form-field wide">
                  <span>表示名</span>
                  <input
                    value={categoryForm.label}
                    onChange={(event) =>
                      updateCategoryForm("label", event.target.value)
                    }
                    placeholder="例：デザイン"
                  />
                </label>

                <label className="form-field wide">
                  <span>アイコン</span>
                  <input
                    value={categoryForm.icon}
                    onChange={(event) => updateCategoryForm("icon", event.target.value)}
                    placeholder="例：◇"
                  />
                </label>
              </div>

              <p className={`form-note ${duplicateExists ? "error" : ""}`}>
                {duplicateExists
                  ? "同じカテゴリIDがすでにあります。"
                  : `保存ID：${normalizedPreview || "未入力"}`}
              </p>
            </div>
          </div>

          <div className="modal-button-row split">
            <div>
              {isEditing && (
                <button
                  type="button"
                  className="danger-action"
                  onClick={deleteCategory}
                  disabled={categories.length <= 1}
                >
                  カテゴリを削除
                </button>
              )}
            </div>

            <div className="button-row-right">
              <button
                type="button"
                className="secondary-action"
                onClick={openCategoryCreateModal}
              >
                新規入力
              </button>
              <button
                type="button"
                className="primary-action"
                onClick={saveCategory}
                disabled={!normalizedPreview || duplicateExists}
              >
                保存する
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <main className="app-shell">
      <div className="bg-grid" />
      <div className="bg-water water-a" />
      <div className="bg-water water-b" />
      <div className="bg-water water-c" />
      <div className="ripple ripple-a" />
      <div className="ripple ripple-b" />

      <div className="app-frame">
        <header className="topbar surface">
          <div className="topbar-left">
            <div className="logo-mark">
              <span />
            </div>

            <div>
              <p className="eyebrow">プロジェクトボード</p>
              <strong>Stuck Map</strong>
            </div>
          </div>

          <div className="project-title-area">
            {isプロジェクトEditing ? (
              <div className="project-edit-inline">
                <input
                  value={project.name}
                  onChange={(event) =>
                    setプロジェクト((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  aria-label="プロジェクト名"
                />

                <input
                  value={project.memo}
                  onChange={(event) =>
                    setプロジェクト((current) => ({
                      ...current,
                      memo: event.target.value,
                    }))
                  }
                  aria-label="プロジェクトメモ"
                />

                <button
                  type="button"
                  className="secondary-action compact-button"
                  onClick={() => setIsプロジェクトEditing(false)}
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="project-name-button"
                onClick={() => setIsプロジェクトEditing(true)}
              >
                <span>プロジェクト</span>
                <strong>{project.name || "Untitled プロジェクト"}</strong>
                <small>{project.memo}</small>
              </button>
            )}
          </div>

          <div className="topbar-actions">
            <div
              className={`save-indicator ${
                saveNotice === "保存しました" ? "saved-pop" : ""
              }`}
              aria-live="polite"
            >
              <span />
              {saveNotice}
            </div>

            <button type="button" className="primary-action" onClick={openCreateModal}>
              + サインを置く
            </button>

            <button
              type="button"
              className="secondary-action"
              onClick={openCategoryCreateModal}
            >
              カテゴリ設定
            </button>

            <button
              type="button"
              className="secondary-action"
              onClick={() => setIsIntroModalOpen(true)}
            >
              説明
            </button>

            <button type="button" className="secondary-action" onClick={resetBoard}>
              リセット
            </button>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy-block surface">
            <p className="eyebrow">チーム進行ボード</p>
            <h1>Stuck Map</h1>
            <p className="hero-copy">
              今どこを見れば、チームが前に進むか。
              <br />
              小さなサインを置いて、止まる前に流れをつなぐ。
            </p>

            <div className="hero-tags">
              <span>HELPは作戦サイン</span>
              <span>確認は軽く出す</span>
              <span>方向は早めに合わせる</span>
              <span>完了はグリーン</span>
            </div>

            <div className="purpose-panel-inline">
              <strong>このボードの目的</strong>
              <p>
                誰が遅いかではなく、何が詰まっているかを見る。
                Stuck Map は、プロジェクトの詰まりを早く見つけて助け合うための進行支援ボードです。
              </p>
            </div>
          </div>

          <div className="hero-card surface">
            <p className="eyebrow">今の目的</p>
            <strong>{project.name}</strong>
            <span>{project.memo}</span>

            <div className="concept-lines">
              <div>
                <b>Not</b>
                <span>ひとりで抱え込む</span>
              </div>
              <div>
                <b>Do</b>
                <span>小さく出して、みんなで進める</span>
              </div>
            </div>

            <div className="sample-switcher">
              <label htmlFor="sample-project-select">サンプルプロジェクト</label>
              <select
                id="sample-project-select"
                value={activeSampleId}
                onChange={(event) => applySampleProject(event.target.value)}
              >
                {Object.entries(sampleProjectTemplates).map(([sampleId, sample]) => (
                  <option key={sampleId} value={sampleId}>
                    {sample.label}
                  </option>
                ))}
              </select>
              <small>用途を切り替えると、初見でも使いどころを想像しやすくなります。</small>
            </div>
          </div>
        </section>

        <section className="summary-grid">
          <div className="summary-card surface">
            <span className="summary-label">サイン</span>
            <strong className="summary-value">{tasks.length}</strong>
            <p>いま見えている作業</p>
          </div>

          <div className="summary-card surface done-summary">
            <span className="summary-label">完了</span>
            <strong className="summary-value">{completedCount}</strong>
            <p>グリーンになった作業</p>
          </div>

          <div className="summary-card surface summary-highlight">
            <span className="summary-label">拾うサイン</span>
            <strong className="summary-value">{signalTasks.length}</strong>
            <p>拾いたいサイン</p>
          </div>

          <div className="summary-card surface">
            <span className="summary-label">保存状態</span>
            <strong className="summary-value summary-text">保存済み</strong>
            <p>変更は自動で保存されます</p>
          </div>
        </section>

        <section className="board-layout">
          <aside className="panel members-panel surface">
            <div className="panel-heading panel-heading-row">
              <div>
                <p className="eyebrow">メンバー</p>
                <h2>チーム</h2>
                <p className="panel-subtext">
                  メンバーをクリックすると、今拾いたいタスクへ移動します。
                </p>
              </div>

              <button
                type="button"
                className="small-panel-action"
                onClick={openMemberCreateModal}
              >
                + 追加
              </button>
            </div>

            <div className="member-list">
              {members.map((member) => {
                const currentTask = getCurrentTaskForMember(member.id);
                const memberStatuses = getMemberStatusList(member.id);

                const signalTask =
                  currentTask && signalStatuses.includes(currentTask.status)
                    ? currentTask
                    : null;

                const bubbleStatus = signalTask ? signalTask.status : "FLOW";

                return (
                  <article
                    key={member.id}
                    role="button"
                    tabIndex={currentTask ? 0 : -1}
                    aria-disabled={!currentTask}
                    className={`member-card ${!currentTask ? "disabled" : ""}`}
                    onClick={() => handleMemberClick(member.id)}
                    onKeyDown={(event) => {
                      if (!currentTask) {
                        return;
                      }

                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleMemberClick(member.id);
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="member-edit-button"
                      onClick={(event) => openMemberEditModal(event, member.id)}
                    >
                      編集
                    </button>

                    <div className="avatar-wrap">
                      <div className="avatar">{member.avatar}</div>

                      <span className={`speech-bubble ${bubbleStatus}`}>
                        {signalTask
                          ? statusMeta[signalTask.status].signal
                          : "進行"}
                      </span>
                    </div>

                    <div className="member-body">
                      <div className="member-topline">
                        <div className="member-name-row">
                          <h3>{member.name}</h3>

                          <div className="member-status-row">
                            {memberStatuses.length > 0 ? (
                              memberStatuses.map((status) => (
                                <span
                                  className={`member-status-dot ${status}`}
                                  key={`${member.id}-${status}`}
                                  title={statusMeta[status].label}
                                >
                                  {statusMeta[status].icon}
                                </span>
                              ))
                            ) : (
                              <span className="member-status-dot DONE">✓</span>
                            )}
                          </div>
                        </div>

                        <span className="member-role-pill">{member.role}</span>
                      </div>

                      <small>{member.memo}</small>

                      <div className="member-task-chip">
                        <span
                          className={`member-task-icon ${
                            currentTask ? currentTask.status : "DONE"
                          }`}
                        >
                          {currentTask
                            ? statusMeta[currentTask.status].icon
                            : "✓"}
                        </span>

                        <span className="member-task-text">
                          <span className="member-task-label">
                            {currentTask ? "今のカード" : "クリア"}
                          </span>
                          <strong>
                            {currentTask
                              ? currentTask.title
                              : "今は大きなサインなし"}
                          </strong>
                        </span>

                        <span
                          className={`mini-status ${
                            currentTask ? currentTask.status : "DONE"
                          }`}
                        >
                          {currentTask ? statusMeta[currentTask.status].icon : "✓"}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </aside>

          <section className="panel tasks-panel surface ui-organized-board">
            <div className="panel-heading board-heading">
              <div>
                <p className="eyebrow">プロジェクトボード</p>
                <h2>プロジェクトボード</h2>
                <p className="panel-subtext">
                  進捗とサインを分けました。進捗は中央、詰まりは右。詳細はカードをクリックして開きます。
                </p>
              </div>

              <div className="board-mode-tabs" aria-label="ボード表示切替">
                <button
                  type="button"
                  className={activeBoardTab === "progress" ? "active" : ""}
                  onClick={() => setActiveBoardTab("progress")}
                >
                  <span>進捗</span>
                  <strong>TODO / DOING / DONE</strong>
                </button>
                <button
                  type="button"
                  className={activeBoardTab === "signals" ? "active" : ""}
                  onClick={() => setActiveBoardTab("signals")}
                >
                  <span>サイン</span>
                  <strong>HELP / WAIT / CHECK / REVIEW</strong>
                </button>
              </div>
            </div>

            <div className="ui-board-note">
              <strong>{activeBoardTab === "progress" ? "流れを見る" : "詰まりを見る"}</strong>
              <span>
                {activeBoardTab === "progress"
                  ? "これから・作業中・完了だけに絞り、プロジェクトの流れを軽く確認します。"
                  : "手助け・方向相談・確認・レビューをまとめ、右パネルと合わせて拾う順番を見ます。"}
              </span>
            </div>

            {activeBoardTab === "progress" ? (
              <div className="cluster-board ui-tab-board progress-board">
                <div className="cluster-section">
                  <div className="cluster-section-heading">
                    <h3>進捗</h3>
                    <span>これから / 作業中 / 完了</span>
                  </div>

                  <div className="cluster-grid progress-tab-grid">
                    {flowClusters.map((status) => renderCluster(status))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="cluster-board ui-tab-board signal-board">
                <div className="cluster-section">
                  <div className="cluster-section-heading">
                    <h3>サイン</h3>
                    <span>手助け / 方向相談 / 確認 / レビュー</span>
                  </div>

                  <div className="cluster-grid signal-tab-grid">
                    {supportClusters.map((status) => renderCluster(status))}
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="panel signals-panel surface">
            <div className="panel-heading">
              <p className="eyebrow">次のサイン</p>
              <h2>次に拾うサイン</h2>
              <p className="panel-subtext">
                支援が必要そうなカードを、重くならない順に並べます。
              </p>
            </div>

            {nextSupportTask ? (
              <div className={`next-support-card status-${nextSupportTask.status}`}>
                <div className="next-support-top">
                  <span className={`task-status-pill ${nextSupportTask.status}`}>
                    {renderStatusLabel(nextSupportTask.status)}
                  </span>
                  <span className="next-support-bubble">
                    {statusMeta[nextSupportTask.status].bubble}
                  </span>
                </div>

                <strong>{nextSupportTask.title}</strong>
                <p>{nextSupportTask.reason}</p>

                <small>
                  発信: {getMember(nextSupportTask.ownerId)?.name} / 相手: {getMember(nextSupportTask.needId)?.name}
                </small>

                <div className="next-support-actions">
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => scrollToTask(nextSupportTask.id)}
                  >
                    このカードを見る
                  </button>

                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => resolveSupportTask(nextSupportTask, false)}
                  >
                    {supportActionMeta[nextSupportTask.status]?.label || "進める"}
                  </button>
                </div>

                <p className="next-support-note">
                  {supportActionMeta[nextSupportTask.status]?.message ||
                    "必要ならカードを開いて整える"}
                </p>
              </div>
            ) : (
              <div className="empty-state">
                <strong>今は大きなサインなし。</strong>
                <p>必要なサインが出たら、ここに表示されます。</p>
              </div>
            )}

            <div className="signal-summary">
              {signalStatuses.map((status) => (
                <button
                  key={`summary-${status}`}
                  type="button"
                  className={`signal-summary-chip ${status}`}
                  onClick={() => { setActiveFilter(status); setActiveBoardTab("signals"); }}
                >
                  <span>{getStatusLabel(status)}</span>
                  <strong>{active拾うサイン[status]}</strong>
                </button>
              ))}
            </div>

            <div className="support-queue">
              <div className="support-queue-heading">
                <h3>支援キュー</h3>
                <span>{supportQueue.length}</span>
              </div>

              {supportQueue.length > 0 ? (
                supportQueue.map((task) => (
                  <button
                    key={`queue-${task.id}`}
                    type="button"
                    className={`signal-card status-${task.status}`}
                    onClick={() => scrollToTask(task.id)}
                  >
                    <div className="signal-card-top">
                      <span className={`task-status-pill ${task.status}`}>
                        {renderStatusLabel(task.status)}
                      </span>
                      <small>{getMember(task.ownerId)?.name}</small>
                    </div>

                    <strong>{task.title}</strong>
                    <p>{statusMeta[task.status].summary}</p>
                  </button>
                ))
              ) : (
                <div className="empty-state compact-empty">
                  <strong>キューは空です。</strong>
                  <p>手助け・方向相談・確認・レビューが出ると並びます。</p>
                </div>
              )}
            </div>

            <div className="principle-box">
              <strong>原則</strong>
              <p>
                誰が遅いかではなく、どこを見れば進むかを見る。
                小さなサインを置いて、チームの流れをつなぐ。
              </p>
            </div>
          </aside>
        </section>
      </div>

      {renderIntroModal()}
      {renderCreateModal()}
      {renderTaskModal()}
      {renderMemberModal()}
      {renderCategoryModal()}
    </main>
  );
}

export default App;
