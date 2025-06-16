---
title: "インターフェース設計書"
version: "0.0"
last_updated: "[更新日を記載]"
author: "[作成者名]"
reviewers: []
related_docs:
  - "01_system_architecture.md"
  - "02_application_design.md"
  - "../01_requirements/03_functional_requirements.md"
  - "../03_development/01_development_standards.md"
  - "../03_development/02_test_specifications.md"
status: "draft"
dependencies:
  upstream:
    - "01_system_architecture.md"
    - "02_application_design.md" 
    - "../01_requirements/03_functional_requirements.md"
  downstream:
    - "../03_development/01_development_standards.md"
    - "../03_development/02_test_specifications.md"
---

# インターフェース設計書

## 1. 概要
[インターフェース設計の概要を記載]

## 2. 外部システム連携
### 2.1 連携システム一覧
| システム名 | 連携種別 | 連携方式 | データ形式 |
|------------|----------|----------|------------|
| [システム1] | [送信/受信] | [API/ファイル] | [JSON/XML/CSV] |
| [システム2] | [送信/受信] | [API/ファイル] | [JSON/XML/CSV] |

### 2.2 API仕様
#### 2.2.1 [API名]
- URL: [エンドポイント]
- HTTPメソッド: [GET/POST/PUT/DELETE]
- 認証: [認証方式]
- リクエスト: [リクエスト仕様]
- レスポンス: [レスポンス仕様]

## 3. ファイル連携
### 3.1 連携ファイル一覧
| ファイル名 | 用途 | 形式 | 頻度 |
|------------|------|------|------|
| [ファイル1] | [用途] | [CSV/XML] | [日次/週次] |

## 4. 承認
| 項目 | 氏名 | 承認日 |
|------|------|--------|
| 作成者 | [氏名] | [日付] |
| 承認者 | [氏名] | [日付] | 