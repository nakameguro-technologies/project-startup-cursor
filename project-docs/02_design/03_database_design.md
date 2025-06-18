---
title: "データ設計"
version: "1.0"
last_updated: "2025-06-18"
author: "takumi kumagai"
reviewers: []
related_docs: ["01_system_architecture.md", "02_application_design.md"]
status: "draft"
dependencies:
  upstream: ["01_system_architecture.md", "02_application_design.md"]
  downstream: ["03_development/02_test_specifications.md"]
impact_level: "medium"
---

# データ設計

## 1. データ設計概要

### 1.1 基本方針
学習用ToDoアプリケーションのデータ設計は以下の方針に基づく：
- **シンプルさ重視**: 学習に集中できるシンプルなデータ構造
- **LocalStorage活用**: データベース不使用でのローカル永続化
- **型安全性確保**: TypeScriptによる厳密な型定義
- **拡張性考慮**: 将来的なバックエンド連携への対応

### 1.2 データ管理方針
- **データ永続化**: LocalStorageを使用
- **データ同期**: 状態変更時の自動保存
- **データ整合性**: クライアントサイドでの整合性管理
- **データ移行**: 将来的なAPI連携への移行容易性

## 2. データモデル設計

### 2.1 概念データモデル
```
┌─────────────────┐
│    TodoItem     │
├─────────────────┤
│ + id: string    │
│ + title: string │
│ + completed: boolean │
│ + createdAt: Date │
│ + updatedAt: Date │
└─────────────────┘
```

### 2.2 論理データモデル

#### 2.2.1 TodoItem（ToDoアイテム）
```typescript
interface TodoItem {
  id: string;          // 一意識別子
  title: string;       // ToDoタイトル
  completed: boolean;  // 完了状態
  createdAt: Date;     // 作成日時
  updatedAt: Date;     // 更新日時
}
```

**フィールド詳細**:
- **id**: 一意識別子（UUID形式）
  - 形式: `todo_${timestamp}_${random}`
  - 例: `todo_1703123456789_abc123def`
  
- **title**: ToDoのタイトル
  - 型: string
  - 制約: 1文字以上500文字以下
  - 必須: true
  
- **completed**: 完了状態フラグ
  - 型: boolean
  - デフォルト値: false
  
- **createdAt**: 作成日時
  - 型: Date
  - 自動設定: 作成時の現在時刻
  
- **updatedAt**: 更新日時
  - 型: Date
  - 自動更新: 変更時の現在時刻

#### 2.2.2 TodoList（ToDoリスト）
```typescript
interface TodoList {
  items: TodoItem[];   // ToDoアイテムの配列
}
```

#### 2.2.3 AppState（アプリケーション状態）
```typescript
interface AppState {
  todos: TodoItem[];
  filter: TodoFilter;      // 将来拡張用
  isLoading: boolean;
  error: string | null;
}

type TodoFilter = 'all' | 'active' | 'completed';
```

## 3. LocalStorage設計

### 3.1 ストレージ構造
```typescript
// LocalStorage保存形式
interface StorageData {
  todos: TodoItem[];
  lastUpdated: string;     // ISO 8601形式
  version: string;         // データ形式バージョン
}
```

### 3.2 ストレージキー設計
- **メインキー**: `todo-app-data`
- **バックアップキー**: `todo-app-backup` (将来実装)
- **設定キー**: `todo-app-settings` (将来実装)

### 3.3 データシリアライゼーション
```typescript
// 保存時の変換
const serializeForStorage = (todos: TodoItem[]): string => {
  const data: StorageData = {
    todos: todos.map(todo => ({
      ...todo,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    })),
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  };
  return JSON.stringify(data);
};

// 読み込み時の変換
const deserializeFromStorage = (json: string): TodoItem[] => {
  const data: StorageData = JSON.parse(json);
  return data.todos.map(todo => ({
    ...todo,
    createdAt: new Date(todo.createdAt),
    updatedAt: new Date(todo.updatedAt)
  }));
};
```

## 4. データ操作設計

### 4.1 CRUD操作定義

#### 4.1.1 Create（作成）
```typescript
export const createTodo = (title: string): TodoItem => {
  return {
    id: generateId(),
    title: title.trim(),
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};
```

