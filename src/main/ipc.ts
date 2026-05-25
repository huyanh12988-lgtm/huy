import { db } from './database';
import { Candidate, AdmissionStatus, UserRole } from '../types';

/**
 * SIMULATED IPC BRIDGE (mimicking Electron IPC)
 * Centralizes all data operations
 */
export const IpcMain = {
  // Candidate Handlers
  getCandidates: async (): Promise<Candidate[]> => {
    const raw = db.get('candidates') || [];
    // Migration: ensuring every candidate has a valid ID
    let hasChanges = false;
    const migrated = raw.map((c: any) => {
      if (!c.id) {
        c.id = IpcMain.generateId();
        hasChanges = true;
      }
      return c as Candidate;
    });
    
    if (hasChanges) {
      db.save('candidates', migrated);
    }
    
    return migrated;
  },

  generateId: () => {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }
      return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
    } catch (e) {
      return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
    }
  },

  saveCandidates: async (candidates: Candidate[]): Promise<void> => {
    db.save('candidates', candidates);
  },

  addCandidate: async (candidate: Omit<Candidate, 'id' | 'createdAt' | 'status' | 'totalScore'>): Promise<Candidate> => {
    const list = await IpcMain.getCandidates();
    const idNum = String(candidate.identificationNumber).trim().toUpperCase();
    
    // Check for duplicate identificationNumber (trimmed and case-insensitive)
    const duplicate = list.find(c => String(c.identificationNumber).trim().toUpperCase() === idNum);
    if (duplicate) {
      throw new Error(`Thí sinh với số CCCD ${idNum} đã tồn tại trong hệ thống.`);
    }

    const newCandidate: Candidate = {
      ...candidate,
      identificationNumber: idNum,
      id: IpcMain.generateId(),
      status: AdmissionStatus.PENDING,
      totalScore: Number(candidate.mathScore) + Number(candidate.literatureScore) + Number(candidate.englishScore),
      createdAt: new Date().toISOString()
    };
    await IpcMain.saveCandidates([...list, newCandidate]);
    return newCandidate;
  },

  addCandidates: async (newCandidates: Omit<Candidate, 'id' | 'createdAt' | 'status' | 'totalScore'>[]): Promise<void> => {
    const list = await IpcMain.getCandidates();
    const existingNumbers = new Set(list.map(c => String(c.identificationNumber).trim().toUpperCase()));
    
    const candidatesToAdd: Candidate[] = [];
    const now = new Date().toISOString();

    for (const data of newCandidates) {
      const idNum = String(data.identificationNumber).trim().toUpperCase();
      if (idNum && !existingNumbers.has(idNum)) {
        candidatesToAdd.push({
          ...data,
          identificationNumber: idNum,
          id: IpcMain.generateId(),
          status: AdmissionStatus.PENDING,
          totalScore: Number(data.mathScore) + Number(data.literatureScore) + Number(data.englishScore),
          createdAt: now
        });
        existingNumbers.add(idNum);
      }
    }

    if (candidatesToAdd.length > 0) {
      await IpcMain.saveCandidates([...list, ...candidatesToAdd]);
    }
  },

  updateCandidate: async (id: string, updates: Partial<Candidate>): Promise<void> => {
    const list = await IpcMain.getCandidates();
    const updated = list.map(c => c.id === id ? { ...c, ...updates } : c);
    await IpcMain.saveCandidates(updated);
  },

  deleteCandidate: async (id: string): Promise<void> => {
    if (!id) return;
    const list = await IpcMain.getCandidates();
    const beforeCount = list.length;
    const targetId = String(id).trim();
    
    // Exact match filter
    const filtered = list.filter(c => String(c.id || '').trim() !== targetId);
    
    if (filtered.length === beforeCount) {
      // If we are here, ID didn't match. 
      // This is a single delete, usually from a row where we HAVE the candidate object.
      // But here we only have the ID.
      throw new Error(`Không thấy thí sinh với mã ${id} trong dữ liệu.`);
    }
    
    await IpcMain.saveCandidates(filtered);
  },

  deleteCandidates: async (ids: string[]): Promise<void> => {
    if (!ids || ids.length === 0) return;
    
    // Use a fresh copy of data
    let list = await IpcMain.getCandidates();
    const initialCount = list.length;
    
    // Normalize target IDs
    const targetIds = new Set(ids.map(id => String(id).trim()).filter(Boolean));
    
    // Filter list
    const filtered = list.filter(c => {
      const currentId = String(c.id || '').trim();
      return !targetIds.has(currentId);
    });
    
    const deletedCount = initialCount - filtered.length;
    
    if (deletedCount === 0) {
      // Fallback: If no IDs matched, try matching by identificationNumber for the selected items
      // (This is a safety net if IDs are unstable)
      console.warn('No ID matches found for deletion. Attempting fallback match.');
      // Actually we don't have the identificationNumbers here, only the IDs.
      // If we are here, it means the IDs in 'ids' are not in 'list'.
      throw new Error(`Không thể xóa: Không tìm thấy thí sinh nào khớp với danh sách đã chọn (ID mismatch). Vui lòng tải lại trang.`);
    }
    
    // Save updated list
    await IpcMain.saveCandidates(filtered);
    console.log(`Deleted ${deletedCount} candidates using bulk delete.`);
  },

  deleteAllCandidates: async (): Promise<void> => {
    await IpcMain.saveCandidates([]);
  },

  // Auth Handlers
  authenticate: async (user: string, pass: string): Promise<{role: UserRole} | null> => {
    // Simulated auth
    if (user === 'admin' && pass === 'admin123') return { role: UserRole.ADMIN };
    if (user === 'user' && pass === 'user123') return { role: UserRole.USER };
    return null;
  }
};
