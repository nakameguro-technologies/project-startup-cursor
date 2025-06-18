---
title: "アプリケーション設計"
version: "1.1"
last_updated: "2025-01-28"
author: "takumi kumagai"
reviewers: []
related_docs: ["01_system_architecture.md", "03_database_design.md"]
status: "draft"
dependencies:
  upstream: ["01_system_architecture.md", "01_requirements/03_functional_requirements.md"]
  downstream: ["03_development/02_test_specifications.md"]
impact_level: "high"
---

# アプリケーション設計

## 1. 設計概要

### 1.1 設計方針
- **関数型プログラミング**: イミュータブルな実装
- **宣言的UI**: Reactの宣言的パラダイム活用
- **型安全性**: TypeScriptの型システム活用
- **テスタビリティ**: テストしやすい設計

### 1.2 設計パターン
- **Container/Presentational Pattern**: ロジックとUIの分離
- **Custom Hooks Pattern**: ビジネスロジックの再利用
- **Compound Component Pattern**: 複合コンポーネントの設計

## 2. コンポーネント設計

### 2.1 コンポーネント一覧

#### 2.1.1 Container Components（ロジック担当）
```typescript
// App.tsx - メインアプリケーション
interface AppProps {}
interface AppState {
  todos: TodoItem[];
  isLoading: boolean;
  error: string | null;
}

// TodoListContainer.tsx - ToDo一覧管理
interface TodoListContainerProps {
  todos: TodoItem[];
  onUpdate: (id: string, updates: Partial<TodoItem>) => void;
  onDelete: (id: string) => void;
}
```

#### 2.1.2 Presentational Components（UI担当）
```typescript
// Header.tsx - ヘッダー
interface HeaderProps {
  title: string;
}

// NewTodoForm.tsx - 新規ToDo追加フォーム
interface NewTodoFormProps {
  onSubmit: (title: string) => void;
  isDisabled?: boolean;
}

// TodoList.tsx - ToDo一覧表示
interface TodoListProps {
  todos: TodoItem[];
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

// TodoItem.tsx - 個別ToDo表示
interface TodoItemProps {
  todo: TodoItem;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

// Footer.tsx - フッター・統計情報
interface FooterProps {
  totalCount: number;
  completedCount: number;
}

// CsvExportButton.tsx - CSV出力ボタン
interface CsvExportButtonProps {
  todos: TodoItem[];
  onExport?: () => void;
  disabled?: boolean;
}
```

#### 2.1.3 Atomic Components（基本UI部品）
```typescript
// Input.tsx - 入力フィールド
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onEnter?: () => void;
}

// Button.tsx - ボタン
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

// Checkbox.tsx - チェックボックス
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
```

### 2.2 コンポーネント詳細設計

#### 2.2.1 App.tsx（メインコンポーネント）
```typescript
export const App: React.FC = () => {
  // カスタムフック使用
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    isLoading,
    error
  } = useTodos();

  // エラーハンドリング
  if (error) {
    return <ErrorBoundary error={error} />;
  }

  // ローディング表示
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="app">
      <Header title="Todo App Learning" />
      <main>
        <NewTodoForm onSubmit={addTodo} />
        <TodoList
          todos={todos}
          onToggleComplete={toggleComplete}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      </main>
      <Footer
        totalCount={todos.length}
        completedCount={todos.filter(todo => todo.completed).length}
      />
      <CsvExportButton todos={todos} />
    </div>
  );
};
```

