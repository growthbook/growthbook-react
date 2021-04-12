import * as React from 'react';
import { default as COLORS } from './colors';

export default function ScreenshotPromptOverlay() {
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
        zIndex: 999999
      }}
    >
      <style>{`
* {
  cursor: none !important;
}
      `}</style>
      Share your screen to take screenshots.
      <p style={{ fontSize: '0.7em' }}>
        <em>Don&apos;t worry. Nothing is sent across the network.</em>
      </p>
    </div>
  );
}
