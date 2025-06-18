import { 
  formatDateForCsv, 
  generateCsvFilename, 
  convertTodosToCsv,
  createTodo 
} from './todoUtils';
import { TodoItem } from '../types/todo';

describe('CSV出力関連のユーティリティ関数', () => {
  describe('formatDateForCsv', () => {
    test('日付を正しいCSV形式に変換する', () => {
      const date = new Date('2025-01-28T15:30:45.123Z');
      const result = formatDateForCsv(date);
      expect(result).toBe('2025-01-28 15:30:45');
    });
  });

  describe('generateCsvFilename', () => {
    test('正しい形式のファイル名を生成する', () => {
      const filename = generateCsvFilename();
      expect(filename).toMatch(/^todos_\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });

  describe('convertTodosToCsv', () => {
    const mockTodos: TodoItem[] = [
      {
        id: 'test-id-1',
        title: '買い物に行く',
        completed: false,
        createdAt: new Date('2025-01-28T10:00:00.000Z'),
        updatedAt: new Date('2025-01-28T10:00:00.000Z')
      },
      {
        id: 'test-id-2',
        title: '特殊文字"テスト',
        completed: true,
        createdAt: new Date('2025-01-28T11:00:00.000Z'),
        updatedAt: new Date('2025-01-28T12:00:00.000Z')
      }
    ];

    test('ToDoリストを正しいCSV形式に変換する', () => {
      const result = convertTodosToCsv(mockTodos);
      const lines = result.split('\n');
      
      // ヘッダー行をチェック
      expect(lines[0]).toBe('ID,タイトル,完了状態,作成日時,更新日時');
      
      // データ行をチェック
      expect(lines[1]).toBe('"test-id-1","買い物に行く","未完了","2025-01-28 10:00:00","2025-01-28 10:00:00"');
      expect(lines[2]).toBe('"test-id-2","特殊文字""テスト","完了","2025-01-28 11:00:00","2025-01-28 12:00:00"');
    });

    test('空のToDoリストでもヘッダーが出力される', () => {
      const result = convertTodosToCsv([]);
      expect(result).toBe('ID,タイトル,完了状態,作成日時,更新日時');
    });

    test('特殊文字が適切にエスケープされる', () => {
      const todoWithSpecialChars = createTodo('タイトルに"ダブルクォート"が含まれる');
      const result = convertTodosToCsv([todoWithSpecialChars]);
      expect(result).toContain('"タイトルに""ダブルクォート""が含まれる"');
    });

    test('完了状態が正しく日本語で出力される', () => {
      const completedTodo = { ...createTodo('完了済み'), completed: true };
      const activeTodo = { ...createTodo('未完了'), completed: false };
      
      const result = convertTodosToCsv([completedTodo, activeTodo]);
      expect(result).toContain('"完了"');
      expect(result).toContain('"未完了"');
    });
  });
}); 