#### 4.1.2 Read（読み取り）
```typescript
export const findTodoById = (todos: TodoItem[], id: string): TodoItem | undefined => {
  return todos.find(todo => todo.id === id);
};

export const getAllTodos = (todos: TodoItem[]): TodoItem[] => {
  return [...todos];
};

export const getActiveTodos = (todos: TodoItem[]): TodoItem[] => {
  return todos.filter(todo => !todo.completed);
};

export const getCompletedTodos = (todos: TodoItem[]): TodoItem[] => {
  return todos.filter(todo => todo.completed);
};
```

#### 4.1.3 Update（更新）
```typescript
export const updateTodoTitle = (
  todos: TodoItem[],
  id: string,
  title: string
): TodoItem[] => {
  return todos.map(todo =>
    todo.id === id
      ? { ...todo, title: title.trim(), updatedAt: new Date() }
      : todo
  );
};

export const toggleTodoCompletion = (
  todos: TodoItem[],
  id: string
): TodoItem[] => {
  return todos.map(todo =>
    todo.id === id
      ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
      : todo
  );
};
```

#### 4.1.4 Delete（削除）
```typescript
export const deleteTodo = (todos: TodoItem[], id: string): TodoItem[] => {
  return todos.filter(todo => todo.id !== id);
};
```

### 4.2 バッチ操作
```typescript
export const addTodoToList = (todos: TodoItem[], newTodo: TodoItem): TodoItem[] => {
  return [...todos, newTodo];
};

export const updateMultipleTodos = (
  todos: TodoItem[],
  updates: Array<{ id: string; changes: Partial<TodoItem> }>
): TodoItem[] => {
  return todos.map(todo => {
    const update = updates.find(u => u.id === todo.id);
    return update
      ? { ...todo, ...update.changes, updatedAt: new Date() }
      : todo;
  });
};

export const clearCompletedTodos = (todos: TodoItem[]): TodoItem[] => {
  return todos.filter(todo => !todo.completed);
};
```

## 5. データバリデーション

### 5.1 バリデーション規則
```typescript
// バリデーション結果の型定義
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// TodoItem バリデーション
export const validateTodoItem = (todo: Partial<TodoItem>): ValidationResult => {
  const errors: string[] = [];

  // ID検証
  if (!todo.id || typeof todo.id !== 'string') {
    errors.push('ID is required and must be a string');
  }

  // タイトル検証
  if (!todo.title || typeof todo.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (todo.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (todo.title.length > 500) {
    errors.push('Title must be 500 characters or less');
  }

  // 完了状態検証
  if (typeof todo.completed !== 'boolean') {
    errors.push('Completed must be a boolean');
  }

  // 日時検証
  if (todo.createdAt && !(todo.createdAt instanceof Date)) {
    errors.push('CreatedAt must be a Date object');
  }

  if (todo.updatedAt && !(todo.updatedAt instanceof Date)) {
    errors.push('UpdatedAt must be a Date object');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### 5.2 サニタイゼーション
```typescript
export const sanitizeTodoTitle = (title: string): string => {
  return title
    .trim()                           // 前後の空白削除
    .replace(/[<>]/g, '')            // HTMLタグ的文字削除
    .replace(/\s+/g, ' ')            // 連続空白を単一空白に
    .substring(0, 500);              // 長さ制限
};

export const sanitizeTodoItem = (todo: Partial<TodoItem>): Partial<TodoItem> => {
  return {
    ...todo,
    title: todo.title ? sanitizeTodoTitle(todo.title) : todo.title
  };
};
```

## 6. データ永続化設計

### 6.1 ストレージ操作インターフェース
```typescript
export interface TodoStorage {
  load(): Promise<TodoItem[]>;
  save(todos: TodoItem[]): Promise<void>;
  clear(): Promise<void>;
  backup(): Promise<string>;           // 将来実装
  restore(data: string): Promise<void>; // 将来実装
}
```

### 6.2 LocalStorage実装
```typescript
export class LocalTodoStorage implements TodoStorage {
  private readonly storageKey = 'todo-app-data';

