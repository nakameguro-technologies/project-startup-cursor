---
title: "システムアーキテクチャ"
version: "1.1"
last_updated: "2025-01-27"
author: "takumi kumagai"
reviewers: []
related_docs: ["02_application_design.md", "03_database_design.md"]
status: "draft"
dependencies:
  upstream: ["01_requirements/04_non_functional_requirements.md", "01_requirements/05_constraints.md"]
  downstream: ["02_application_design.md", "03_database_design.md"]
impact_level: "high"
---

# システムアーキテクチャ

## 1. アーキテクチャ概要

### 1.1 基本方針
学習用ToDoアプリケーションのアーキテクチャは以下の方針に基づく：
- **シンプルさ重視**: 学習効果を最大化するためのシンプルな構成
- **フロントエンド中心**: ローカル環境での完結型アプリケーション
- **モダン技術活用**: TypeScript + Reactの最新ベストプラクティス
- **拡張性考慮**: 将来的な機能追加に対応可能な設計

### 1.2 アーキテクチャ特性
- **展開モデル**: Single Page Application (SPA)
- **実行環境**: ブラウザ + ローカルストレージ
- **開発モデル**: フロントエンドオンリー
- **データ管理**: クライアントサイド完結

## 2. システム全体構成

### 2.1 システム構成図
```
┌─────────────────────────────────────────────────────────┐
│                    ブラウザ環境                           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐ │
│  │              React Application                      │ │
│  │                                                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │  │ Presentation │  │  Business   │  │    Data     │  │ │
│  │  │    Layer     │  │    Layer    │  │    Layer    │  │ │
│  │  │              │  │             │  │             │  │ │
│  │  │ • Components │  │ • Hooks     │  │ • Types     │  │ │
│  │  │ • Styles     │  │ • Utils     │  │ • Storage   │  │ │
│  │  │ • UI Logic   │  │ • Validation│  │ • Constants │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐ │
│  │               Browser APIs                          │ │
│  │  • LocalStorage API                                 │ │
│  │  • DOM API                                          │ │
│  │  • Event API                                        │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.2 レイヤー構成

#### 2.2.1 Presentation Layer（プレゼンテーション層）
- **責務**: UI表示・ユーザー操作の受付
- **構成要素**:
  - React Components
  - CSS/Styled Components
  - イベントハンドラー

#### 2.2.2 Business Layer（ビジネス層）
- **責務**: ビジネスロジック・状態管理
- **構成要素**:
  - Custom Hooks
  - バリデーション関数
  - ユーティリティ関数

#### 2.2.3 Data Layer（データ層）
- **責務**: データ管理・永続化
- **構成要素**:
  - Type定義
  - LocalStorage操作
  - 定数定義

## 3. コンポーネント構成

### 3.1 コンポーネント階層
```
App
├── Header
│   ├── Title
│   └── NewTodoForm
│       ├── Input
│       └── SubmitButton
├── TodoList
│   └── TodoItem (Multiple)
│       ├── Checkbox
│       ├── Title (Editable)
│       ├── EditButton
│       └── DeleteButton
└── Footer
    └── Statistics
```

### 3.2 コンポーネント責務

#### 3.2.1 Container Components
- **App**: アプリケーション全体の状態管理
- **TodoList**: ToDoアイテム一覧の管理

#### 3.2.2 Presentational Components
- **Header**: ヘッダー表示
- **NewTodoForm**: 新規ToDo追加フォーム
- **TodoItem**: 個別ToDoアイテム表示
- **Footer**: フッター・統計情報表示

#### 3.2.3 Atomic Components
- **Input**: 入力フィールド
- **Button**: ボタン
- **Checkbox**: チェックボックス

## 4. データフロー

### 4.1 データフロー図
```
[User Action]
      ↓
[Event Handler]
      ↓
[State Update]
      ↓
[Component Re-render]
      ↓
