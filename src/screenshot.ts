export async function captureScreenshots(
  numVariations: number,
  forceVariation: (i: number) => void
): Promise<string[]> {
  console.log('Getting capture stream', numVariations);

  // eslint-disable-next-line
  // @ts-ignore
  const captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'never',
    },
    audio: false,
  });

  const settings = captureStream.getVideoTracks()[0].getSettings();

  if (settings.displaySurface === 'window') {
    captureStream
      .getTracks()
      .forEach((track: MediaStreamTrack) => track.stop());
    throw new Error(
      'Please choose to share either your entire screen or a specific tab.'
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = settings.width;
  canvas.height = settings.height;
  const ctx = canvas.getContext('2d');
  console.log('video playing', ctx);
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.onplay = async () => {
      try {
        let urls: string[] = [];

        // Hide the cursor while screenshots are being taken
        const style = document.createElement('style');
        style.innerHTML = '* {cursor: none!important}';
        document.head.append(style);

        for (let i = 0; i < numVariations; i++) {
          console.log('Forcing variation ', i);
          forceVariation(i);
          await new Promise((resolve) => setTimeout(resolve, 200));

          ctx.drawImage(video, 0, 0);
          console.log('captured variation image', i);

          const url = await new Promise<string>((resolve) => {
            canvas.toBlob((b) => {
              resolve(URL.createObjectURL(b));
            });
          });
          urls.push(url);
        }

        // Clean up
        style.remove();
        canvas.remove();
        video.remove();
        captureStream
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());

        resolve(urls);
      } catch (e) {
        reject(e);
      }
    };
    video.srcObject = captureStream;
    console.log('started video', settings);
  });
}

export async function cropScreenshots(
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

  for (let i = 0; i < urls.length; i++) {
    await new Promise((resolve, reject) => {
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
        resolve(true);
      };
      src.onerror = (e) => {
        reject(e);
      };
      src.src = urls[i];
    });
    await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (!b) {
          reject('Error getting canvas blob');
          return;
        }
        imageUrls[i] = URL.createObjectURL(b);
        resolve(null);
      });
    });
  }

  canvas.remove();

  return {
    imageUrls
  };
}
