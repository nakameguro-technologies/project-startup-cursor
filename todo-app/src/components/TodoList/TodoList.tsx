import React from 'react';
import { TodoItem as TodoItemType, TodoHandler, TodoUpdater } from '../../types/todo';
import { TodoItem } from '../TodoItem/TodoItem';
import styles from './TodoList.module.css';

interface TodoListProps {
  todos: TodoItemType[];
  onToggle: TodoHandler;
  onUpdate: TodoUpdater;
  onDelete: TodoHandler;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggle,
  onUpdate,
  onDelete
}) => {
  if (todos.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📝</span>
        ToDoリストが空です。<br />
        新しいToDoを追加してください。
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}; 