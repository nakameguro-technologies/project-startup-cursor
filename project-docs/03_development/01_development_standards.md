---
title: "開発規約"
version: "1.0"
last_updated: "2025-06-18"
author: "takumi kumagai"
reviewers: []
related_docs: ["02_test_specifications.md", "03_deployment_guide.md"]
status: "draft"
dependencies:
  upstream: ["02_design/02_application_design.md"]
  downstream: ["02_test_specifications.md"]
impact_level: "high"
---

# 開発規約

## 1. 開発規約概要

### 1.1 基本方針
学習用ToDoアプリケーションの開発は以下の規約に従う：
- **学習効果の最大化**: ベストプラクティスの実践
- **一貫性の確保**: 統一されたコーディングスタイル
- **可読性の重視**: 理解しやすいコード
- **保守性の確保**: 将来の拡張・修正への対応

### 1.2 適用範囲
- TypeScript/JavaScript コード
- React コンポーネント
- CSS/スタイリング
- テストコード
- ドキュメント

## 2. TypeScript開発規約

### 2.1 基本ルール
```typescript
// ❌ 禁止事項
export default Component;              // default export禁止
const data: any = {};                  // any型使用禁止
switch (type) { /* ... */ }           // switch-case禁止

// ✅ 推奨事項  
export const Component = () => {};     // named export使用
const data: ComponentData = {};        // 適切な型定義
const result = type === 'A' ? handleA() : handleB(); // 三項演算子使用
```

### 2.2 型定義規約
```typescript
// インターフェース命名規則
interface TodoItem {              // Interfaceは Pascal Case
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 型エイリアス
type TodoFilter = 'all' | 'active' | 'completed';
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// 関数型定義
type TodoHandler = (id: string) => void;
type TodoCreator = (title: string) => TodoItem;

// Generics使用例
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

### 2.3 関数定義規約
```typescript
// 関数型プログラミングスタイル
export const createTodo = (title: string): TodoItem => ({
  id: generateId(),
  title: title.trim(),
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 高階関数の活用
export const filterTodos = (filter: TodoFilter) => 
  (todos: TodoItem[]): TodoItem[] => {
    return todos.filter(todo => {
      switch (filter) {
        case 'active': return !todo.completed;
        case 'completed': return todo.completed;
        default: return true;
      }
    });
  };

// イミュータブルな配列操作
export const updateTodo = (todos: TodoItem[], id: string, updates: Partial<TodoItem>): TodoItem[] =>
  todos.map(todo => 
    todo.id === id 
      ? { ...todo, ...updates, updatedAt: new Date() }
      : todo
  );
```

### 2.4 非同期処理規約
```typescript
// async/awaitの使用
export const loadTodos = async (): Promise<TodoItem[]> => {
  try {
    const data = localStorage.getItem('todo-app-data');
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return validateTodos(parsed.todos);
  } catch (error) {
    console.error('Failed to load todos:', error);
    throw new Error('Storage load failed');
  }
};

// エラーハンドリング（握りつぶし禁止）
export const saveTodos = async (todos: TodoItem[]): Promise<void> => {
  try {
    const data = { todos, lastUpdated: new Date().toISOString() };
    localStorage.setItem('todo-app-data', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save todos:', error);
    throw new Error('Storage save failed'); // 必ず例外を再発生
  }
};
```

## 3. React開発規約

### 3.1 コンポーネント定義規約
```typescript
// 関数コンポーネント（推奨）
interface TodoItemProps {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onUpdate,
  onDelete
}) => {
  // ローカル状態
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  // イベントハンドラー（useCallback使用）
  const handleSave = useCallback(() => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== todo.title) {
      onUpdate(todo.id, trimmedTitle);
    }
    setIsEditing(false);
  }, [editTitle, todo.id, todo.title, onUpdate]);

  // JSX返却
  return (
    <div className="todo-item">
      {/* コンポーネント内容 */}
    </div>
  );
};
```

### 3.2 カスタムフック規約
```typescript
// カスタムフック命名：useXxx
export const useTodos = (): UseTodosReturn => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 副作用の管理
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedTodos = await loadTodos();
        setTodos(loadedTodos);
      } catch (err) {
        setError('Failed to load todos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // メモ化された関数
  const addTodo = useCallback((title: string) => {
    const newTodo = createTodo(title);
    setTodos(prev => [...prev, newTodo]);
  }, []);

  return { todos, addTodo, isLoading, error };
};
```

### 3.3 状態管理規約
```typescript
// useState：ローカル状態
const [isEditing, setIsEditing] = useState(false);

// useReducer：複雑な状態（将来拡張時）
interface TodoState {
  todos: TodoItem[];
  filter: TodoFilter;
  searchQuery: string;
}

type TodoAction = 
  | { type: 'ADD_TODO'; payload: TodoItem }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: Partial<TodoItem> } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_FILTER'; payload: TodoFilter };

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, ...action.payload.updates }
            : todo
        )
      };
    // その他のアクション
    default:
      return state;
  }
};
```

### 3.4 イベントハンドリング規約
```typescript
// イベントハンドラー命名：handleXxx
const handleSubmit = useCallback((event: React.FormEvent) => {
  event.preventDefault();
  
  const formData = new FormData(event.currentTarget as HTMLFormElement);
  const title = formData.get('title') as string;
  
  if (title.trim()) {
    onSubmit(title.trim());
    setTitle('');
  }
}, [onSubmit]);

