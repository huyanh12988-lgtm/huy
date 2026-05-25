import CryptoJS from 'crypto-js';
import { Candidate } from '../types';

/**
 * SIMULATED SECURE DATABASE (mimicking SQLite + SQLCipher)
 * Uses AES-256 for local storage encryption
 */
class SecureDatabase {
  private ENCRYPTION_KEY = 'ADM-SECRET-KEY-2026'; // In real Electron, this would be derived securely

  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.ENCRYPTION_KEY).toString();
  }

  private decrypt(ciphertext: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.ENCRYPTION_KEY);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    } catch (e) {
      console.error('Database decryption failed', e);
      return null;
    }
  }

  public save(key: string, data: any) {
    try {
      const encrypted = this.encrypt(data);
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.error('Database save failed', e);
      alert('Không thể lưu dữ liệu! Có thể bộ nhớ trình duyệt đã đầy.');
    }
  }

  public get(key: string): any {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return this.decrypt(data);
  }

  public clear(key: string) {
    localStorage.removeItem(key);
  }
}

export const db = new SecureDatabase();
