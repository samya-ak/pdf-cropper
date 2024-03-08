import { useState, useEffect, useRef } from "react";

import { fabric } from "fabric";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const keepInCanvas = (
  obj: fabric.Object,
  maxWidth: number,
  maxHeight: number
) => {
  if (obj) {
    const left = obj.left as number;
    const top = obj.top as number;
    const width = obj.getScaledWidth() as number;
    const height = obj.getScaledHeight() as number;

    // Check if the object is going out of canvas boundaries
    if (left < 0) {
      obj.left = 1;
    }
    if (top < 0) {
      obj.top = 1;
    }
    // -1 is to make sure that object always lies inside canvas
    if (left + width >= maxWidth) {
      obj.left = maxWidth - width - 1;
    }
    if (top + height >= maxHeight) {
      obj.top = maxHeight - height - 1;
    }
  }
};

const Cropper = () => {
  const [file, setFile] = useState<File>();
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<HTMLCanvasElement>(null);
  const FIRST_PAGE = 1;
  const SCALE = 0.75;

  const loadPdf = async () => {
    if (!(file && pdfCanvasRef)) return;
    const container = containerRef.current as HTMLDivElement;
    const pdfCanvas = pdfCanvasRef.current as HTMLCanvasElement;
    const fabricCanvasElm = fabricCanvasRef.current as HTMLCanvasElement;

    const arr = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument(arr).promise;
    const firstPage = await pdf.getPage(FIRST_PAGE);
    const viewPort = firstPage.getViewport({ scale: SCALE });

    const context = pdfCanvas.getContext("2d") as CanvasRenderingContext2D;
    container.style.width = viewPort.width.toString() + "px";
    container.style.height = viewPort.height.toString() + "px";
    pdfCanvas.width = viewPort.width;
    pdfCanvas.height = viewPort.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewPort,
    };

    await firstPage.render(renderContext).promise;

    const options = {
      width: viewPort.width,
      height: viewPort.height,
      containerClass: "rect-container",
    };
    const fabricCanvas = new fabric.Canvas(fabricCanvasElm, options);
    const rect = new fabric.Rect({
      top: 0,
      left: 0,
      width: 100,
      height: 100,
      fill: "rgba(255,0,0,0.2)",
      stroke: "#333",
      strokeWidth: 1,
      selectable: true,
      lockRotation: true,
      lockScalingFlip: true,
      strokeDashArray: [5, 5],
      strokeUniform: true,
    });
    fabricCanvas.add(rect);
    fabricCanvas.on("object:moving", (e) =>
      keepInCanvas(
        e.target as fabric.Object,
        fabricCanvas.width as number,
        fabricCanvas.height as number
      )
    );

    fabricCanvas.on("object:scaling", (e) => {
      const rect = fabricCanvas.getActiveObject();

      keepInCanvas(
        e.target as fabric.Object,
        fabricCanvas.width as number,
        fabricCanvas.height as number
      );

      const left = rect?.left as number;
      const top = rect?.top as number;
      const width = rect?.getScaledWidth() as number;
      const height = rect?.getScaledHeight() as number;

      const [tx, ty] = viewPort.convertToPdfPoint(left, top);
      const [bx, by] = viewPort.convertToPdfPoint(left + width, top + height);

      // top left coordinates
      console.log("topx, topy", tx, ty);
      // bottom right coordinates
      console.log("bx, by", bx, by);
      const rectCoords = `[${tx} ${ty} ${bx} ${by}]`;
      console.log("payload coords", rectCoords);
    });
  };

  useEffect(() => {
    if (file) {
      (async () => {
        try {
          await loadPdf();
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [file]);

  return (
    <div
      style={{
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <form>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            if (e.target?.files) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </form>
      <div style={{ position: "relative" }} ref={containerRef}>
        <canvas ref={pdfCanvasRef}></canvas>
        <canvas ref={fabricCanvasRef}></canvas>
      </div>
    </div>
  );
};

export default Cropper;
