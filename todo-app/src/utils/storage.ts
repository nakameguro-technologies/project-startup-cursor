import { TodoItem } from '../types/todo';

const STORAGE_KEY = 'todo-app-data';

export const loadTodos = (): TodoItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    
    // 日付文字列をDateオブジェクトに変換
    return parsed.todos.map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt)
    }));
  } catch (error) {
    console.error('Failed to load todos:', error);
    throw new Error('Storage load failed');
  }
};

export const saveTodos = (todos: TodoItem[]): void => {
  try {
    const data = { 
      todos, 
      lastUpdated: new Date().toISOString() 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save todos:', error);
    throw new Error('Storage save failed');
  }
}; 