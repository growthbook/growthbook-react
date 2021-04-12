import * as React from 'react';
import { default as COLORS } from './colors';
import DownloadIcon from './DownloadIcon';
import { cropScreenshot } from './screenshot';

type ScrenshotSelectionHandle =
  | 'move'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'tl'
  | 'tr'
  | 'bl'
  | 'br';

type ScreenshotSelection = {
  handle: false | ScrenshotSelectionHandle;
  offsetX: number;
  offsetY: number;
  initialX: number;
  initialY: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export interface ScreenshotEditorProps {
  experiment: string;
  capturedImages: string[];
  imageW: number;
  imageH: number;
  variationNames: string[];
  close: () => void;
}

export default function ScreenshotEditor({
  experiment,
  capturedImages,
  imageW,
  imageH,
  variationNames,
  close,
}: ScreenshotEditorProps) {
  const [
    screenshotSelection,
    setScreenshotSelection,
  ] = React.useState<ScreenshotSelection>({
    handle: false,
    offsetX: 0,
    offsetY: 0,
    initialX: 0,
    initialY: 0,
    x1: 0,
    y1: 0,
    x2: 100,
    y2: 100,
  });

  return (
    <div className="growthbook_screenshot white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
body {
  overflow: hidden;
}
.growthbook_screenshot {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  z-index: 999999;
}
.growthbook_screenshot.white {
  background: #fff;
  color: #333;
}
.growthbook_screenshot .fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
}
.growthbook_screenshot .composite {
  position: absolute;
  top: 70px;
  left: 0;
  bottom: 0;
  width: 70vw;
  box-sizing: border-box;
  padding: 5px;
  background: #ddd;
}
.growthbook_screenshot * {
  user-select: none;
}
.growthbook_screenshot .canvases {
  max-width: 100%;
  max-height: 100%;
  display: inline-block;
  position: relative;
}
.growthbook_screenshot .canvases img {
  opacity: ${(1 / capturedImages.length).toFixed(3)};
  pointer-events: none;
  max-width: 100%;
  max-height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.growthbook_screenshot .canvases img:first-child {
  opacity: 1;
  position: relative;
}
.growthbook_screenshot .selection_box {
  position: absolute;
  border: 3px dashed tomato;
}
.growthbook_screenshot .selection_box > div {
  position: absolute;
  background: #ddd;
  opacity: 0.01;
  transition: opacity 0.2s;
}
.growthbook_screenshot .selection_box > div:hover {
  opacity: 0.3;
}
.growthbook_screenshot .w20 {
  width: 20px;
}
.growthbook_screenshot .h20 {
  height: 20px;
}
.growthbook_screenshot .l0 {
  left: 0;
}
.growthbook_screenshot .t0 {
  top: 0;
}
.growthbook_screenshot .r0 {
  right: 0;
}
.growthbook_screenshot .b0 {
  bottom: 0;
}
.growthbook_screenshot .l20 {
  left: 20px;
}
.growthbook_screenshot .t20 {
  top: 20px;
}
.growthbook_screenshot .r20 {
  right: 20px;
}
.growthbook_screenshot .b20 {
  bottom: 20px;
}
.growthbook_screenshot .ns {
  cursor: ns-resize;
}
.growthbook_screenshot .ew {
  cursor: ew-resize;
}
.growthbook_screenshot .nesw {
  cursor: nesw-resize;
}
.growthbook_screenshot .nwse {
  cursor: nwse-resize;
}
.growthbook_screenshot .move {
  cursor: move;
}
.growthbook_screenshot .variations {
  position: absolute;
  top: 70px;
  bottom: 60px;
  left: 70vw;
  width: 30vw;
  box-sizing: border-box;
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  background: ${COLORS.bg};
  color: ${COLORS.text};
}
.growthbook_screenshot .controls {
  position: absolute;
  bottom: 0;
  height: 60px;
  width: 30vw;
  left: 70vw;
  background: ${COLORS.bg};
  text-align: center;
  padding: 8px;
  box-sizing: border-box;
  border-top: 2px solid ${COLORS.selected};
}
.growthbook_screenshot .controls button {
  border: 0;
  background: ${COLORS.selected};
  color: ${COLORS.bg};
  padding: 12px 25px;
  box-sizing: border-box;
  line-height: 20px;
  text-align: center;
  display: inline-block;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.4em;
  transition: transform 0.1s;
}
.growthbook_screenshot .controls button:hover {
  transform: scale(1.1);
}
.growthbook_screenshot .variations > div {
  margin: 10px 0;
  position: relative;
}
.growthbook_screenshot .variations .img {
  border: 1px solid #ddd;
  overflow: hidden;
  height: 0;
  width: 100%;
  background-repeat: no-repeat;
}
.growthbook_screenshot .variation-header {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}
.growthbook_screenshot .download-button {
  background: ${COLORS.selected};
  color: ${COLORS.bg};
  border: 0;
  border-radius: 4px;
  padding: 7px 20px;
  margin: 0;
  font-size: 1em;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.1s;
}
.growthbook_screenshot .download-button:hover {
  transform: scale(1.1);
}
.growthbook_screenshot .download-button .span {
  font-size: 0.8em;
}
.growthbook_screenshot .download-button svg {
  vertical-align: middle;
}
.growthbook_screenshot .composite-title {
  position: absolute;
  top: 0;
  left: 0;
  width: 70vw;
  height: 70px;
  box-sizing: border-box;
  padding: 5px;
  text-align: center;
  z-index: 10;
  background: ${COLORS.bg};
  color: ${COLORS.text};
  border-bottom: 3px solid rgba(0,0,0,.5);
}
.growthbook_screenshot .variations-title {
  position: absolute;
  top: 0;
  left: 70vw;
  width: 30vw;
  height: 70px;
  box-sizing: border-box;
  padding: 5px;
  text-align: center;
  z-index: 10;
  border-bottom: 3px solid rgba(0,0,0,.5);
  background: ${COLORS.bg};
  color: ${COLORS.text};
}
.growthbook_screenshot h2 {
  font-size: 28px;
  line-height: 36px;
  font-weight: bold;
  margin: 0;
  padding: 0;
}
.growthbook_screenshot p {
  font-size: 16px;
  line-height: 24px;
  margin: 0;
  padding: 0;
}
        `,
        }}
      />
      <div className="composite-title">
        <h2>Composite Overlay</h2>
        <p>Drag the red border to crop your screenshots</p>
      </div>
      <div className="variations-title">
        <h2>Variations</h2>
        <p>Download the screenshots here</p>
      </div>
      <div className="variations">
        <h3>{experiment}</h3>
        {capturedImages.map((u, i) => {
          const wPercent =
            Math.abs(screenshotSelection.x2 - screenshotSelection.x1) / 100;
          const hPercent =
            Math.abs(screenshotSelection.y2 - screenshotSelection.y1) / 100;
          const w = wPercent * (imageW || 1);
          const h = hPercent * (imageH || 1);
          const xOffset = (
            Math.min(screenshotSelection.x1, screenshotSelection.x2) /
              (1 - wPercent) || 0
          ).toFixed(2);
          const yOffset = (
            Math.min(screenshotSelection.y1, screenshotSelection.y2) /
              (1 - hPercent) || 0
          ).toFixed(2);

          return (
            <div key={i}>
              <div className="variation-header">
                <h5>
                  {i}. {variationNames[i] ?? `Variation ${i}`}
                </h5>
                <button
                  className="download-button"
                  onClick={(e) => {
                    e.preventDefault();
                    cropScreenshot(
                      u,
                      (screenshotSelection.x1 / 100) * imageW,
                      (screenshotSelection.y1 / 100) * imageH,
                      (screenshotSelection.x2 / 100) * imageW,
                      (screenshotSelection.y2 / 100) * imageH
                    ).then((downloadUrl) => {
                      const a = document.createElement('a');
                      a.download = `${experiment}_${i}.png`;
                      a.style.display = 'none';
                      a.href = downloadUrl;
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        a.remove();
                        URL.revokeObjectURL(downloadUrl);
                      }, 200);
                    });
                  }}
                >
                  <DownloadIcon /> <span>(.png)</span>
                </button>
              </div>
              <div
                className="img"
                style={{
                  backgroundImage: `url(${u})`,
                  backgroundSize: (100 / wPercent).toFixed(3) + '%',
                  paddingTop: ((100 * h) / w).toFixed(3) + '%',
                  backgroundPosition: `${xOffset}% ${yOffset}%`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="controls">
        <button
          onClick={(e) => {
            e.preventDefault();
            close();
          }}
        >
          Done
        </button>
      </div>
      <div className="composite">
        <div className="canvases">
          {capturedImages.map((u, i) => (
            <img
              src={u}
              key={i}
              alt={`Screenshot of ${experiment} variation ${i}`}
            />
          ))}
          <div
            className="canvas_overlay fullscreen"
            onMouseLeave={() => {
              setScreenshotSelection({
                ...screenshotSelection,
                handle: false,
              });
            }}
            onMouseDown={(e) => {
              const target = e.target as HTMLElement;
              if (!target) return;

              const prop = target.dataset.prop as ScrenshotSelectionHandle;
              if (!prop) return;

              const container = (e.target as HTMLElement)
                .closest('.canvases')
                ?.querySelector('.selection_box');
              if (!container) return;
              const boundingBox = container.getBoundingClientRect();

              let initialX = Math.min(
                screenshotSelection.x1,
                screenshotSelection.x2
              );
              let initialY = Math.min(
                screenshotSelection.y1,
                screenshotSelection.y2
              );

              let refX = boundingBox.x;
              let refY = boundingBox.y;

              if (['tr', 'right', 'br'].includes(prop)) {
                initialX = Math.max(
                  screenshotSelection.x1,
                  screenshotSelection.x2
                );
                refX += boundingBox.width;
              }
              if (['bl', 'bottom', 'br'].includes(prop)) {
                initialY = Math.max(
                  screenshotSelection.y1,
                  screenshotSelection.y2
                );
                refY += boundingBox.height;
              }

              setScreenshotSelection({
                ...screenshotSelection,
                handle: prop,
                offsetX: e.clientX - refX,
                offsetY: e.clientY - refY,
                initialX,
                initialY,
              });
            }}
            onMouseUp={() => {
              setScreenshotSelection({
                ...screenshotSelection,
                handle: false,
              });
            }}
            onMouseMove={(e) => {
              if (!screenshotSelection.handle) return;
              const container = (e.target as HTMLElement).closest('.canvases');
              if (!container) return;
              const boundingBox = container.getBoundingClientRect();

              let currentX =
                (100 *
                  (e.clientX -
                    screenshotSelection.offsetX -
                    boundingBox.left)) /
                boundingBox.width;
              let currentY =
                (100 *
                  (e.clientY - screenshotSelection.offsetY - boundingBox.top)) /
                boundingBox.height;

              if (currentX < 0) currentX = 0;
              else if (currentX > 100) currentX = 100;
              if (currentY < 0) currentY = 0;
              else if (currentY > 100) currentY = 100;

              const override: Partial<ScreenshotSelection> = {};
              if (['left', 'tl', 'bl'].includes(screenshotSelection.handle)) {
                override.x1 = currentX;
              }
              if (['right', 'tr', 'br'].includes(screenshotSelection.handle)) {
                override.x2 = currentX;
              }
              if (['top', 'tl', 'tr'].includes(screenshotSelection.handle)) {
                override.y1 = currentY;
              }
              if (['bottom', 'bl', 'br'].includes(screenshotSelection.handle)) {
                override.y2 = currentY;
              }
              if (screenshotSelection.handle === 'move') {
                const currentX2 =
                  currentX +
                  Math.abs(screenshotSelection.x2 - screenshotSelection.x1);
                const currentY2 =
                  currentY +
                  Math.abs(screenshotSelection.y2 - screenshotSelection.y1);

                if (currentX2 <= 100) {
                  override.x1 = currentX;
                  override.x2 = currentX2;
                }
                if (currentY2 <= 100) {
                  override.y1 = currentY;
                  override.y2 = currentY2;
                }
              }

              const newVal = {
                ...screenshotSelection,
                ...override,
              };

              // Make sure the width/height are at least 50px each
              if ((Math.abs(newVal.x2 - newVal.x1) * imageW) / 100 < 50) {
                newVal.x1 = screenshotSelection.x1;
                newVal.x2 = screenshotSelection.x2;
              }
              if ((Math.abs(newVal.y2 - newVal.y1) * imageH) / 100 < 50) {
                newVal.y1 = screenshotSelection.y1;
                newVal.y2 = screenshotSelection.y2;
              }
              setScreenshotSelection(newVal);
            }}
          >
            <div
              className="selection_box"
              style={{
                left:
                  Math.min(screenshotSelection.x1, screenshotSelection.x2) +
                  '%',
                top:
                  Math.min(screenshotSelection.y1, screenshotSelection.y2) +
                  '%',
                width:
                  Math.abs(screenshotSelection.x1 - screenshotSelection.x2) +
                  '%',
                height:
                  Math.abs(screenshotSelection.y1 - screenshotSelection.y2) +
                  '%',
              }}
            >
              <div data-prop="left" className="t20 b20 l0 w20 ew" />
              <div data-prop="right" className="t20 b20 r0 w20 ew" />
              <div data-prop="bottom" className="l20 r20 b0 h20 ns" />
              <div data-prop="top" className="l20 r20 t0 h20 ns" />
              <div data-prop="tl" className="l0 t0 w20 h20 nwse" />
              <div data-prop="tr" className="r0 t0 w20 h20 nesw" />
              <div data-prop="bl" className="l0 b0 w20 h20 nesw" />
              <div data-prop="br" className="r0 b0 w20 h20 nwse" />
              <div data-prop="move" className="t20 l20 r20 b20 move" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
