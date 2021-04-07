import * as React from 'react';
import GrowthBookUser from '@growthbook/growthbook/dist/user';
import { captureScreenshots } from './screenshot';

const SESSION_STORAGE_OPEN_KEY = 'gbdev_open';
const COLORS = {
  bg: '#2f0e6c',
  shadow: 'rgba(47,14,108,60%)',
  text: '#f5f7fa',
  selected: '#8fd5ec',
  hover: '#dde8f8',
};

type ScrenshotSelectionResizing =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'tl'
  | 'tr'
  | 'bl'
  | 'br';

type ScreenshotSelection = {
  resizing: false | ScrenshotSelectionResizing;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/*
function getDragProps(
  setScreenshotSelection: React.Dispatch<React.SetStateAction<ScreenshotSelection>>,
  ew: boolean,
  ns: boolean,
) {
  return {

  }
}
*/

function Camera() {
  return (
    <svg
      version="1.1"
      width={24}
      fill={COLORS.text}
      viewBox="0 0 30 30"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g>
        <path d="M6,19V17c0-0.552-0.448-1-1-1H5c-0.552,0-1,0.448-1,1V19c0,0.552,0.448,1,1,1H5C5.552,20,6,19.552,6,19z" />
        <path d="M10,5L10,5c0,0.553,0.448,1,1,1H13c0.552,0,1-0.448,1-1V5c0-0.552-0.448-1-1-1H11C10.448,4,10,4.448,10,5z" />
        <path d="M5,14L5,14c0.553,0,1-0.448,1-1V11c0-0.552-0.448-1-1-1H5c-0.552,0-1,0.448-1,1V13C4,13.552,4.448,14,5,14z" />
        <path d="M23,6h1l0,1c0,0.552,0.448,1,1,1h0c0.552,0,1-0.448,1-1V6c0-1.105-0.895-2-2-2h-1c-0.552,0-1,0.448-1,1v0   C22,5.552,22.448,6,23,6z" />
        <path d="M16,5L16,5c0,0.552,0.448,1,1,1h2c0.552,0,1-0.448,1-1v0c0-0.552-0.448-1-1-1h-2C16.448,4,16,4.448,16,5z" />
        <path d="M7,24H6v-1c0-0.552-0.448-1-1-1H5c-0.552,0-1,0.448-1,1v1c0,1.105,0.895,2,2,2h1c0.552,0,1-0.448,1-1V25   C8,24.448,7.552,24,7,24z" />
        <path d="M6,7V6h1c0.552,0,1-0.448,1-1V5c0-0.552-0.448-1-1-1H6C4.895,4,4,4.895,4,6v1c0,0.552,0.448,1,1,1H5C5.552,8,6,7.552,6,7z" />
        <path d="M24,11l0,2.001c0,0.552,0.448,1,1,1h0c0.552,0,1-0.448,1-1V11c0-0.552-0.448-1-1-1h0C24.448,10,24,10.448,24,11z" />
      </g>
      <g>
        <path d="M25,16h-1.764c-0.758,0-1.45-0.428-1.789-1.106l-0.171-0.342C21.107,14.214,20.761,14,20.382,14h-4.764   c-0.379,0-0.725,0.214-0.894,0.553l-0.171,0.342C14.214,15.572,13.521,16,12.764,16H11c-0.552,0-1,0.448-1,1v8c0,0.552,0.448,1,1,1   h14c0.552,0,1-0.448,1-1v-8C26,16.448,25.552,16,25,16z M18,25c-2.209,0-4-1.791-4-4c0-2.209,1.791-4,4-4s4,1.791,4,4   C22,23.209,20.209,25,18,25z" />
        <circle cx="18" cy="21" r="2" />
      </g>
    </svg>
  );
}

export default function VariationSwitcher({
  forceVariation,
  user,
}: {
  forceVariation: (key: string, variation: number) => void;
  user: GrowthBookUser;
  renderCount: number;
}): null | React.ReactElement {
  const [variations, setVariations] = React.useState<
    Map<
      string,
      {
        assigned: number;
        possible: any[];
      }
    >
  >(new Map());
  const [open, setOpen] = React.useState(false);
  const [
    screenshotSelection,
    setScreenshotSelection,
  ] = React.useState<ScreenshotSelection>({
    resizing: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });
  const [screenshotData, setScreenshotData] = React.useState<null | {
    experiment: string;
    capturedImages?: string[];
    w?: number;
    h?: number;
  }>(null);

  // Restore open state from sessionStorage
  React.useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_STORAGE_OPEN_KEY)) {
        setOpen(true);
      }
    } catch (e) {
      // Ignore session storage errors
    }
  }, []);

  // Capture screenshots of experiment variations
  const screenshotExperiment = screenshotData?.experiment;
  const screenshotNumVariations =
    variations.get(screenshotExperiment || '')?.possible?.length || 0;
  React.useEffect(() => {
    if (!screenshotExperiment) return;
    captureScreenshots(screenshotNumVariations, (i) => {
      forceVariation(screenshotExperiment, i);
    })
      .then(({ capturedImages, w, h }) => {
        setScreenshotData({
          experiment: screenshotExperiment,
          capturedImages,
          w,
          h,
        });
        setScreenshotSelection({
          resizing: false,
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100,
        });
      })
      .catch((e) => {
        console.error(e);
        setScreenshotData(null);
      });
  }, [screenshotExperiment, forceVariation, screenshotNumVariations]);

  // When a user is put into an experiment, schedule an update of the UI
  React.useEffect(() => {
    let current = true;
    const unsubscriber = user.subscribe(() => {
      requestAnimationFrame(() => {
        current && setVariations(user.getAssignedVariations());
      });
    });
    setVariations(user.getAssignedVariations());
    return () => {
      current = false;
      unsubscriber();
    };
  }, [user]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  if (!variations.size) {
    return null;
  }
  if (screenshotData) {
    const globalStyle = `
.growthbook_screenshot {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
    `;
    if (screenshotData.capturedImages) {
      return (
        <div className="growthbook_screenshot white">
          <style
            dangerouslySetInnerHTML={{
              __html: `
${globalStyle}
.growthbook_screenshot .composite {
  position: absolute;
  top: 70px;
  left: 0;
  bottom: 0;
  width: 70vw;
  box-sizing: border-box;
  padding: 5px;
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
  opacity: ${(1 / screenshotData.capturedImages.length).toFixed(3)};
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
  background: tomato;
  opacity: 0.01;
  transition: opacity 0.1s;
}
.growthbook_screenshot .selection_box > div:hover {
  opacity: 0.1;
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
  padding: 13px;
  box-sizing: border-box;
  border-top: 2px solid ${COLORS.selected};
}
.growthbook_screenshot .controls button {
  border: 0;
  background: ${COLORS.selected};
  color: ${COLORS.bg};
  padding: 7px 25px;
  box-sizing: border-box;
  line-height: 20px;
  text-align: center;
  display: inline-block;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.1s;
}
.growthbook_screenshot .controls button:hover {
  transform: scale(1.1);
}
.growthbook_screenshot .variations > div {
  margin: 10px 0;
}
.growthbook_screenshot .variations .img {
  border: 1px solid #ddd;
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
            <h3>{screenshotData.experiment}</h3>
            {screenshotData.capturedImages.map((u, i) => {
              const wPercent =
                Math.abs(screenshotSelection.x2 - screenshotSelection.x1) / 100;
              const hPercent =
                Math.abs(screenshotSelection.y2 - screenshotSelection.y1) / 100;
              const w = wPercent * (screenshotData.w || 1);
              const h = hPercent * (screenshotData.h || 1);
              const xOffset = (
                Math.min(screenshotSelection.x1, screenshotSelection.x2) /
                (1 - wPercent)
              ).toFixed(2);
              const yOffset = (
                Math.min(screenshotSelection.y1, screenshotSelection.y2) /
                (1 - hPercent)
              ).toFixed(2);

              return (
                <div key={i}>
                  <h5>
                    {JSON.stringify(
                      variations.get(screenshotData.experiment)?.possible?.[
                        i
                      ] ?? `Variation ${i}`
                    )}
                  </h5>
                  <div
                    className="img"
                    style={{
                      overflow: 'hidden',
                      height: 0,
                      width: '100%',
                      backgroundRepeat: 'no-repeat',
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
                if (screenshotData.capturedImages) {
                  screenshotData.capturedImages.forEach(URL.revokeObjectURL);
                  setScreenshotData(null);
                }
              }}
            >
              Done
            </button>
          </div>
          <div className="composite">
            <div className="canvases">
              {screenshotData.capturedImages.map((u, i) => (
                <img
                  src={u}
                  key={i}
                  alt={`Screenshot of ${screenshotData.experiment} variation ${i}`}
                />
              ))}
              <div
                className="canvas_overlay fullscreen"
                onMouseDown={(e) => {
                  const target = e.target as HTMLElement;
                  if (!target) return;

                  const prop = target.dataset
                    .prop as ScrenshotSelectionResizing;
                  if (!prop) return;

                  setScreenshotSelection({
                    ...screenshotSelection,
                    resizing: prop,
                  });
                }}
                onMouseUp={() => {
                  setScreenshotSelection({
                    ...screenshotSelection,
                    resizing: false,
                  });
                }}
                onMouseMove={(e) => {
                  if (!screenshotSelection.resizing) return;
                  const container = (e.target as HTMLElement).closest(
                    '.canvases'
                  );
                  if (!container) return;
                  const boundingBox = container.getBoundingClientRect();

                  const percentX =
                    (100 * (e.clientX - boundingBox.left)) / boundingBox.width;
                  const percentY =
                    (100 * (e.clientY - boundingBox.top)) / boundingBox.height;

                  const override: Partial<ScreenshotSelection> = {};
                  if (
                    ['left', 'tl', 'bl'].includes(screenshotSelection.resizing)
                  ) {
                    override.x1 = percentX;
                  }
                  if (
                    ['right', 'tr', 'br'].includes(screenshotSelection.resizing)
                  ) {
                    override.x2 = percentX;
                  }
                  if (
                    ['top', 'tl', 'tr'].includes(screenshotSelection.resizing)
                  ) {
                    override.y1 = percentY;
                  }
                  if (
                    ['bottom', 'bl', 'br'].includes(
                      screenshotSelection.resizing
                    )
                  ) {
                    override.y2 = percentY;
                  }

                  setScreenshotSelection({
                    ...screenshotSelection,
                    ...override,
                  });
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
                      Math.abs(
                        screenshotSelection.x1 - screenshotSelection.x2
                      ) + '%',
                    height:
                      Math.abs(
                        screenshotSelection.y1 - screenshotSelection.y2
                      ) + '%',
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
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="growthbook_screenshot"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          fontSize: '2.2em',
          textAlign: 'center',
          color: COLORS.text,
          background: COLORS.bg,
          opacity: 0.8,
        }}
      >
        Share your screen to take screenshots.
        <p style={{ fontSize: '0.7em' }}>
          <em>Don&apos;t worry. Nothing is sent across the network.</em>
        </p>
      </div>
    );
  }

  return (
    <div className={`growthbook_dev ${open ? 'open' : ''}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.growthbook_dev {
  position: fixed;
  bottom: 5px;
  left: 5px;
  width: 250px;
  padding: 5px 15px;
  background: ${COLORS.bg};
  color: ${COLORS.text};
  border-radius: 6px;
  opacity: 0.6;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  transition: opacity 0.2s, padding 0.2s;
  box-shadow: 0 0 6px 2px ${COLORS.shadow};
}
.growthbook_dev:hover {
  opacity: 1;
}
.growthbook_dev.open {
  opacity: 1;
  padding: 15px;
}
.growthbook_dev .toggle {
  position: absolute;
  color: ${COLORS.text};
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px; 
  border-radius: 30px;
  background: ${COLORS.bg};
  border: 2px solid ${COLORS.text};
  text-align: center;
  line-height: 26px;
  box-sizing: border-box;
  font-size: 24px;
  box-shadow: 0 0 6px 2px ${COLORS.shadow};
  cursor: pointer;
}
.growthbook_dev .toggle:hover {
  transform: scale(1.1);
}
.growthbook_dev h3 {
  font-size: 1.3em;
}
.growthbook_dev h5 {
  font-size: 1.1em;
}
.growthbook_dev h3, .growthbook_dev h5 {
  padding: 0;
  margin: 0;
}
.growthbook_dev .exp {
  margin: 0;
  overflow-y: hidden;
  max-height: 0;
  transition: max-height 0.2s, margin 0.2s;
}
.growthbook_dev.open .exp {
  max-height: 200px;
  margin: 10px 0;
}
.growthbook_dev .exp:last-child {
  margin-bottom: 0;
}
.growthbook_dev table {
  color: ${COLORS.bg};
  border-collapse: collapse;
  font-size: 0.9em;
  width: 100%;
  margin: 5px 0 10px;
  border-radius: 6px;
}
.growthbook_dev tr {
  cursor: pointer;
  transition: background-color 0.2s;
  background: ${COLORS.text};
}
.growthbook_dev tr:first-child th {
  border-top-left-radius: 6px;
}
.growthbook_dev tr:first-child td:last-child {
  border-top-right-radius: 6px;
}
.growthbook_dev tr:last-child th {
  border-bottom-left-radius: 6px;
}
.growthbook_dev tr:last-child td:last-child {
  border-bottom-right-radius: 6px;
}
.growthbook_dev tr:not(.current):hover {
  background: ${COLORS.hover};
}
.growthbook_dev td, .growthbook_dev th {
  border: 1px solid ${COLORS.bg};
  padding: 4px;
}
.growthbook_dev th {
  text-align: right;
  width: 2em;
}
.growthbook_dev table tr.current {
  background: ${COLORS.selected};
  cursor: default;
}
.growthbook_dev .explist {
  max-height: 400px;
  overflow-y: auto;
  margin-right: -6px;
  padding-right: 6px;
}
.growthbook_dev ::-webkit-scrollbar {
  width: 8px;
}
.growthbook_dev ::-webkit-scrollbar-thumb {
  background: rgba(255,255,255, 40%);
  border-radius: 6px;
}
.growthbook_dev button {
  background: transparent;
  border: 0;
  padding: 3px;
  cursor: pointer;
  vertical-align: middle;
  transition: transform 0.1s;
  color: ${COLORS.text}
}
.growthbook_dev button:hover {
  transform: scale(1.1);
}
      `,
        }}
      />
      <h3>Growth Book Dev</h3>
      <button
        className="toggle"
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => {
            try {
              window.sessionStorage.setItem(
                SESSION_STORAGE_OPEN_KEY,
                o ? '' : '1'
              );
            } catch (e) {
              // Ignore sessionStorage errors
            }
            return !o;
          });
        }}
      >
        {open ? '-' : '+'}
      </button>
      <div className="explist">
        {Array.from(variations).map(([key, { assigned, possible }]) => {
          return (
            <div className="exp" key={key}>
              <h5>
                {key}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setScreenshotData({
                      experiment: key,
                    });
                  }}
                >
                  <Camera />
                </button>
              </h5>
              <table>
                <tbody>
                  {possible.map((value, i) => (
                    <tr
                      key={i}
                      className={assigned === i ? 'current' : ''}
                      onClick={(e) => {
                        e.preventDefault();
                        forceVariation(key, i);
                      }}
                    >
                      <th>{i}</th>
                      <td>{JSON.stringify(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
