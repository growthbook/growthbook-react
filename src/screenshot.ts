export function captureScreenshots(
  numVariations: number,
  forceVariation: (i: number) => void
): Promise<string[]> {
  console.log('Getting capture stream', numVariations);

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
        console.log('video playing', ctx);
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const video = document.createElement('video');
        video.autoplay = true;
        video.onplay = () => {
          try {
            let urls: string[] = [];

            // Hide the cursor while screenshots are being taken
            const style = document.createElement('style');
            style.innerHTML = '* {cursor: none!important}';
            document.head.append(style);

            let result = Promise.resolve();
            for (let i = 0; i < numVariations; i++) {
              result = result
                .then(() => {
                  console.log('Forcing variation ', i);
                  forceVariation(i);
                  return new Promise((resolve) => setTimeout(resolve, 200));
                })
                .then(() => {
                  ctx.drawImage(video, 0, 0);
                  console.log('captured variation image', i);

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

                resolve(urls);
              })
              .catch((e) => {
                reject(e);
              });
          } catch (e) {
            reject(e);
          }
        };
        video.srcObject = captureStream;
        console.log('started video', settings);
      });
    });
}

export function cropScreenshots(
  urls: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Promise<{
  imageUrls: string[];
}> {
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const imageUrls: string[] = [];

  let result = Promise.resolve();
  for (let i = 0; i < urls.length; i++) {
    result = result
      .then(
        () =>
          new Promise<void>((resolve, reject) => {
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
            src.src = urls[i];
          })
      )
      .then(
        () =>
          new Promise<void>((resolve, reject) => {
            canvas.toBlob((b) => {
              if (!b) {
                reject('Error getting canvas blob');
                return;
              }
              imageUrls[i] = URL.createObjectURL(b);
              resolve();
            });
          })
      );
  }

  return result.then(() => {
    canvas.remove();
    return {
      imageUrls,
    };
  });
}
