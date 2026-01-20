import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FileRemoveService {
  private fileListSubject = new BehaviorSubject<string[]>([]);
  private fileList: string[] = [];

  readonly fileList$ = this.fileListSubject.asObservable();

  addFile(fileName: string): void {
    if (!this.fileList.includes(fileName)) {
      this.fileList.push(fileName);
      this.fileListSubject.next([...this.fileList]);
    }
  }

  removeFile(fileName: string): void {
    this.fileList = this.fileList.filter(file => file !== fileName);
    this.fileListSubject.next([...this.fileList]);
  }

  getFileList(): string[] {
    return [...this.fileList];
  }
}