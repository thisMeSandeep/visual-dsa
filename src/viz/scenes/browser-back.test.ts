import type { BoxDrawable, Drawable, TextDrawable } from '../canvas/types';
import { layoutAnalogy } from '../renderers/analogy/layout';
import { SIZES } from '../sizes.fixture';
import { browserBack } from './browser-back';

const boxes = (drawables: Drawable[]) =>
  drawables.filter((d): d is BoxDrawable => d.kind === 'box');
const step = (n: number) => browserBack.layout(n, SIZES);
const page = (n: number, name: string) => boxes(step(n).drawables).find((b) => b.value === name);

describe('browser back scene', () => {
  it('starts on the home page with an empty back stack', () => {
    expect(boxes(step(0).drawables).map((b) => b.value)).toEqual(['home']);
  });

  it('pushes the page you leave onto the back stack', () => {
    const home = page(1, 'home')!;
    const news = page(1, 'news')!;
    expect(news.state).toBe('new');
    // home moved right, into the back stack.
    expect(home.x).toBeGreaterThan(news.x);
    expect(home.id).toBe(page(0, 'home')!.id);
  });

  it('stacks newer pages above older ones', () => {
    const [home, news, sport] = ['home', 'news', 'sport'].map((name) => page(3, name)!);
    expect(news.y).toBeLessThan(home.y);
    expect(sport.y).toBeLessThan(news.y);
    expect(page(3, 'scores')!.x).toBeLessThan(home.x);
  });

  it('pops the top page back into the window when Back is pressed', () => {
    const sport = page(4, 'sport')!;
    expect(sport.state).toBe('active');
    expect(sport.x).toBe(page(3, 'scores')!.x);
    expect(page(4, 'scores')).toBeUndefined();
    const back = step(4).drawables.find((d): d is TextDrawable => d.id === 'back-button');
    expect(back?.tone).toBe('signal-ink');
  });

  it('keeps the same size at every step and clamps out-of-range steps', () => {
    const sizes = Array.from({ length: browserBack.stepCount }, (_, n) => [
      step(n).width,
      step(n).height,
    ]);
    expect(new Set(sizes.map(String)).size).toBe(1);
    expect(step(99)).toEqual(step(browserBack.stepCount - 1));
    expect(step(-1)).toEqual(step(0));
  });
});

describe('layoutAnalogy', () => {
  it('draws the scene and step a lesson step names', () => {
    const scene = {
      renderer: 'analogy' as const,
      elements: [],
      meta: { sceneId: 'browser-back', sceneStep: 2 },
    };
    expect(layoutAnalogy(scene, SIZES)).toEqual(step(2));
  });

  it('returns nothing for an unknown scene', () => {
    expect(
      layoutAnalogy({ renderer: 'analogy', elements: [], meta: { sceneId: 'nope' } }, SIZES),
    ).toBeUndefined();
  });
});