#### 2.2.2 TodoItem.tsx（個別Todo表示）
```typescript
export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleSave = useCallback(() => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== todo.title) {
      onUpdate(todo.id, trimmedTitle);
    }
    setIsEditing(false);
  }, [editTitle, todo.id, todo.title, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditTitle(todo.title);
    setIsEditing(false);
  }, [todo.title]);

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <Checkbox
        checked={todo.completed}
        onChange={() => onToggleComplete(todo.id)}
      />
      
      {isEditing ? (
        <div className="edit-form">
          <Input
            value={editTitle}
            onChange={setEditTitle}
            onEnter={handleSave}
          />
          <Button onClick={handleSave} variant="primary">
            Save
          </Button>
          <Button onClick={handleCancel} variant="secondary">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="todo-content">
          <span className="todo-title">{todo.title}</span>
          <div className="todo-actions">
            <Button onClick={() => setIsEditing(true)} variant="secondary">
              Edit
            </Button>
            <Button onClick={() => onDelete(todo.id)} variant="danger">
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 2.2.3 CsvExportButton.tsx（CSV出力ボタン）
```typescript
export const CsvExportButton: React.FC<CsvExportButtonProps> = ({
  todos,
  onExport,
  disabled = false
}) => {
  const handleExport = useCallback(() => {
    try {
      const csvContent = convertTodosToCsv(todos);
      const filename = generateCsvFilename();
      downloadCsv(csvContent, filename);
      
      // コールバック実行（統計・ログ用）
      onExport?.();
    } catch (error) {
      console.error('CSV export failed:', error);
      throw new Error('CSV export failed');
    }
  }, [todos, onExport]);

  return (
    <div className="csv-export-section">
      <Button
        onClick={handleExport}
        variant="primary"
        disabled={disabled || todos.length === 0}
      >
        CSV出力 ({todos.length}件)
      </Button>
    </div>
  );
};
            Save
          </Button>
          <Button onClick={handleCancel} variant="secondary">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="view-mode">
          <span className="title">{todo.title}</span>
          <Button onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button
            onClick={() => onDelete(todo.id)}
            variant="danger"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};
```

## 3. カスタムフック設計

### 3.1 useTodos（メイン状態管理）
```typescript
interface UseTodosReturn {
  todos: TodoItem[];
  addTodo: (title: string) => void;
  updateTodo: (id: string, title: string) => void;
  deleteTodo: (id: string) => void;
  toggleComplete: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const useTodos = (): UseTodosReturn => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // LocalStorage読み込み
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const savedTodos = await todoStorage.load();
        setTodos(savedTodos);
      } catch (err) {
        setError('Failed to load todos');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTodos();
  }, []);

  // LocalStorage保存
  useEffect(() => {
    if (!isLoading) {
      todoStorage.save(todos).catch(err => {
        setError('Failed to save todos');
      });
    }
  }, [todos, isLoading]);

  const addTodo = useCallback((title: string) => {
    const newTodo: TodoItem = {
      id: generateId(),
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTodos(prev => [...prev, newTodo]);
  }, []);

  const updateTodo = useCallback((id: string, title: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { ...todo, title: title.trim(), updatedAt: new Date() }
        : todo
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    ));
  }, []);

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    isLoading,
    error
  };
};
```

### 3.2 useLocalStorage（ストレージ操作）
```typescript
interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
  isLoading: boolean;
  error: string | null;
}

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): UseLocalStorageReturn<T> => {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadValue = () => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          setValue(JSON.parse(item));
        }
      } catch (err) {
        setError(`Failed to load ${key} from localStorage`);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  const updateValue = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (err) {
      setError(`Failed to save ${key} to localStorage`);
    }
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      localStorage.removeItem(key);
    } catch (err) {
      setError(`Failed to remove ${key} from localStorage`);
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue: updateValue,
    removeValue,
    isLoading,
    error
  };
};
```

## 4. ビジネスロジック設計

### 4.1 バリデーション
```typescript
// todo-validation.ts
export const validateTodoTitle = (title: string): ValidationResult => {
  const trimmed = title.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Title is required' };
  }
  
  if (trimmed.length > 500) {
    return { isValid: false, error: 'Title must be 500 characters or less' };
  }
  
  return { isValid: true, error: null };
};

export const sanitizeTodoTitle = (title: string): string => {
  return title.trim().replace(/[<>]/g, '');
};

