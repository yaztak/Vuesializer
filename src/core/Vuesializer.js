class Vuesializer {
  src = null;
  height = null;
  colors = [];
  audioContext = null;
  audioContextObj = null;
  analyserFftSize = 8192;
  canvas = null;
  canvasWidth = 0;
  canvasHeight = 0;
  centerX = 0;
  centerY = 0;
  maxBarHeight = 0;
  radius = 0;

  constructor(props) {
    this.src = props.src;
    this.height = props.height;
    this.colors = props.colors;
  }

  createAudioElement() {
    const element = document.createElement("audio");
    element.id = 1; // set ID of sound to use as a key for global obj
    element.src = this.src; // set source to locally stored file
    element.crossOrigin = "anonymous"; // avoid a CORS error
    element.controls = true; // avoid a CORS error
    element.loop = "true"; // sounds need to loop to the beginning after they end
    element.dataset.action = "off"; // for pausing feature
    element.style.display = "none";

    return element;
  }

  createAudioContextObj(audioElement) {
    // initialize new audio context
    this.audioContext = new AudioContext();

    // create new audio context with given sound
    const src = this.audioContext.createMediaElementSource(audioElement);

    // create analyser (gets lots o data bout audio)
    const analyser = this.audioContext.createAnalyser();

    // connect audio source to analyser to get data for the sound
    src.connect(analyser);
    analyser.connect(this.audioContext.destination);
    analyser.fftSize = this.analyserFftSize; // set the bin size to condense amount of data

    // array limited to unsigned int values 0-255
    const bufferLength = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);

    let audioContextObj = {
      freqData, // note: at this time, this area is unpopulated!
      analyser,
    };

    this.audioContextObj = audioContextObj;

    return audioContextObj;
  }

  getAudioContext() {
    return this.audioContext;
  }

  getMaxBarHeight() {
    return this.maxBarHeight;
  }

  setMaxBarHeight(value) {
    this.maxBarHeight = value;
  }

  calculateMaxBarHeight() {
    const value = Math.min(this.canvasWidth, this.canvasHeight) / 4;
    this.setMaxBarHeight(value);
  }

  setRadius(value) {
    this.radius = value;
  }

  getRadius() {
    return this.radius;
  }

  initCanvas(canvas, wrapper, height) {
    this.canvas = canvas;

    this.canvasWidth = wrapper.clientWidth;
    if (height === "100%") {
      this.canvasHeight = wrapper.parentElement.clientHeight;
    } else {
      this.canvasHeight = wrapper.clientHeight;
    }
    this.canvas.setAttribute("width", this.canvasWidth);
    this.canvas.setAttribute("height", this.canvasHeight);

    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
  }

  renderFrame() {
    const audioContextObj = this.audioContextObj;
    const numBars = 200;

    const freqDataMany = [];
    const agg = [];

    let audioContextArr = Object.values(audioContextObj);

    let freqData = audioContextObj.freqData;
    audioContextObj.analyser.getByteFrequencyData(freqData);
    freqDataMany.push(freqData);

    if (audioContextArr.length > 0) {
      for (let i = 0; i < freqDataMany[0].length; i++) {
        agg.push(0);
        freqDataMany.forEach((data) => {
          agg[i] += data[i];
        });
      }

      // let radius = canvas.height / 4;
      const points = [];
      let maxWaveHeight = 0;

      // Calculate the points of the wave
      for (let i = 0; i < numBars; i++) {
        const barHeight = (agg[i] * this.maxBarHeight) / 255;
        maxWaveHeight = Math.max(maxWaveHeight, barHeight);
        const rads = (Math.PI * 2) / numBars;
        const x_end =
          this.centerX + Math.cos(rads * i) * (this.radius + barHeight);
        const y_end =
          this.centerY + Math.sin(rads * i) * (this.radius + barHeight);
        points.push({ x: x_end, y: y_end });
      }

      /* ------------------------------- Draw Canvas ------------------------------ */

      this.renderCanvas(points, maxWaveHeight);
    }
  }

  renderCanvas(points, maxWaveHeight) {
    const canvasElement = this.canvas;
    const canvasContext = canvasElement.getContext("2d");

    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the wave path
    canvasContext.beginPath();
    canvasContext.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length; i++) {
      const nextIdx = (i + 1) % points.length;
      const midX = (points[i].x + points[nextIdx].x) / 2;
      const midY = (points[i].y + points[nextIdx].y) / 2;
      canvasContext.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    canvasContext.quadraticCurveTo(
      points[0].x,
      points[0].y,
      points[0].x,
      points[0].y
    );
    canvasContext.closePath();

    // Apply clipping
    canvasContext.save();
    canvasContext.clip();

    // rgba(0, 191, 179, 0.0) Green
    // rgba(0, 166, 237, 0.0) Blue
    if (!this.colors.length) {
      canvasContext.fillStyle = "rgb(0, 191, 179)";
      canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    } else if (this.colors.length === 1) {
      canvasContext.fillStyle = this.colors[0];
      canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    } else {
      // Create and fill the gradient
      const gradient = canvasContext.createRadialGradient(
        this.centerX,
        this.centerY,
        0,
        this.centerX,
        this.centerY,
        this.radius + maxWaveHeight
      );

      const gradientStep = 1 / this.colors.length;
      this.colors.forEach((color, index) => {
        gradient.addColorStop(index * gradientStep, color);
      });

      canvasContext.fillStyle = gradient;
      canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    }
    // TODO: Add a prop for stroke color
    // Restore context to draw the wave stroke
    canvasContext.restore();
    canvasContext.strokeStyle = "rgba(0, 191, 179, 1)"; // Ensure the wave outline is visible
    canvasContext.stroke();
  }
}

export default Vuesializer;
