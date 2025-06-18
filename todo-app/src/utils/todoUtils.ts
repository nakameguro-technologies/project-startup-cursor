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