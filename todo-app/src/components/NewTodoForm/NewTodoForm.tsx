import React, { useState, useCallback } from 'react';
import { TodoCreator } from '../../types/todo';
import { validateTodoTitle } from '../../utils/todoUtils';
import styles from './NewTodoForm.module.css';

interface NewTodoFormProps {
  onAddTodo: TodoCreator;
}

export const NewTodoForm: React.FC<NewTodoFormProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    
    const validation = validateTodoTitle(title);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid title');
      return;
    }

    onAddTodo(title);
    setTitle('');
    setError(null);
  }, [title, onAddTodo]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setError(null);
  }, []);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={title}
        onChange={handleInputChange}
        placeholder="新しいToDoを入力してください..."
        className={styles.input}
        maxLength={100}
      />
      <button 
        type="submit" 
        disabled={!title.trim()}
        className={styles.button}
      >
        追加
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </form>
  );
};