// 条件付きレンダリング
const renderTodoItem = (todo: TodoItem) => (
  <TodoItem
    key={todo.id}
    todo={todo}
    onToggle={handleToggle}
    onUpdate={handleUpdate}
    onDelete={handleDelete}
  />
);

// リスト要素のkey指定必須
return (
  <ul className="todo-list">
    {todos.map(renderTodoItem)}
  </ul>
);
```

## 4. ファイル・ディレクトリ構成規約

### 4.1 ディレクトリ構造
```
src/
├── components/           # UIコンポーネント
│   ├── atoms/           # 基本UI部品
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Checkbox.tsx
│   ├── molecules/       # 複合コンポーネント
│   │   ├── TodoItem.tsx
│   │   └── NewTodoForm.tsx
│   ├── organisms/       # 機能ブロック
│   │   ├── TodoList.tsx
│   │   └── Header.tsx
│   └── templates/       # レイアウト
│       └── AppLayout.tsx
├── hooks/               # カスタムフック
│   ├── useTodos.ts
│   └── useLocalStorage.ts
├── utils/               # ユーティリティ関数
│   ├── todo-utils.ts
│   ├── validation.ts
│   └── storage.ts
├── types/               # 型定義
│   ├── todo.ts
│   └── api.ts
├── constants/           # 定数
│   └── app-constants.ts
└── App.tsx             # アプリケーションルート
```

### 4.2 ファイル命名規約
```typescript
// コンポーネントファイル：PascalCase.tsx
TodoItem.tsx
NewTodoForm.tsx
Button.tsx

// フック：camelCase.ts（use prefix）
useTodos.ts
useLocalStorage.ts

// ユーティリティ：kebab-case.ts
todo-utils.ts
validation-helpers.ts

// 型定義：kebab-case.ts
todo-types.ts
api-types.ts

// 定数：kebab-case.ts
app-constants.ts
storage-keys.ts
```

### 4.3 インポート規約
```typescript
// インポート順序
// 1. React関連
import React, { useState, useCallback, useEffect } from 'react';

// 2. 外部ライブラリ
import classNames from 'classnames';

// 3. 内部モジュール（アルファベット順）
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { TodoItem } from './TodoItem';

// 4. 型定義
import type { TodoItem as TodoItemType } from '../../types/todo';

// 5. スタイル
import './TodoList.css';

// Named import使用（default import禁止）
export const TodoList: React.FC<TodoListProps> = ({ todos }) => {
  // コンポーネント実装
};
```

## 5. スタイリング規約

### 5.1 CSS規約
```css
/* BEM命名規則 */
.todo-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.todo-item__title {
  flex: 1;
  margin: 0 1rem;
}

.todo-item__title--completed {
  text-decoration: line-through;
  color: #888;
}

.todo-item__button {
  margin-left: 0.5rem;
}

.todo-item__button--danger {
  background-color: #dc3545;
  color: white;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .todo-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .todo-item__button {
    margin-top: 0.5rem;
    margin-left: 0;
  }
}
```

### 5.2 CSS Custom Properties
```css
:root {
  /* カラーパレット */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  
  /* フォント */
  --font-family-base: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-size-base: 1rem;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  
  /* スペーシング */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
  
  /* ブレークポイント */
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
}
```

## 6. テストコード規約

### 6.1 テストファイル構成
```typescript
// TodoItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoItem } from './TodoItem';
import { createMockTodo } from '../../utils/test-utils';

