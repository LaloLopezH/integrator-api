import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class Trama32RTrackerService {
  private dataSubject = new BehaviorSubject<string[]>([]);

  get tramas$() {
    return this.dataSubject.asObservable();
  }

  addTrama(newValue: string) {
    const currentData = this.dataSubject.getValue();
    this.dataSubject.next([...currentData, newValue]);
  }

  removeItem(trama: string): void {
    const currentData = this.dataSubject.getValue().filter(item => item !== trama);
    this.dataSubject.next(currentData);
  }

}