import { beforeAll } from 'vitest'

beforeAll(() => {
  const ctx: any = {
    canvas: {},
    fillStyle: 0,
    fillRect: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: [] }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    measureText: () => ({ width: 10 }),
  }
  if (!(HTMLCanvasElement.prototype as any).getContext) {
    (HTMLCanvasElement.prototype as any).getContext = () => ctx
  }
})
