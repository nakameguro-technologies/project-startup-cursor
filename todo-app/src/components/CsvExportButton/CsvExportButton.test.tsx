import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CsvExportButton } from './CsvExportButton';
import { TodoItem } from '../../types/todo';
import * as todoUtils from '../../utils/todoUtils';

// downloadCsv関数をモック化
jest.mock('../../utils/todoUtils', () => ({
  ...jest.requireActual('../../utils/todoUtils'),
  downloadCsv: jest.fn()
}));

const mockDownloadCsv = todoUtils.downloadCsv as jest.MockedFunction<typeof todoUtils.downloadCsv>;

describe('CsvExportButton', () => {
  const mockTodos: TodoItem[] = [
    {
      id: 'test-id-1',
      title: 'テストToDo',
      completed: false,
      createdAt: new Date('2025-01-28T10:00:00.000Z'),
      updatedAt: new Date('2025-01-28T10:00:00.000Z')
    }
  ];

  beforeEach(() => {
    mockDownloadCsv.mockClear();
  });

  test('ToDoがある場合、有効なボタンが表示される', () => {
    render(<CsvExportButton todos={mockTodos} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('📥 CSV出力 (1件)');
  });

  test('ToDoがない場合、無効なボタンが表示される', () => {
    render(<CsvExportButton todos={[]} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('📥 CSV出力 (0件)');
  });

  test('disabledプロパティがtrueの場合、ボタンが無効になる', () => {
    render(<CsvExportButton todos={mockTodos} disabled={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('ボタンクリックでCSV出力が実行される', () => {
    const mockOnExport = jest.fn();
    render(<CsvExportButton todos={mockTodos} onExport={mockOnExport} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockDownloadCsv).toHaveBeenCalledTimes(1);
    expect(mockDownloadCsv).toHaveBeenCalledWith(
      expect.stringContaining('ID,タイトル,完了状態,作成日時,更新日時'),
      expect.stringMatching(/^todos_\d{4}-\d{2}-\d{2}\.csv$/)
    );
    expect(mockOnExport).toHaveBeenCalledTimes(1);
  });

  test('ToDoが0件の場合、適切なツールチップが表示される', () => {
    render(<CsvExportButton todos={[]} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'データがありません');
  });

  test('ToDoがある場合、適切なツールチップが表示される', () => {
    render(<CsvExportButton todos={mockTodos} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', '1件のToDoをCSV出力');
  });

  test('CSV出力エラー時にエラーメッセージが表示される', async () => {
    mockDownloadCsv.mockImplementation(() => {
      throw new Error('Download failed');
    });
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<CsvExportButton todos={mockTodos} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // エラーメッセージが表示されることを確認
    expect(await screen.findByText('CSV出力に失敗しました。もう一度お試しください。')).toBeInTheDocument();
    
    expect(consoleSpy).toHaveBeenCalledWith('CSV export failed:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
}); 