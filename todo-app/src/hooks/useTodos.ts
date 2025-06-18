import { useState, useEffect, useCallback } from 'react';
import { TodoItem, UseTodosReturn } from '../types/todo';
import { createTodo, updateTodoItem, deleteTodoItem } from '../utils/todoUtils';
import { loadTodos, saveTodos } from '../utils/storage';

export const useTodos = (): UseTodosReturn => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期化時にLocalStorageからデータを読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedTodos = loadTodos();
        setTodos(loadedTodos);
      } catch (err) {
        setError('Failed to load todos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Todosが変更されるたびにLocalStorageに保存
  useEffect(() => {
    if (!isLoading) {
      try {
        saveTodos(todos);
        setError(null);
      } catch (err) {
        setError('Failed to save todos');
      }
    }
  }, [todos, isLoading]);

  const addTodo = useCallback((title: string): TodoItem => {
    const newTodo = createTodo(title);
    setTodos(prevTodos => [...prevTodos, newTodo]);
    return newTodo;
  }, []);

  const deleteTodo = useCallback((id: string): void => {
    setTodos(prevTodos => deleteTodoItem(prevTodos, id));
  }, []);

  const toggleTodo = useCallback((id: string): void => {
    setTodos(prevTodos => 
      updateTodoItem(prevTodos, id, { 
        completed: !prevTodos.find(todo => todo.id === id)?.completed 
      })
    );
  }, []);

  const updateTodo = useCallback((id: string, title: string): void => {
    setTodos(prevTodos => 
      updateTodoItem(prevTodos, id, { title: title.trim() })
    );
  }, []);

  return {
    todos,
    isLoading,
    error,
    addTodo,
    deleteTodo,
    toggleTodo,
    updateTodo
  };
}; 