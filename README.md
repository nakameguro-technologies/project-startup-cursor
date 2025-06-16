# project-startup-cursor
本リポジトリはProject as CodeをCursorにて実現するための上流工程ドキュメント管理リポジトリです。  
基本的にインプット情報（`/input-docs`）に格納した内容を元にRulesに従ってテンプレートをUpdateする形でドキュメント生成を行います。  
詳細設計や実装工程を意識したドキュメント生成（Markdown形式）を生成することを目的としています。  
Project as Codeについては[Qiita記事](https://qiita.com/kumai_yu/items/0aa2fc294f8e1347e36c)を参考にしてください。

## フォルダ構成
```
project-startup-cursor
├── .cursor/
│   └── rules/
│       └── project-design.mdc   //Rules
├── input-docs/                  // インプット情報置き場
├── project-docs/                // ドキュメント（テンプレート）
│   ├── 00_project_management/   // プロジェクト管理
│   ├── 01_requirements/         // 要件定義
│   ├── 02_design/               // 設計
│   ├── 03_development/          // 開発
│   └── 04_operations/           // 運用
├── directory-structure.md       // ディレクトリ構造定義
└── project-config.yaml          // プロジェクト定義
```

## 本リポジトリ利用の流れ
### 1. プロジェクト基本情報の入力
`project-config.yaml`にプロジェクト基本情報を入力してください。
```
project:
  name: "プロジェクト名"
  created_date: "2025-06-01"

user:
  name: "ユーザー名"
```
### 2. input-docsにプロジェクト情報を格納
- rawデータ形式でプロジェクト情報（MCPなどで取得した情報を含む）を格納します。
    - 基本的には本ディレクトリの情報は整理しない形を想定しています。
    - 既存ドキュメントや別ツールで作成したドキュメントがある場合も格納します。
        - ただしLLMで読み取み可能なデータ形式であること

### 3. Rulesを元にドキュメント生成
- 定義は`project-design.mdc`に記載しています。
    - Rulesの記載があるのでプロンプトでは「コンテキストに従いドキュメント生成すること」のみの指示で問題ありません。
    - コンテキストより更新対象を特定するRulesにしていますが希望の更新箇所がある場合は指示してください。
- 未確定情報がある場合は`[TODO]`として記載されます。
- ドキュメント依存関係を保持した更新となりますが適宜確認してください。

## 注意事項
- プロジェクトは「生きもの」です。常に最適なドキュメントは検討してください。
- 基本的にforkを推奨したリポジトリですのでカスタマイズを前提としております。