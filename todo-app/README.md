# Todo App

学習用ToDoリストアプリケーション - TypeScript + React + CSS Modules

## 概要

このプロジェクトは、TypeScriptとReactの学習・練習を目的としたToDoリストアプリケーションです。ローカル環境で動作し、LocalStorageを使用してデータを永続化します。

## 技術スタック

- **フロントエンド**: React + TypeScript
- **状態管理**: React Hooks (useState, useCallback, useEffect)
- **スタイリング**: CSS Modules
- **データ永続化**: LocalStorage
- **開発環境**: Create React App (CRA)
- **テスト**: Jest + React Testing Library

## 機能

- ✅ ToDoアイテムの追加
- ✅ ToDoアイテムの完了チェック
- ✅ ToDoアイテムの編集
- ✅ ToDoアイテムの削除
- ✅ データの永続化（LocalStorage）
- ✅ 統計情報の表示（総数、未完了、完了）
- ✅ レスポンシブデザイン
- ✅ バリデーション（文字数制限、必須チェック）

## プロジェクト構造

```
src/
├── components/           # Reactコンポーネント
│   ├── App/             # メインアプリケーション
│   ├── NewTodoForm/     # Todo追加フォーム
│   ├── TodoList/        # Todoリスト
│   ├── TodoItem/        # 個別Todoアイテム
│   └── Footer/          # 統計情報フッター
├── hooks/               # カスタムフック
│   └── useTodos.ts      # Todo管理のメインロジック
├── types/               # TypeScript型定義
│   └── todo.ts          # Todo関連の型
└── utils/               # ユーティリティ関数
    ├── todoUtils.ts     # Todo操作ユーティリティ
    └── storage.ts       # LocalStorage操作
```

## 利用可能なスクリプト

### `npm start`

開発モードでアプリケーションを起動します。
[http://localhost:3000](http://localhost:3000) でブラウザから確認できます。

### `npm test`

テストランナーを起動します。

### `npm run build`

本番用にアプリケーションをビルドします。`build`フォルダに出力されます。

## 設計思想

### 関数型プログラミング
- イミュータブルなデータ操作
- 高階関数の活用（map, filter）
- Pure Function重視

### 型安全性
- TypeScriptによる厳密な型定義
- anyの使用禁止
- Interfaceベースの設計

### コンポーネント設計
- 単一責任の原則
- Props Drilling回避（カスタムフック活用）
- Presentational/Container パターン

### エラーハンドリング
- 例外の適切な再発生
- エラー握りつぶし禁止
- ユーザーフレンドリーなエラー表示

## 学習ポイント

1. **React Hooks**: useState, useEffect, useCallback の適切な使用
2. **TypeScript**: Interface定義、型安全性の確保
3. **CSS Modules**: スコープ化されたスタイリング
4. **カスタムフック**: ロジックの再利用性
5. **LocalStorage**: クライアントサイドでのデータ永続化
6. **関数型プログラミング**: イミュータブルな状態管理

## ライセンス

このプロジェクトは学習目的で作成されています。
