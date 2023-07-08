const loadText = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = function (event) {
        const text = event.target.result;
        try {
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
};

const loadJson = async (file) => {
  const loadedText = await loadText(file);
  return JSON.parse(loadedText);
};

const loadImage = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = function (event) {
        const data = event.target.result;
        try {
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

export { loadText, loadJson, loadImage };