describe('TodoItem', () => {
  const mockHandlers = {
    onToggle: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo item correctly', () => {
    const todo = createMockTodo({ title: 'Test Todo' });
    
    render(
      <TodoItem 
        todo={todo} 
        {...mockHandlers} 
      />
    );

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox is clicked', () => {
    const todo = createMockTodo();
    
    render(
      <TodoItem 
        todo={todo} 
        {...mockHandlers} 
      />
    );

    fireEvent.click(screen.getByRole('checkbox'));
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(todo.id);
  });
});
```

### 6.2 テストユーティリティ
```typescript
// test-utils.ts
export const createMockTodo = (overrides?: Partial<TodoItem>): TodoItem => ({
  id: `test-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Todo',
  completed: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const createMockTodoList = (count: number = 3): TodoItem[] =>
  Array.from({ length: count }, (_, index) =>
    createMockTodo({
      title: `Test Todo ${index + 1}`,
      completed: index % 2 === 0,
    })
  );

// テスト用のrender関数
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui);
};
```

## 7. エラーハンドリング規約

### 7.1 例外処理規約
```typescript
// ❌ エラーを握りつぶすtry-catch禁止
try {
  await saveTodos(todos);
} catch (error) {
  console.log('Error occurred'); // ログのみで握りつぶし（禁止）
}

// ✅ 適切なエラーハンドリング
try {
  await saveTodos(todos);
} catch (error) {
  console.error('Failed to save todos:', error);
  throw new Error('Storage operation failed'); // 例外を再発生
}

// ✅ カスタムエラーの活用
export class TodoValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = 'TodoValidationError';
  }
}

export const validateTodo = (todo: Partial<TodoItem>): void => {
  if (!todo.title?.trim()) {
    throw new TodoValidationError('Title is required', 'title');
  }
  
  if (todo.title.length > 500) {
    throw new TodoValidationError('Title too long', 'title');
  }
};
```

### 7.2 React Error Boundary
```typescript
// ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 8. パフォーマンス規約

### 8.1 メモ化規約
```typescript
// React.memo（コンポーネントメモ化）
export const TodoItem = React.memo<TodoItemProps>(({ todo, handlers }) => {
  // コンポーネント実装
}, (prevProps, nextProps) => {
  // カスタム比較関数（必要な場合のみ）
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.title === nextProps.todo.title &&
    prevProps.todo.completed === nextProps.todo.completed
  );
});

// useCallback（関数メモ化）
const handleUpdate = useCallback((id: string, title: string) => {
  setTodos(prev => updateTodo(prev, id, { title }));
}, []);

// useMemo（計算結果メモ化）
const filteredTodos = useMemo(() => 
  filterTodos(todos, currentFilter), 
  [todos, currentFilter]
);
```

### 8.2 レンダリング最適化
```typescript
// 条件付きレンダリング最適化
const TodoList: React.FC<TodoListProps> = ({ todos, filter }) => {
  const filteredTodos = useMemo(() => 
    todos.filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    }), 
    [todos, filter]
  );

  if (todos.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="todo-list">
      {filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} {...handlers} />
      ))}
    </ul>
  );
};
```

## 9. コードレビュー規約

### 9.1 レビュー観点
1. **型安全性**: any型の使用有無、適切な型定義
2. **関数型実装**: イミュータブルな実装、副作用の制御
3. **エラーハンドリング**: 例外の適切な処理
4. **パフォーマンス**: 不要な再レンダリングの回避
5. **テスタビリティ**: テストしやすい設計
6. **可読性**: 分かりやすい命名、適切なコメント

### 9.2 コミットメッセージ規約
```
feat: add todo item editing functionality
fix: resolve issue with localStorage data corruption
docs: update API documentation for todo operations
style: apply consistent formatting to components
refactor: extract todo validation logic to utility
test: add unit tests for todo CRUD operations
```

## 10. 開発ツール設定

### 10.1 ESLint設定
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "react/no-default-export": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 10.2 Prettier設定
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 更新履歴

| バージョン | 更新日 | 更新者 | 更新内容 | 影響ドキュメント |
|---|-----|-----|----|---|
| 1.0 | 2025-06-18 | takumi kumagai | 初版作成 | 02_test_specifications.md | 