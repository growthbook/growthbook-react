import * as React from 'react';
import GrowthBookUser from '@growthbook/growthbook/dist/user';
import { captureScreenshots, cropScreenshots } from './screenshot';

const SESSION_STORAGE_OPEN_KEY = 'gbdev_open';
const COLORS = {
  bg: '#2f0e6c',
  shadow: 'rgba(47,14,108,60%)',
  text: '#f5f7fa',
  selected: '#8fd5ec',
  hover: '#dde8f8',
};

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
  const [screenshotSelection, setScreenshotSelection] = React.useState({
    selecting: false,
    finished: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });
  const [screenshotData, setScreenshotData] = React.useState<null | {
    experiment: string;
    capturedImages?: string[];
    croppedImages?: string[];
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
      .then((capturedImages) => {
        setScreenshotData({
          experiment: screenshotExperiment,
          capturedImages,
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
}
    `;

    if (screenshotData.croppedImages) {
      return (
        <div className="growthbook_screenshot white">
          <style>{`
${globalStyle}
body {
  overflow: hidden;
}
.growthbook_screenshot .screenshots {
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 60px;
  place-content: flex-start;
  align-items: flex-start;
}
.growthbook_screenshot img {
  max-width: 100%;
  display: block;
  border: 1px solid #ddd;
  margin-bottom: 8px;
}
.growthbook_screenshot .screenshots > div {
  background: #f4f4f4;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  margin: 10px;
  text-align: center;
}
.growthbook_screenshot .screenshots a {
  display: inline-block;
  padding: 4px 12px;
  background: #333;
  color: #fff;
  border: 0;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.2s;
}
.growthbook_screenshot a:hover {
  color: #fff;
  text-decoration: none;
  background: #555;
}
.growthbook_screenshot .controls {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${COLORS.bg};
  color: ${COLORS.text};
  line-height: 30px;
}
.growthbook_screenshot .controls a {
  color: ${COLORS.text};
  padding: 0 5px;
  background: rgba(255,255,255,0);
  transition: background-color 0.2s;
}
.growthbook_screenshot .controls a:hover {
  color: ${COLORS.text};
  background: rgba(255,255,255,0.2);
}
          `}</style>
          <div className="screenshots">
            {screenshotData.croppedImages.map((src, i) => {
              return (
                <div key={i}>
                  <img
                    src={src}
                    alt={`Screenshot of ${screenshotData.experiment} variation ${i}`}
                  />
                  <a
                    href={src}
                    download={`${screenshotData.experiment}_${i}.png`}
                  >
                    Download
                  </a>
                </div>
              );
            })}
          </div>
          <div className="controls">
            <button
              onClick={(e) => {
                e.preventDefault();
                if (screenshotData.croppedImages) {
                  screenshotData.croppedImages.forEach(URL.revokeObjectURL);
                }
                setScreenshotData({
                  ...screenshotData,
                  croppedImages: undefined,
                });
                setScreenshotSelection({
                  selecting: false,
                  finished: false,
                  x1: 0,
                  x2: 0,
                  y1: 0,
                  y2: 0,
                });
              }}
            >
              Back
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (screenshotData.croppedImages) {
                  screenshotData.croppedImages.forEach(URL.revokeObjectURL);
                }
                if (screenshotData.capturedImages) {
                  screenshotData.capturedImages.forEach(URL.revokeObjectURL);
                }
                setScreenshotData(null);
                setScreenshotSelection({
                  selecting: false,
                  finished: false,
                  x1: 0,
                  x2: 0,
                  y1: 0,
                  y2: 0,
                });
              }}
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    if (screenshotData.capturedImages) {
      return (
        <div className="growthbook_screenshot">
          <style
            dangerouslySetInnerHTML={{
              __html: `
.growthbook_screenshot {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
}
.growthbook_screenshot .canvases, .growthbook_screenshot .canvas_overlay, .growthbook_screenshot .canvases img {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}
.growthbook_screenshot .canvases img {
  opacity: ${(1 / screenshotData.capturedImages.length).toFixed(3)};
  pointer-events: none;
}
.growthbook_screenshot.canvases img:first-child {
  opacity: 1;
}
.growthbook_screenshot .selection_box {
  position: absolute;
  border: 3px dashed tomato;
}
            `,
            }}
          />
          <div className="canvases">
            {screenshotData.capturedImages.map((u, i) => (
              <img
                src={u}
                key={i}
                alt={`Screenshot of ${screenshotData.experiment} variation ${i}`}
              />
            ))}
          </div>
          <div
            className="canvas_overlay"
            onMouseDown={(e) => {
              e.preventDefault();
              setScreenshotSelection({
                selecting: true,
                finished: false,
                x1: e.clientX,
                y1: e.clientY,
                x2: e.clientX,
                y2: e.clientY,
              });
            }}
            onMouseMove={(e) => {
              setScreenshotSelection({
                ...screenshotSelection,
                x2: e.clientX,
                y2: e.clientY,
              });
            }}
            onMouseUp={async () => {
              setScreenshotSelection({
                ...screenshotSelection,
                finished: true,
                selecting: false,
              });

              if (screenshotData.capturedImages) {
                const { imageUrls } = await cropScreenshots(
                  screenshotData.capturedImages,
                  screenshotSelection.x1,
                  screenshotSelection.y1,
                  screenshotSelection.x2,
                  screenshotSelection.y2
                );
                setScreenshotData({
                  ...screenshotData,
                  croppedImages: imageUrls
                });
              }
            }}
          >
            {screenshotSelection.selecting && (
              <div
                className="selection_box"
                style={{
                  left: Math.min(
                    screenshotSelection.x1,
                    screenshotSelection.x2
                  ),
                  top: Math.min(screenshotSelection.y1, screenshotSelection.y2),
                  width: Math.abs(
                    screenshotSelection.x1 - screenshotSelection.x2
                  ),
                  height: Math.abs(
                    screenshotSelection.y1 - screenshotSelection.y2
                  ),
                }}
              />
            )}
          </div>
        </div>
      );
    }

    return null;
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
