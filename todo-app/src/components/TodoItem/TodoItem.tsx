import React, { useState, useCallback } from 'react';
import { TodoItem as TodoItemType, TodoHandler, TodoUpdater } from '../../types/todo';
import { validateTodoTitle } from '../../utils/todoUtils';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: TodoHandler;
  onUpdate: TodoUpdater;
  onDelete: TodoHandler;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [todo.id, onToggle]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditTitle(todo.title);
  }, [todo.title]);

  const handleSave = useCallback(() => {
    const validation = validateTodoTitle(editTitle);
    if (!validation.isValid) {
      return;
    }

    const trimmedTitle = editTitle.trim();
    if (trimmedTitle !== todo.title) {
      onUpdate(todo.id, trimmedTitle);
    }
    setIsEditing(false);
  }, [editTitle, todo.id, todo.title, onUpdate]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditTitle(todo.title);
  }, [todo.title]);

  const handleDelete = useCallback(() => {
    onDelete(todo.id);
  }, [todo.id, onDelete]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(event.target.value);
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const itemClassName = todo.completed ? `${styles.item} ${styles.completed}` : styles.item;

  return (
    <div className={itemClassName}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className={styles.checkbox}
      />
      
      {isEditing ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className={styles.titleInput}
            maxLength={100}
            autoFocus
          />
          <div className={styles.actions}>
            <button onClick={handleSave} className={`${styles.button} ${styles.saveButton}`}>
              保存
            </button>
            <button onClick={handleCancel} className={`${styles.button} ${styles.cancelButton}`}>
              キャンセル
            </button>
          </div>
        </>
      ) : (
        <>
          <span className={styles.title}>{todo.title}</span>
          <div className={styles.actions}>
            <button onClick={handleEdit} className={`${styles.button} ${styles.editButton}`}>
              編集
            </button>
            <button onClick={handleDelete} className={`${styles.button} ${styles.deleteButton}`}>
              削除
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 