import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeBackgroundChart } from './home-background-chart';

describe('HomeBackgroundChart', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza como elemento decorativo com a primeira série ativa', () => {
    const { container } = render(<HomeBackgroundChart />);

    const wrapper = screen.getByTestId('home-background-chart');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper).toHaveAttribute('data-active-series', 'count_article');
    expect(wrapper.className).toContain('pointer-events-none');

    const paths = container.querySelectorAll('svg path');
    // 2 linhas inativas + 1 área ativa + 1 linha ativa
    expect(paths).toHaveLength(4);
  });

  it('alterna automaticamente entre as séries a cada 5 segundos', () => {
    vi.useFakeTimers();
    render(<HomeBackgroundChart />);

    const wrapper = screen.getByTestId('home-background-chart');
    expect(wrapper).toHaveAttribute('data-active-series', 'count_article');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(wrapper).toHaveAttribute('data-active-series', 'count_patent');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(wrapper).toHaveAttribute(
      'data-active-series',
      'count_guidance_in_progress',
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(wrapper).toHaveAttribute('data-active-series', 'count_article');
  });

  it('limpa o intervalo ao desmontar', () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const { unmount } = render(<HomeBackgroundChart />);
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    clearIntervalSpy.mockRestore();
  });
});
