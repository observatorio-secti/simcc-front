import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('ignora valores falsos', () => {
    expect(cn('px-2', false, undefined, 'py-1')).toBe('px-2 py-1');
  });

  it('mantém a última classe conflitante', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('resolve conflitos das cores do kit', () => {
    expect(cn('bg-eng-blue', 'bg-area-saude')).toBe('bg-area-saude');
  });
});
