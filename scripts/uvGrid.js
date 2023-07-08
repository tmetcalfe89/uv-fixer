class CubeManager {
  static uvTypes = {
    perFace: "perFace",
    box: "box",
    none: "none",
  };

  constructor(cube) {
    this._raw = cube;
  }

  get uvType() {
    if (!this._raw.uv) return CubeManager.uvTypes.none;
    return Array.isArray(this._raw.uv)
      ? CubeManager.uvTypes.box
      : CubeManager.uvTypes.perFace;
  }

  get perFace() {
    switch (this.uvType) {
      case CubeManager.uvTypes.perFace:
        return this._raw.uv;
      case CubeManager.uvTypes.box:
        const s = this._raw.size;
        const [x, y] = this._raw.uv;
        return {
          north: { uv: [x + s[2], y + s[2]], uv_size: [s[0], s[1]] },
          east: { uv: [x, y + s[2]], uv_size: [s[2], s[1]] },
          south: { uv: [x + s[2] * 2 + s[0], y + s[2]], uv_size: [s[0], s[1]] },
          west: { uv: [x + s[2] + s[0], y + s[2]], uv_size: [s[2], s[1]] },
          up: { uv: [x + s[2], y], uv_size: [s[0], s[2]] },
          down: {
            uv: [x + s[2] + s[0], y - Math.min(0, s[2])],
            uv_size: [s[0], Math.abs(s[2])],
          },
        };
      default:
        return null;
    }
  }

  get width() {
    const s = this._raw.size;
    return s[2] * 2 + s[0] * 2;
  }

  get height() {
    const s = this._raw.size;
    return s[1] + s[2];
  }

  get uv() {
    return this._raw.uv;
  }

  get x() {
    return this._raw.uv[0];
  }

  get y() {
    return this._raw.uv[1];
  }

  set x(newX) {
    if (!Array.isArray(this._raw.uv)) this._raw.uv = [];
    this._raw.uv[0] = newX;
  }

  set y(newY) {
    if (!Array.isArray(this._raw.uv)) this._raw.uv = [];
    this._raw.uv[1] = newY;
  }

  toJSON() {
    return this._raw;
  }

  clone() {
    return JSON.parse(JSON.stringify(this.toJSON()));
  }

  clearUv() {
    this._raw.uv = [];
  }
}

class Grid {
  constructor(size = 2) {
    this.size = size;
    this.pieces = [];
    this.cachedGrid = this.toArray();
  }

  toArray() {
    const grid = Array(this.size)
      .fill(0)
      .map(() => Array(this.size).fill(0));

    return this.pieces.reduce((acc, piece) => {
      for (let x = piece.x; x < piece.x + piece.width; x++) {
        for (let y = piece.y; y < piece.y + piece.height; y++) {
          acc[y][x] = 1;
        }
      }
      return acc;
    }, grid);
  }

  getCell(x, y) {
    return this.cachedGrid[y][x];
  }

  upsize() {
    this.size *= 2;
    this.cachedGrid = this.toArray();
  }

  addPiece(piece) {
    this.pieces.push(piece);
    this.cachedGrid = this.toArray();
  }

  canPlace(piece) {
    if (
      piece.x + piece.width > this.size ||
      piece.y + piece.height > this.size
    ) {
      return false;
    }

    for (let x = piece.x; x < piece.x + piece.width; x++) {
      for (let y = piece.y; y < piece.y + piece.height; y++) {
        if (this.getCell(x, y)) {
          return false;
        }
      }
    }

    return true;
  }
}

export { CubeManager, Grid };