  async load(): Promise<TodoItem[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return this.validateAndMigrateData(parsed);
    } catch (error) {
      console.error('Failed to load todos:', error);
      throw new StorageError('Failed to load todos from storage');
    }
  }

  async save(todos: TodoItem[]): Promise<void> {
    try {
      const data: StorageData = {
        todos: todos.map(this.serializeTodo),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save todos:', error);
      throw new StorageError('Failed to save todos to storage');
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  private serializeTodo(todo: TodoItem): any {
    return {
      ...todo,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    };
  }

  private deserializeTodo(data: any): TodoItem {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  private validateAndMigrateData(data: any): TodoItem[] {
    if (!data || !Array.isArray(data.todos)) {
      return [];
    }

    return data.todos
      .filter(this.isValidTodoData)
      .map(this.deserializeTodo);
  }

  private isValidTodoData(todo: any): boolean {
    return (
      todo &&
      typeof todo.id === 'string' &&
      typeof todo.title === 'string' &&
      typeof todo.completed === 'boolean' &&
      todo.createdAt &&
      todo.updatedAt
    );
  }
}
```

### 6.3 エラーハンドリング
```typescript
export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

export const handleStorageError = (error: Error): void => {
  if (error instanceof StorageError) {
    console.error('Storage operation failed:', error.message);
    // ユーザーへの適切な通知
  } else {
    console.error('Unexpected error:', error);
    throw error;
  }
};
```

## 7. データ統計・集計

### 7.1 統計情報計算
```typescript
export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  completionRate: number;
}

export const calculateTodoStats = (todos: TodoItem[]): TodoStats => {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const active = total - completed;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return { total, completed, active, completionRate };
};
```

### 7.2 ソート・フィルタリング
```typescript
export const sortTodos = (
  todos: TodoItem[],
  sortBy: 'created' | 'updated' | 'title' = 'created'
): TodoItem[] => {
  return [...todos].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'updated':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
};

export const filterTodos = (
  todos: TodoItem[],
  filter: TodoFilter
): TodoItem[] => {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
};
```

## 8. データマイグレーション設計

### 8.1 バージョン管理
```typescript
export interface DataVersion {
  version: string;
  migrationFunction: (data: any) => any;
}

export const dataMigrations: DataVersion[] = [
  {
    version: '1.0.0',
    migrationFunction: (data: any) => {
      // 初期バージョン：変更なし
      return data;
    }
  }
  // 将来のマイグレーション追加予定
];

export const migrateData = (data: any): any => {
  const currentVersion = data.version || '1.0.0';
  
  return dataMigrations
    .filter(migration => migration.version > currentVersion)
    .reduce((acc, migration) => migration.migrationFunction(acc), data);
};
```

## 9. テスト用データ

### 9.1 モックデータ生成
```typescript
export const createMockTodo = (overrides?: Partial<TodoItem>): TodoItem => ({
  id: `todo_test_${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Todo Item',
  completed: false,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  ...overrides
});

export const createMockTodoList = (count: number = 3): TodoItem[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockTodo({
      title: `Test Todo ${index + 1}`,
      completed: index % 2 === 0
    })
  );
};
```

### 9.2 テスト用ストレージ
```typescript
export class MockTodoStorage implements TodoStorage {
  private data: TodoItem[] = [];

  async load(): Promise<TodoItem[]> {
    return [...this.data];
  }

  async save(todos: TodoItem[]): Promise<void> {
    this.data = [...todos];
  }

  async clear(): Promise<void> {
    this.data = [];
  }

  // テスト用メソッド
  setMockData(todos: TodoItem[]): void {
    this.data = [...todos];
  }
}
```

## 10. 将来拡張設計

### 10.1 API連携への準備
```typescript
// 将来のAPI連携インターフェース
export interface ApiTodoStorage extends TodoStorage {
  sync(): Promise<TodoItem[]>;
  uploadChanges(todos: TodoItem[]): Promise<void>;
  downloadChanges(): Promise<TodoItem[]>;
}
```

### 10.2 追加フィールドの考慮
```typescript
// 将来拡張用の型定義
interface ExtendedTodoItem extends TodoItem {
  category?: string;     // カテゴリ
  priority?: number;     // 優先度
  dueDate?: Date;        // 期限
  tags?: string[];       // タグ
}
```

## 更新履歴

| バージョン | 更新日 | 更新者 | 更新内容 | 影響ドキュメント |
|---|-----|-----|----|---|
| 1.0 | 2025-06-18 | takumi kumagai | 初版作成 | 03_development/ | 