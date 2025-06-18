import React, { useCallback, useState } from 'react';
import { TodoItem } from '../../types/todo';
import { convertTodosToCsv, generateCsvFilename, downloadCsv } from '../../utils/todoUtils';
import styles from './CsvExportButton.module.css';

interface CsvExportButtonProps {
  todos: TodoItem[];
  onExport?: () => void;
  disabled?: boolean;
}

export const CsvExportButton: React.FC<CsvExportButtonProps> = ({
  todos,
  onExport,
  disabled = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    
    try {
      const csvContent = convertTodosToCsv(todos);
      const filename = generateCsvFilename();
      downloadCsv(csvContent, filename);
      
      // コールバック実行（統計・ログ用）
      onExport?.();
    } catch (error) {
      console.error('CSV export failed:', error);
      setError('CSV出力に失敗しました。もう一度お試しください。');
    } finally {
      setIsExporting(false);
    }
  }, [todos, onExport]);

  const isDisabled = disabled || todos.length === 0 || isExporting;

  return (
    <div className={styles.csvExportSection}>
      <button
        onClick={handleExport}
        className={`${styles.exportButton} ${isDisabled ? styles.disabled : ''}`}
        disabled={isDisabled}
        title={todos.length === 0 ? 'データがありません' : `${todos.length}件のToDoをCSV出力`}
      >
        {isExporting ? '📥 出力中...' : `📥 CSV出力 (${todos.length}件)`}
      </button>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}; 