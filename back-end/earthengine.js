const ee = require("@google/earthengine");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ quiet: true });

let isInitialized = false;
let initializingPromise = null;
let cachedServiceAccountEmail = null;

function resolveKeyPath() {
  const keyFile = process.env.GEE_KEY_FILE || "./service-account-key.json";
  return path.isAbsolute(keyFile) ? keyFile : path.join(__dirname, keyFile);
}

function readPrivateKey() {
  const keyPath = resolveKeyPath();

  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `File service account tidak ditemukan: ${keyPath}. ` +
      `Buat/download key JSON dari Google Cloud, lalu simpan dengan nama service-account-key.json di folder project.`
    );
  }

  const stat = fs.statSync(keyPath);
  if (stat.size === 0) {
    throw new Error(
      `File service account ditemukan tetapi masih kosong: ${keyPath}. ` +
      `Isi file harus berupa JSON asli dari Google Cloud Service Account, bukan file kosong.`
    );
  }

  let privateKey;
  try {
    privateKey = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  } catch (error) {
    throw new Error(
      `File service account bukan JSON valid: ${keyPath}. ` +
      `Download ulang key JSON dari Google Cloud Service Account. Detail: ${error.message}`
    );
  }

  if (!privateKey.client_email || !privateKey.private_key) {
    throw new Error(
      `File service account tidak lengkap. Pastikan file JSON memiliki client_email dan private_key.`
    );
  }

  cachedServiceAccountEmail = privateKey.client_email;
  return privateKey;
}

function initializeEarthEngine() {
  if (isInitialized) {
    return Promise.resolve();
  }

  if (initializingPromise) {
    return initializingPromise;
  }

  initializingPromise = new Promise((resolve, reject) => {
    try {
      const privateKey = readPrivateKey();

      ee.data.authenticateViaPrivateKey(
        privateKey,
        () => {
          ee.initialize(
            null,
            null,
            () => {
              isInitialized = true;
              console.log("Google Earth Engine berhasil terhubung.");
              resolve();
            },
            (error) => {
              initializingPromise = null;
              reject(new Error(`Gagal initialize Google Earth Engine: ${error.message || error}`));
            },
            null,
            process.env.GEE_PROJECT_ID || null
          );
        },
        (error) => {
          initializingPromise = null;
          reject(new Error(`Gagal autentikasi service account GEE: ${error.message || error}`));
        }
      );
    } catch (error) {
      initializingPromise = null;
      reject(error);
    }
  });

  return initializingPromise;
}

function evaluateEeObject(eeObject) {
  return new Promise((resolve, reject) => {
    eeObject.evaluate((result, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function getConfigStatus() {
  const keyPath = resolveKeyPath();
  const keyExists = fs.existsSync(keyPath);
  const keySize = keyExists ? fs.statSync(keyPath).size : 0;

  return {
    key_path: keyPath,
    key_exists: keyExists,
    key_size_bytes: keySize,
    key_is_empty: keyExists && keySize === 0,
    service_account_email: cachedServiceAccountEmail,
    gee_asset: process.env.GEE_RF_ASSET || null,
    gee_band: process.env.GEE_RF_BAND || "0",
    gee_scale: Number(process.env.GEE_SCALE || 30),
    gee_project_id: process.env.GEE_PROJECT_ID || null,
    initialized: isInitialized,
  };
}

module.exports = {
  ee,
  initializeEarthEngine,
  evaluateEeObject,
  getConfigStatus,
};
