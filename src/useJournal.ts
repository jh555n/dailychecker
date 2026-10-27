import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Data, decodeData, initialData } from './domain';

const STORAGE_KEY = 'dailychecker:v1';
export function useJournal() {
  const [data, setData] = useState<Data>(initialData);
  const current = useRef(data);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  async function load() {
    setError('');
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const next = raw === null ? initialData : decodeData(raw);
      current.current = next;
      setData(next);
      setReady(true);
    } catch {
      setError(
        '저장된 기록을 불러오지 못했어요. 기존 데이터는 그대로 보존됩니다. 저장 공간과 브라우저 설정을 확인한 후 다시 시도해 주세요.',
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(update: (previous: Data) => Data): Promise<boolean> {
    if (!ready || locked.current) return false;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      const next = update(current.current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      current.current = next;
      setData(next);
      return true;
    } catch {
      setError('기록을 저장하지 못했어요. 저장 공간을 확인하고 다시 시도해 주세요.');
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return { data, ready, busy, error, save, reload: load };
}
