import clickster from "./scripts/clickster.js";
import { loadJson, loadImage } from "./scripts/loaders.js";
import { CubeManager, Grid } from "./scripts/uvGrid.js";

clickster();

/**
 * Global vars
 */

let processing = false;

/**
 * Element refs
 */

const jsonInput = {
  input: document.querySelector("#jsonInput"),
  display: document.querySelector("#jsonInputDisplay"),
  button: document.querySelector("#jsonInputButton"),
  val: null,
};

const imageInput = {
  input: document.querySelector("#imageInput"),
  display: document.querySelector("#imageInputDisplay"),
  button: document.querySelector("#imageInputButton"),
  val: null,
};

const actions = {
  restart: document.querySelector("#restartButton"),
  process: document.querySelector("#processButton"),
};

const outputs = {
  json: document.querySelector("#jsonOutputDisplay"),
  image: document.querySelector("#imageOutputDisplay"),
};

/**
 * Helper functions
 */

function updateJsonInput(readJson = null) {
  jsonInput.val = readJson;

  if (jsonInput.val) {
    jsonInput.display.value = JSON.stringify(jsonInput.val);
    jsonInput.display.classList.remove("hidden");
    jsonInput.button.classList.add("hidden");
    jsonInput.button.disabled = true;
  } else {
    jsonInput.display.value = "";
    jsonInput.display.classList.add("hidden");
    jsonInput.button.classList.remove("hidden");
    jsonInput.button.disabled = false;
  }

  checkReady();
}

function updateImageInput(readImage) {
  imageInput.val = readImage;

  if (imageInput.val) {
    imageInput.display.src = imageInput.val;
    imageInput.display.classList.remove("hidden");
    imageInput.button.classList.add("hidden");
    imageInput.button.disabled = true;
  } else {
    imageInput.display.src = "";
    imageInput.display.classList.add("hidden");
    imageInput.button.classList.remove("hidden");
    imageInput.button.disabled = false;
  }

  checkReady();
}

function checkReady() {
  actions.restart.disabled = processing || (!jsonInput.val && !imageInput.val);
  actions.process.disabled = processing || !jsonInput.val || !imageInput.val;
}

function collectCubes(model) {
  const collectedCubes = [];
  for (let bone of model["minecraft:geometry"][0].bones) {
    if (!bone.cubes) continue;
    for (let cube of bone.cubes) {
      collectedCubes.push(new CubeManager(cube));
    }
  }
  return collectedCubes;
}

function layoutRectangles(cubes, grid = new Grid()) {
  if (!cubes.length) {
    return grid;
  }

  const cube = cubes.pop();
  let placed = false;
  for (let x = 0; x <= grid.size - cube.width && !placed; x++) {
    cube.x = x;
    for (let y = 0; y <= grid.size - cube.height && !placed; y++) {
      cube.y = y;
      if (grid.canPlace(cube)) {
        grid.addPiece(cube);
        placed = true;
      }
    }
  }

  if (!placed) {
    grid.upsize();
    cubes.push(cube);
  }

  return layoutRectangles(cubes, grid);
}

/**
 * Event listeners
 */

jsonInput.input.addEventListener("change", async (event) => {
  const readJson = await loadJson(event.target.files[0]);
  updateJsonInput(readJson);
});

imageInput.input.addEventListener("change", async (event) => {
  const readImage = await loadImage(event.target.files[0]);
  updateImageInput(readImage);
});

actions.restart.addEventListener("click", () => {
  updateJsonInput(null);
  updateImageInput(null);
});

actions.process.addEventListener("click", () => {
  processing = true;
  checkReady();

  const cubeSource = collectCubes(jsonInput.val);
  const initialCubes = cubeSource.map((e) => new CubeManager(e.clone()));
  const grid = layoutRectangles(cubeSource);
  const finalCubes = grid.pieces.reverse();

  const description = jsonInput.val["minecraft:geometry"][0].description;
  description.texture_width =
    description.texture_height =
    outputs.image.width =
    outputs.image.height =
      grid.size;
  outputs.json.value = JSON.stringify(jsonInput.val);

  const context = outputs.image.getContext("2d");
  context.imageSmoothingEnabled = false;
  for (let i in initialCubes) {
    const initialCube = initialCubes[i].perFace;
    const finalCube = finalCubes[i].perFace;

    for (let side in initialCube) {
      const props = [
        ...initialCube[side].uv.map((e) => Math.abs(e)),
        ...initialCube[side].uv_size.map((e) => Math.abs(e)),
        ...finalCube[side].uv.map((e) => Math.abs(e)),
        ...finalCube[side].uv_size.map((e) => Math.abs(e)),
      ];
      console.log(props);
      context.drawImage(imageInput.display, ...props);
    }
  }
});
