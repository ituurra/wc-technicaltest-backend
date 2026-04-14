import { Injectable } from '@nestjs/common';
import { CachePort } from '../../../domain/ports/cache.port';

interface CacheRecord<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class InMemoryCacheAdapter implements CachePort {
  private readonly store = new Map<string, CacheRecord<unknown>>();

  get<T>(key: string): T | null {
    const record = this.store.get(key) as CacheRecord<T> | undefined;
    if (!record) return null;
    if (record.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return record.value;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}
