---
title: "開発標準・規約書"
version: "0.0"
last_updated: "[更新日を記載]"
author: "[作成者名]"
reviewers: []
related_docs:
  - "../02_design/01_system_architecture.md"
  - "../02_design/02_application_design.md"
  - "../01_requirements/05_constraints.md"
  - "02_test_specifications.md"
  - "03_deployment_guide.md"
  - "../02_design/03_database_design.md"
  - "../02_design/04_interface_design.md"
  - "../00_project_management/02_quality_management.md"
status: "draft"
dependencies:
  upstream:
    - "../02_design/01_system_architecture.md"
    - "../02_design/02_application_design.md"
    - "../01_requirements/05_constraints.md"
  downstream:
    - "02_test_specifications.md"
    - "03_deployment_guide.md"
---

# 開発規約

## 1. 概要
[開発規約の概要を記載]

## 2. コーディング規約
### 2.1 全般規約
- 文字コード: UTF-8
- 改行コード: LF
- インデント: スペース4つ

### 2.2 命名規則
| 対象 | 規則 | 例 |
|------|------|-----|
| 変数 | camelCase | userName |
| 関数/メソッド | camelCase | getUserData |
| クラス | PascalCase | UserService |
| 定数 | UPPER_CASE | MAX_COUNT |
| ファイル | snake_case | user_service.py |

### 2.3 コメント規約
- 関数・クラスには必ずコメントを記載
- コメントは日本語で記載
- TODOコメントは期限を明記

## 3. エラー処理規約
### 3.1 エラー分類
| エラー種別 | 処理方法 | ログレベル |
|------------|----------|------------|
| システムエラー | 例外発生 | ERROR |
| ビジネスエラー | エラーメッセージ表示 | WARN |
| バリデーションエラー | 入力チェック | INFO |

### 3.2 例外処理パターン
```
try:
    # 処理
except SpecificException as e:
    logger.error(f"エラー: {e}")
    raise
```

## 4. ログ設計
### 4.1 ログレベル
- ERROR: システムエラー
- WARN: 業務エラー
- INFO: 重要な処理
- DEBUG: デバッグ用

### 4.2 ログ出力形式
```
[YYYY-MM-DD HH:MM:SS] [レベル] [ユーザーID] [処理名] メッセージ
```

## 5. テスト規約
### 5.1 テスト種別
| テスト種別 | 対象 | カバレッジ目標 |
|------------|------|----------------|
| 単体テスト | 関数・メソッド | 80%以上 |
| 結合テスト | モジュール間 | 主要パス100% |

### 5.2 テストデータ
- 本番データは使用禁止
- 個人情報は仮データを使用
- テストデータは自動生成可能にする

## 6. バージョン管理
### 6.1 ブランチ戦略
- main: 本番リリース用
- develop: 開発用
- feature/[機能名]: 機能開発用
- hotfix/[修正内容]: 緊急修正用

### 6.2 コミットメッセージ規約
```
[種別] 修正内容の概要

詳細説明（必要に応じて）
```
種別: feat, fix, docs, style, refactor, test

## 7. 承認
| 項目 | 氏名 | 承認日 |
|------|------|--------|
| 作成者 | [氏名] | [日付] |
| 承認者 | [氏名] | [日付] | 