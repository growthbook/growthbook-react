export function captureScreenshots(
  numVariations: number,
  forceVariation: (i: number) => void
): Promise<{ capturedImages: string[]; w: number; h: number }> {
  return (navigator.mediaDevices as any)
    .getDisplayMedia({
      video: {
        cursor: 'never',
      },
      audio: false,
    })
    .then((captureStream: MediaStream) => {
      return new Promise((resolve, reject) => {
        const settings = captureStream.getVideoTracks()[0].getSettings();

        const canvas = document.createElement('canvas');
        canvas.width = settings.width || 1024;
        canvas.height = settings.height || 768;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const w = settings.width || 0;
        const h = settings.height || 0;

        const video = document.createElement('video');
        video.autoplay = true;
        video.onplay = () => {
          try {
            let urls: string[] = [];

            // Hide the cursor while screenshots are being taken
            const style = document.createElement('style');
            style.innerHTML =
              '* {cursor: none!important;} .growthbook_screenshot {display:none!important;}';
            document.head.append(style);

            let result = Promise.resolve();
            for (let i = 0; i < numVariations; i++) {
              result = result
                .then(() => {
                  forceVariation(i);
                  return new Promise((resolve) => setTimeout(resolve, 200));
                })
                .then(() => {
                  ctx.drawImage(video, 0, 0);
                  return new Promise<string>((resolve) => {
                    canvas.toBlob((b) => {
                      resolve(URL.createObjectURL(b));
                    });
                  });
                })
                .then((url) => {
                  urls.push(url);
                });
            }

            result
              .then(() => {
                // Clean up
                style.remove();
                canvas.remove();
                video.remove();
                captureStream
                  .getTracks()
                  .forEach((track: MediaStreamTrack) => track.stop());

                resolve({
                  capturedImages: urls,
                  w,
                  h,
                });
              })
              .catch((e) => {
                reject(e);
              });
          } catch (e) {
            reject(e);
          }
        };
        video.srcObject = captureStream;
      });
    });
}

export function cropScreenshot(
  url: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Promise<string> {
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  return new Promise<void>((resolve, reject) => {
    const src = new Image();
    src.onload = () => {
      ctx.drawImage(
        src,
        // src x,y,w,h
        Math.min(x1, x2),
        Math.min(y1, y2),
        w,
        h,
        // dest x,y,w,h
        0,
        0,
        w,
        h
      );
      resolve();
    };
    src.onerror = (e) => {
      reject(e);
    };
    src.src = url;
  })
    .then(
      () =>
        new Promise<string>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (!b) {
              reject('Error getting canvas blob');
              return;
            }
            resolve(URL.createObjectURL(b));
          });
        })
    )
    .then((url) => {
      canvas.remove();
      return url;
    });
}