interface ValidationResult {
  isValid: boolean;
  error: string | null;
}
```

### 4.2 ユーティリティ関数
```typescript
// todo-utils.ts
export const generateId = (): string => {
  return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const sortTodosByDate = (todos: TodoItem[]): TodoItem[] => {
  return [...todos].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const filterTodos = (
  todos: TodoItem[],
  filter: 'all' | 'active' | 'completed'
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

export const calculateStats = (todos: TodoItem[]) => {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const active = total - completed;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  return { total, completed, active, completionRate };
};

export const formatDateForCsv = (date: Date): string => {
  return date.toISOString().replace('T', ' ').substring(0, 19);
};

export const generateCsvFilename = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().substring(0, 10); // YYYY-MM-DD
  return `todos_${dateStr}.csv`;
};

export const convertTodosToCsv = (todos: TodoItem[]): string => {
  const headers = ['ID', 'タイトル', '完了状態', '作成日時', '更新日時'];
  const csvHeaders = headers.join(',');
  
  const csvRows = todos.map(todo => {
    const row = [
      `"${todo.id}"`,
      `"${todo.title.replace(/"/g, '""')}"`, // CSVエスケープ
      `"${todo.completed ? '完了' : '未完了'}"`,
      `"${formatDateForCsv(todo.createdAt)}"`,
      `"${formatDateForCsv(todo.updatedAt)}"`
    ];
    return row.join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

export const downloadCsv = (csvContent: string, filename: string): void => {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { 
    type: 'text/csv;charset=utf-8' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
```

### 4.3 LocalStorage操作
```typescript
// todo-storage.ts
const STORAGE_KEY = 'todo-app-data';

export const todoStorage = {
  async load(): Promise<TodoItem[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return this.validateStorageData(parsed);
    } catch (error) {
      console.error('Failed to load todos from storage:', error);
      throw new Error('Storage load failed');
    }
  },

  async save(todos: TodoItem[]): Promise<void> {
    try {
      const data = {
        todos,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save todos to storage:', error);
      throw new Error('Storage save failed');
    }
  },

  validateStorageData(data: any): TodoItem[] {
    if (!data || !Array.isArray(data.todos)) {
      return [];
    }
    
    return data.todos.filter((todo: any) => 
      todo &&
      typeof todo.id === 'string' &&
      typeof todo.title === 'string' &&
      typeof todo.completed === 'boolean'
    ).map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt)
    }));
  },

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
};
```

## 5. エラーハンドリング設計

### 5.1 エラー境界コンポーネント
```typescript
// ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
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
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

### 5.2 エラー表示コンポーネント
```typescript
// ErrorMessage.tsx
interface ErrorMessageProps {
  error: string | null;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry 
}) => {
  if (!error) return null;

  return (
    <div className="error-message">
      <p>Error: {error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Retry
        </Button>
      )}
    </div>
  );
};
```

## 6. 性能最適化設計

### 6.1 メモ化戦略
```typescript
// React.memo でコンポーネントメモ化
export const TodoItem = React.memo<TodoItemProps>(({ todo, ...handlers }) => {
  // コンポーネント実装
}, (prevProps, nextProps) => {
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.title === nextProps.todo.title &&
    prevProps.todo.completed === nextProps.todo.completed
  );
});

// useCallback でイベントハンドラーメモ化
const handleDelete = useCallback((id: string) => {
  if (window.confirm('Are you sure you want to delete this todo?')) {
    deleteTodo(id);
  }
}, [deleteTodo]);

// useMemo で計算結果メモ化
const stats = useMemo(() => 
  calculateStats(todos), 
[todos]);
```

### 6.2 仮想化（将来拡張用）
```typescript
// 大量データ対応（将来実装）
interface VirtualizedTodoListProps {
  todos: TodoItem[];
  height: number;
  itemHeight: number;
}

// React Windowライブラリを使用した仮想化実装予定
```

## 7. テスト設計

### 7.1 テスタブルな設計
```typescript
// 純粋関数での実装
export const addTodoToList = (
  todos: TodoItem[], 
  title: string
): TodoItem[] => {
  const newTodo: TodoItem = {
    id: generateId(),
    title: title.trim(),
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  return [...todos, newTodo];
};

// モック可能なストレージインターフェース
export interface TodoStorage {
  load(): Promise<TodoItem[]>;
  save(todos: TodoItem[]): Promise<void>;
  clear(): Promise<void>;
}
```

### 7.2 テストユーティリティ
```typescript
// test-utils.tsx
export const createMockTodo = (overrides?: Partial<TodoItem>): TodoItem => ({
  id: 'test-id',
  title: 'Test Todo',
  completed: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides
});

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions
) => {
  // テスト用のProvider設定
  return render(ui, options);
};
```

## 更新履歴

| バージョン | 更新日 | 更新者 | 更新内容 | 影響ドキュメント |
|---|-----|-----|----|---|
| 1.0 | 2025-06-18 | takumi kumagai | 初版作成 | 03_database_design.md, 03_development/ |
| 1.1 | 2025-01-28 | takumi kumagai | CSV出力機能の設計追加 | 03_development/02_test_specifications.md | 