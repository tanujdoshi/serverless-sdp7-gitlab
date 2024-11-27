// src/services/apiService.js

import axios from "axios";

// Data processing - 1
export const processGlueJob = async (data) => {
  return axios.post(
    "https://qvg669947i.execute-api.us-east-1.amazonaws.com/serverless/glue-process",
    { body: data }
  );
};

//Get Data process values
export const getDataProcessInfo = async (email, type) => {
  return axios.get(
    "https://kdhprlykjeacymoqef22co3ie40unnqa.lambda-url.us-east-1.on.aws/?email=" +
      email +
      "&type=" +
      type
  );
};

// get data process from emailk
export const getAllDataProcess = async (email) => {
  return axios.get(
    "https://kdhprlykjeacymoqef22co3ie40unnqa.lambda-url.us-east-1.on.aws/?email=" +
      email
  );
};

export const getUploadedFileUrl = async (file, type) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(",")[1];
        const payload = JSON.stringify({
          filename: file.name,
          fileData: base64Data,
          type,
          userEmail: localStorage.getItem("userEmail"),
        });

        // Call your upload function
        const res = await uploadToS3ForDP(payload);
        const url = JSON.parse(res.data.body);

        resolve(url); // Resolve the promise with the URL
      } catch (error) {
        reject(error); // Reject the promise in case of an error
      }
    };

    reader.onerror = () => {
      reject(new Error("File reading failed"));
    };

    reader.readAsDataURL(file);
  });
};

// Uloading to S3 for
const uploadToS3ForDP = async (formData) => {
  return axios.post(
    "https://qvg669947i.execute-api.us-east-1.amazonaws.com/serverless/s3-upload",
    { body: formData },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const txtProcess = async (data) => {
  return axios.post(
    "https://qvg669947i.execute-api.us-east-1.amazonaws.com/serverless/txt-process",
    { body: data }
  );
};

export const gcpWordCloud = async (formData) => {
  await axios.post(
    "https://us-central1-csci-5410-439301.cloudfunctions.net/process_txt",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const fetchWordCloud = async (email) => {
  try {
    const response = await axios.post(
      "https://us-central1-csci-5410-439301.cloudfunctions.net/fetch_wordcloud",
      { email }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching word cloud data:", error);
  }
};
export default {
  processGlueJob,
  getUploadedFileUrl,
  getDataProcessInfo,
  getAllDataProcess,
  txtProcess,
  gcpWordCloud,
  fetchWordCloud,
};