[LocalStorage Sync]
```

### 4.2 状態管理フロー

#### 4.2.1 Todo追加フロー
1. ユーザーがフォームに入力
2. フォーム送信イベント発生
3. バリデーション実行
4. 新しいTodoオブジェクト生成
5. 状態更新（useState）
6. LocalStorage保存
7. UI更新

#### 4.2.2 Todo更新フロー
1. ユーザーが編集・チェック操作
2. 対象TodoのID特定
3. 更新処理実行
4. 状態更新（useState）
5. LocalStorage保存
6. UI更新

#### 4.2.3 Todo削除フロー
1. ユーザーが削除ボタンクリック
2. 対象TodoのID特定
3. 削除処理実行
4. 状態更新（useState）
5. LocalStorage保存
6. UI更新

## 5. 技術スタック

### 5.1 フロントエンド技術
```
┌─────────────────┬─────────────────┬────────────────────┐
│     分類        │    技術         │       用途         │
├─────────────────┼─────────────────┼────────────────────┤
│ 言語            │ TypeScript      │ 型安全性確保       │
│ フレームワーク  │ React           │ UI構築             │
│ 状態管理        │ React Hooks     │ 状態管理           │
│ スタイリング    │ CSS Modules     │ UI装飾・スコープ化 │
│ バンドラー      │ Create React App│ ビルド・開発環境   │
│ テストツール    │ Jest + React    │ テスト実行         │
│                 │ Testing Library │                    │
└─────────────────┴─────────────────┴────────────────────┘
```

### 5.2 開発・運用ツール
```
┌─────────────────┬─────────────────┬────────────────────┐
│     分類        │    技術         │       用途         │
├─────────────────┼─────────────────┼────────────────────┤
│ パッケージ管理  │ npm/yarn        │ 依存関係管理       │
│ コード品質      │ ESLint/Prettier │ コード規約         │
│ 型チェック      │ TypeScript      │ 静的解析           │
│ バージョン管理  │ Git             │ ソースコード管理   │
└─────────────────┴─────────────────┴────────────────────┘
```

## 6. データ設計

### 6.1 データ構造
```typescript
// Todo アイテムの型定義
interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// アプリケーション状態の型定義
interface AppState {
  todos: TodoItem[];
  filter: 'all' | 'active' | 'completed'; // 将来拡張用
}

// LocalStorage保存形式
interface StorageData {
  todos: TodoItem[];
  lastUpdated: string;
}
```

### 6.2 LocalStorage設計
- **キー名**: `todo-app-data`
- **データ形式**: JSON文字列
- **容量制限**: 10MB以内
- **バックアップ**: 不要（学習用途）

## 7. セキュリティ設計

### 7.1 基本セキュリティ方針
- **入力値検証**: 全てのユーザー入力に対する検証
- **XSS対策**: Reactの標準エスケープ機能活用
- **データ保護**: ローカルストレージデータの適切な管理

### 7.2 セキュリティ実装
```typescript
// 入力値サニタイズ例
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// データ検証例
const validateTodo = (todo: Partial<TodoItem>): boolean => {
  return !!(todo.title && todo.title.length > 0 && todo.title.length <= 500);
};
```

## 8. 性能設計

### 8.1 性能要件への対応
- **応答時間**: Reactの最適化手法活用
- **メモリ使用量**: 効率的な状態管理
- **ローカルストレージ**: 非同期処理での実装

### 8.2 最適化手法
- **React.memo**: 不要な再レンダリング防止
- **useCallback**: 関数再生成防止
- **useMemo**: 計算結果キャッシュ
- **lazy loading**: 必要に応じたコンポーネント読み込み

## 9. エラーハンドリング設計

### 9.1 エラー種別と対応
```typescript
// エラー種別定義
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR'
}

// エラーハンドリング関数
const handleError = (error: Error, type: ErrorType): void => {
  console.error(`[${type}]`, error);
  // ユーザーへの適切なフィードバック
};
```

### 9.2 エラー境界設定
- **React Error Boundary**: アプリケーション全体の例外捕捉
- **try-catch**: 個別処理での例外ハンドリング
- **Validation**: 入力時点での事前チェック

## 10. 拡張性設計

### 10.1 将来拡張への対応
- **状態管理ライブラリ導入**: Redux/Zustand等への移行容易性
- **バックエンド連携**: API通信への切り替え容易性
- **機能追加**: カテゴリ・フィルタ等の追加容易性

### 10.2 設計原則
- **Single Responsibility**: 単一責任の原則
- **Dependency Injection**: 依存性注入による疎結合
- **Interface Segregation**: インターフェース分離

## 更新履歴

| バージョン | 更新日 | 更新者 | 更新内容 | 影響ドキュメント |
|---|-----|-----|----|---|
| 1.0 | 2025-06-18 | takumi kumagai | 初版作成 | 02_application_design.md, 03_database_design.md |
| 1.1 | 2025-01-27 | takumi kumagai | 技術スタック決定（CRA、CSS Modules） | 01_requirements/01_project_overview.md | 