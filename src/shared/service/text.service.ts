import { Injectable } from '@nestjs/common';

@Injectable()
export class TextService {
  padText(input: string, length: number, defaultValue: string = ' '): string {
    if (input == null || input.length >= length) {
      return input;
    }
    return defaultValue.repeat(length - input.length) + input;
  }

  padRight(text: string, length: number): string {
    return text.padEnd(length, ' ');
  }
}