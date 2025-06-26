const modeToggle = document.getElementById("modeToggle");
const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("imagePreview");
const uploadProgress = document.getElementById("uploadProgress");
const predictBarContainer = document.getElementById("predictBarContainer");
const predictCountdown = document.getElementById("predictCountdown");
const predictBar = document.getElementById("predictBar");
const resultBox = document.getElementById("resultBox");
const predictionText = document.getElementById("predictionText");
const loadingSpinner = document.getElementById("loadingSpinner");

modeToggle.onchange = () => {
  document.body.classList.toggle("dark", modeToggle.checked);
};

imageInput.onchange = () => {
  uploadProgress.textContent = "";
  previewContainer.innerHTML = "";
  resultBox.classList.add("hide");
  loadingSpinner.classList.remove("hide");

  const file = imageInput.files[0];
  if (!file) {
    loadingSpinner.classList.add("hide");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    previewContainer.innerHTML = `<img src="${e.target.result}">`;
  };
  reader.readAsDataURL(file);

  let percent = 0;
  uploadProgress.textContent = "Uploading: 0%";
  const upInt = setInterval(() => {
    percent += 10;
    uploadProgress.textContent = `Uploading: ${percent}%`;
    if (percent >= 100) {
      clearInterval(upInt);
      uploadProgress.textContent = "Upload complete!";
      startPrediction(file);
    }
  }, 150);
};

function startPrediction(file) {
  predictBarContainer.classList.remove("hide");
  predictCountdown.textContent = "Predicting 3s…";
  predictBar.style.width = "0%";
  resultBox.classList.add("hide");

  let time = 3;
  const countDown = setInterval(() => {
    time--;
    let pct = ((3 - time) / 3) * 100;
    predictCountdown.textContent = `Predicting ${time}s…`;
    predictBar.style.width = `${pct}%`;

    if (time <= 0) {
      clearInterval(countDown);
      predictCountdown.textContent = `Analyzing…`;
      predictBar.style.width = "100%";
      setTimeout(() => runPredictionRequest(file), 300);
    }
  }, 1000);
}

function runPredictionRequest(file) {
  const formData = new FormData();
  formData.append("file", file);

  fetch("https://brain-tumor-api.onrender.com/predict", {  // Update this URL
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    predictBarContainer.classList.add("hide");
    loadingSpinner.classList.add("hide");
    predictionText.textContent = data.prediction
      ? `🧾 Prediction: ${data.prediction}`
      : `⚠️ Error: ${data.error}`;
    resultBox.classList.remove("hide");

    anime({
      targets: "#resultBox",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      easing: "easeOutElastic(1, .8)"
    });
  })
  .catch(err => {
    predictBarContainer.classList.add("hide");
    loadingSpinner.classList.add("hide");
    predictionText.textContent = `⚠️ Request failed: ${err.message}`;
    resultBox.classList.remove("hide");
  });
}