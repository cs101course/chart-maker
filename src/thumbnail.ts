export const renderThumbnail = (svgData: string): Promise<string> => {
  const canvas = document.createElement("canvas");

  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = 480;
    canvas.height = 480;

    const img = new Image();
    img.onload = function () {
      const aspect = img.height / img.width;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.width * aspect);
      resolve(canvas.toDataURL());
    };
    img.crossOrigin="anonymous";
    img.src = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svgData);
  });
};
