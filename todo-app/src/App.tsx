import React from 'react';
import { useTodos } from './hooks/useTodos';
import { NewTodoForm } from './components/NewTodoForm/NewTodoForm';
import { TodoList } from './components/TodoList/TodoList';
import { Footer } from './components/Footer/Footer';
import { CsvExportButton } from './components/CsvExportButton/CsvExportButton';
import styles from './components/App/App.module.css';

export const App: React.FC = () => {
  const { todos, isLoading, error, addTodo, deleteTodo, toggleTodo, updateTodo } = useTodos();

  if (isLoading) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Todo App</h1>
        <NewTodoForm onAddTodo={addTodo} />
      </header>

      {error && (
        <div className={styles.error}>
          エラーが発生しました: {error}
        </div>
      )}

      <main>
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      </main>

      <Footer todos={todos} />
      
      <CsvExportButton todos={todos} />
    </div>
  );
};
