import { TodoItem } from '../types/todo';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createTodo = (title: string): TodoItem => ({
  id: generateId(),
  title: title.trim(),
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date()
});

export const updateTodoItem = (todos: TodoItem[], id: string, updates: Partial<TodoItem>): TodoItem[] =>
  todos.map(todo => 
    todo.id === id 
      ? { ...todo, ...updates, updatedAt: new Date() }
      : todo
  );

export const deleteTodoItem = (todos: TodoItem[], id: string): TodoItem[] =>
  todos.filter(todo => todo.id !== id);

export const validateTodoTitle = (title: string): { isValid: boolean; error?: string } => {
  const trimmedTitle = title.trim();
  
  if (!trimmedTitle) {
    return { isValid: false, error: 'タイトルは必須です' };
  }
  
  if (trimmedTitle.length > 100) {
    return { isValid: false, error: 'タイトルは100文字以内で入力してください' };
  }
  
  return { isValid: true };
};

// CSV出力関連のユーティリティ関数
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