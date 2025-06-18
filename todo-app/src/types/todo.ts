export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoList {
  items: TodoItem[];
}

export type TodoFilter = 'all' | 'active' | 'completed';

export type TodoHandler = (id: string) => void;
export type TodoCreator = (title: string) => TodoItem;
export type TodoUpdater = (id: string, title: string) => void;

export interface UseTodosReturn {
  todos: TodoItem[];
  isLoading: boolean;
  error: string | null;
  addTodo: TodoCreator;
  deleteTodo: TodoHandler;
  toggleTodo: TodoHandler;
  updateTodo: TodoUpdater;
} 