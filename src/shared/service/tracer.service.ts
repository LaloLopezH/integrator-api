import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';

interface DictionaryItem {
  key: string;
  value: any[];
}

@Injectable()
export class TracerService {
  private dictionary: Record<string, any[]> = {};
  private dictionarySubject = new BehaviorSubject<Record<string, any[]>>(this.dictionary);

  public readonly dictionary$ = this.dictionarySubject.asObservable();

  addItem(key: string, item: any[]): void {
    if (!this.dictionary[key]) {
      this.dictionary[key] = [];
    }

    this.dictionary[key] = item;
    this.emitChanges();
  }

  removeItem(key: string): void {
    if (this.dictionary[key]) {
      delete this.dictionary[key];
      this.emitChanges();
    }
  }

  getDictionary(): Record<string, any[]> {
    return this.dictionary;
  }

  private emitChanges(): void {
    this.dictionarySubject.next(this.dictionary);
  }
}