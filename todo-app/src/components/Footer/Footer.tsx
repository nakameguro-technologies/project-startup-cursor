import React from 'react';
import { TodoItem } from '../../types/todo';
import styles from './Footer.module.css';

interface FooterProps {
  todos: TodoItem[];
}

export const Footer: React.FC<FooterProps> = ({ todos }) => {
  const totalCount = todos.length;
  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = totalCount - completedCount;

  return (
    <footer className={styles.footer}>
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{totalCount}</span>
          <span className={styles.statLabel}>総数</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{activeCount}</span>
          <span className={styles.statLabel}>未完了</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{completedCount}</span>
          <span className={styles.statLabel}>完了</span>
        </div>
      </div>
    </footer>
  );
}; 