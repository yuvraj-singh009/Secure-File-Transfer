import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuration Constants
const CONFIG = {
    SUPABASE: {
        URL: 'https://afieewyossvtxetxytnr.supabase.co',
        KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWVld3lvc3N2dHhldHh5dG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjgxNTc4MCwiZXhwIjoyMDQ4MzkxNzgwfQ.agrmFADCTLm4n3w8tykxwIjz9K7MuknHk4GfOCTNWLM',
        BUCKET: {
            UPLOADS: 'uploads',
            SAVED: 'saved'
        }
    },
    EMAIL: {
        SERVICE_ID: "service_oj849wp",
        TEMPLATE_ID: "template_vv2q8vi",
        INIT_KEY: "RwhVK_22140kjAtOx"
    },
    SESSION_TIMEOUT: 5 * 60 * 1000 // 5 minutes in milliseconds
};

// Initialize Supabase client
const supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY);

// Initialize EmailJS
(function() {
    emailjs.init(CONFIG.EMAIL.INIT_KEY);
})();

class EnhancedEncryption {
    static async generateRSAKeyPair() {
        return await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    static async exportPublicKey(keyPair) {
        return await crypto.subtle.exportKey('spki', keyPair.publicKey);
    }

    static async exportPrivateKey(keyPair) {
        return await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    }

    static async importPublicKey(publicKeyBuffer) {
        return await crypto.subtle.importKey(
            'spki',
            publicKeyBuffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["encrypt"]
        );
    }

    static async importPrivateKey(privateKeyBuffer) {
        return await crypto.subtle.importKey(
            'pkcs8',
            privateKeyBuffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["decrypt"]
        );
    }

    static async encryptAESKey(publicKey, aesKeyBuffer) {
        return await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            aesKeyBuffer
        );
    }

    static async decryptAESKey(privateKey, encryptedAESKeyBuffer) {
        return await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedAESKeyBuffer
        );
    }

    static async generateAESKey() {
        return await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    static async exportAESKey(key) {
        return await crypto.subtle.exportKey('raw', key);
    }

    static async importAESKey(rawKey) {
        return await crypto.subtle.importKey(
            'raw',
            rawKey,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    static async encryptFile(file, publicKey) {
        const fileKey = await this.generateAESKey();
        const exportedAESKey = await this.exportAESKey(fileKey);
        const encryptedAESKey = await this.encryptAESKey(publicKey, exportedAESKey);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const algorithm = { name: "AES-GCM", iv: iv };
        const fileBuffer = await file.arrayBuffer();
        const encryptedData = await crypto.subtle.encrypt(algorithm, fileKey, fileBuffer);

        const mimeBuffer = new TextEncoder().encode(file.type);
        const mimeLength = new Uint8Array([mimeBuffer.length]);

        return {
            encryptedBlob: new Blob([
                encryptedAESKey,
                iv,
                mimeLength,
                mimeBuffer,
                encryptedData
            ]),
            encryptedAESKey: encryptedAESKey
        };
    }

    static async decryptFile(encryptedFile, privateKey) {
        const fileBuffer = await encryptedFile.arrayBuffer();
        const encryptedAESKey = fileBuffer.slice(0, 256);
        const decryptedAESKeyBuffer = await this.decryptAESKey(privateKey, encryptedAESKey);
        const fileKey = await this.importAESKey(decryptedAESKeyBuffer);

        const iv = new Uint8Array(fileBuffer.slice(256, 268));
        const mimeLength = new Uint8Array(fileBuffer.slice(268, 269))[0];
        const mimeBuffer = fileBuffer.slice(269, 269 + mimeLength);
        const encryptedData = fileBuffer.slice(269 + mimeLength);

        const mimeType = new TextDecoder().decode(mimeBuffer);
        const algorithm = { name: "AES-GCM", iv: iv };

        try {
            const decryptedData = await crypto.subtle.decrypt(algorithm, fileKey, encryptedData);
            return new Blob([decryptedData], { type: mimeType });
        } catch (error) {
            console.error("Decryption failed", error);
            throw new Error("Decryption failed. The file may be corrupted or the key is invalid.");
        }
    }
}

// Utility Functions
const utils = {
    validateVITEmail: (email) => /^[a-zA-Z0-9._%+-]+@vitbhopal\.ac\.in$/.test(email),
    generateOTP: () => Math.floor(100000 + Math.random() * 900000).toString(),
    getUrlParameter: (name) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
};

// Key Management Functions
let rsaKeyPair = null;

async function exportKeyToString(key, isPublic) {
    const exported = await crypto.subtle.exportKey(
        isPublic ? 'spki' : 'pkcs8',
        key
    );
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

async function importKeyFromString(keyStr, isPublic) {
    const keyData = Uint8Array.from(atob(keyStr), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
        isPublic ? 'spki' : 'pkcs8',
        keyData,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        [isPublic ? "encrypt" : "decrypt"]
    );
}

// Session Management
function initializeSessionManagement() {
    let timeout;

    const saveKeysBeforeExpiry = () => {
        if (rsaKeyPair) {
            try {
                localStorage.setItem('lastSessionPublicKey', sessionStorage.getItem('publicKey'));
                localStorage.setItem('lastSessionPrivateKey', sessionStorage.getItem('privateKey'));
            } catch (error) {
                console.error('Failed to save keys before session expiry:', error);
            }
        }
    };

    const resetTimeout = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            saveKeysBeforeExpiry();
            alert("You have been signed out due to inactivity.");
            window.location.href = 'login.html';
        }, CONFIG.SESSION_TIMEOUT);
    };

    ['mousemove', 'click', 'keypress', 'scroll'].forEach(event => {
        document.addEventListener(event, resetTimeout);
    });

    resetTimeout();
    window.addEventListener('beforeunload', saveKeysBeforeExpiry);
}

// Event Handlers
async function handleUploadFormSubmit(e) {
    e.preventDefault();
    const file = document.getElementById('file').files[0];
    const email = document.getElementById('email').value;
    const statusElement = document.getElementById('status');

    if (!file) {
        statusElement.textContent = 'Please select a file.';
        return;
    }

    if (!utils.validateVITEmail(email)) {
        statusElement.textContent = 'Invalid email. Only VIT Bhopal emails are allowed.';
        return;
    }

    const otp = utils.generateOTP();

    try {
        const rsaKeyPair = await EnhancedEncryption.generateRSAKeyPair();
        const { encryptedBlob } = await EnhancedEncryption.encryptFile(file, rsaKeyPair.publicKey);

        await emailjs.send(CONFIG.EMAIL.SERVICE_ID, CONFIG.EMAIL.TEMPLATE_ID, {
            email: email,
            otp: otp
        });

        const filePath = `otp-files/${otp}-${file.name}.encrypted`;
        const { error } = await supabase.storage
            .from(CONFIG.SUPABASE.BUCKET.UPLOADS)
            .upload(filePath, encryptedBlob, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const keysPath = `otp-files/${otp}-${file.name}.keys`;
        const keysData = JSON.stringify({
            publicKey: await exportKeyToString(rsaKeyPair.publicKey, true),
            privateKey: await exportKeyToString(rsaKeyPair.privateKey, false)
        });

        const { error: keysError } = await supabase.storage
            .from(CONFIG.SUPABASE.BUCKET.UPLOADS)
            .upload(keysPath, new Blob([keysData]), {
                cacheControl: '3600',
                upsert: false
            });

        if (keysError) throw keysError;

        statusElement.textContent = `Encrypted file uploaded successfully. OTP sent to ${email}. Your OTP is: ${otp}`;
    } catch (error) {
        statusElement.textContent = `Error: ${error.message}`;
        console.error(error);
    }
}

async function handleRetrieveFormSubmit(e) {
    e.preventDefault();
    const otp = document.getElementById('retrieveOtp').value;
    const statusElement = document.getElementById('status');

    if (!otp) {
        statusElement.textContent = 'Please enter an OTP.';
        return;
    }

    try {
        const { data: files, error } = await supabase.storage
            .from(CONFIG.SUPABASE.BUCKET.UPLOADS)
            .list('otp-files');

        if (error) throw new Error(`Error listing files: ${error.message}`);

        const file = files.find(f => f.name.startsWith(`${otp}-`) && f.name.endsWith('.encrypted'));
        if (!file) {
            statusElement.textContent = `No encrypted file found for OTP: ${otp}`;
            return;
        }

        const { data: encryptedData, error: fileError } = await supabase.storage
            .from(CONFIG.SUPABASE.BUCKET.UPLOADS)
            .download(`otp-files/${file.name}`);

        if (fileError) throw new Error(`Error fetching encrypted file: ${fileError.message}`);

        const keysPath = `otp-files/${file.name.replace('.encrypted', '')}.keys`;
        const { data: keysDataResponse, error: keysError } = await supabase.storage
            .from(CONFIG.SUPABASE.BUCKET.UPLOADS)
            .download(keysPath);

        if (keysError) {
            statusElement.textContent = `Error fetching RSA keys: ${keysError.message}`;
            return;
        }

        const keysData = await keysDataResponse.text();
        const { publicKey, privateKey } = JSON.parse(keysData);

        const rsaKeyPair = {
            publicKey: await importKeyFromString(publicKey, true),
            privateKey: await importKeyFromString(privateKey, false)
        };

        const decryptedBlob = await EnhancedEncryption.decryptFile(encryptedData, rsaKeyPair.privateKey);
        const url = URL.createObjectURL(decryptedBlob);
        
        statusElement.innerHTML = `
            File retrieved and decrypted successfully. 
            <a href="${url}" target="_blank" download="${file.name.replace('.encrypted', '')}">Download Decrypted File</a>
        `;

        setTimeout(() => URL.revokeObjectURL(url), 60000);

        // Schedule deletion
        setTimeout(async () => {
            try {
                const filePath = `otp-files/${file.name}`;
                const keysPath = `otp-files/${file.name.replace('.encrypted', '')}.keys`;

                await Promise.all([
                    supabase.storage.from(CONFIG.SUPABASE.BUCKET.UPLOADS).remove([filePath]),
                    supabase.storage.from(CONFIG.SUPABASE.BUCKET.UPLOADS).remove([keysPath])
                ]);
            } catch (deleteError) {
                console.error('Error scheduling file deletion:', deleteError);
            }
        }, 120000);

    } catch (error) {
        statusElement.textContent = `Error retrieving file: ${error.message}`;
        console.error(error);
    }
}

async function handleSaveFormSubmit(e) {
    e.preventDefault();
    const savedFile = document.getElementById('savedFile').files[0];
    const username = document.getElementById('username').textContent.trim();
    const statusElement = document.getElementById('status');

    if (!savedFile) {
        statusElement.textContent = 'Please select a file and ensure keys are generated.';
        return;
    }

    const otp = utils.generateOTP();

    try {
        const { encryptedBlob } = await EnhancedEncryption.encryptFile(savedFile, rsaKeyPair.publicKey);
        const savedFilePath = `${username}/${otp}-${savedFile.name}.encrypted`;
        
        const { error } = await supabase.storage
            .from(CONFIG.SUPABASE.BUCKET.SAVED)
            .upload(savedFilePath, encryptedBlob, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;
        statusElement.textContent = `File uploaded successfully. Use OTP: ${otp} to retrieve it.`;

    } catch (error) {
        statusElement.textContent = `Error uploading file: ${error.message}`;
        console.error(error);
    }
}

async function handleRetrieveSavedFormSubmit(e) {
    e.preventDefault();
    const otp = document.getElementById('retrieveSavedOtp').value;
    const username = document.getElementById('username').textContent.trim();
    const statusElement = document.getElementById('status');

    if (!otp) {
        statusElement.textContent = 'Please enter an OTP and ensure keys are generated.';
        return;
    }

    try {
        const { data: files, error } = await supabase.storage
            .from(CONFIG.SUPABASE.BUCKET.SAVED)
            .list(username);

        if (error) throw error;

        const file = files.find(f => f.name.startsWith(`${otp}-`) && f.name.endsWith('.encrypted'));
        if (!file) {
            statusElement.textContent = `No file found for OTP: ${otp}`;
            return;
        }

        const filePath = `${username}/${file.name}`;
        const { data: downloadData, error: downloadError } = await supabase.storage
            .from(CONFIG.SUPABASE.BUCKET.SAVED)
            .createSignedUrl(filePath, 60);

        if (downloadError) throw downloadError;

        const response = await fetch(downloadData.signedUrl);
        const encryptedBlob = await response.blob();

        const decryptedBlob = await EnhancedEncryption.decryptFile(encryptedBlob, rsaKeyPair.privateKey);
        const url = URL.createObjectURL(decryptedBlob);
        
        statusElement.innerHTML = `
            File retrieved and decrypted successfully.
            <a href="${url}" target="_blank" download="${file.name.replace('.encrypted', '')}">Download Decrypted File</a>
        `;

        setTimeout(() => URL.revokeObjectURL(url), 60000);

    } catch (error) {
        statusElement.textContent = `Error retrieving file: ${error.message}`;
        console.error(error);
    }
}

// Initialization
async function initializeKeys() {
    try {
        const storedPublicKey = sessionStorage.getItem('publicKey');
        const storedPrivateKey = sessionStorage.getItem('privateKey');

        if (storedPublicKey && storedPrivateKey) {
            rsaKeyPair = {
                publicKey: await importKeyFromString(storedPublicKey, true),
                privateKey: await importKeyFromString(storedPrivateKey, false)
            };
            console.log("RSA Key Pair Restored Successfully");
        } else {
            rsaKeyPair = await EnhancedEncryption.generateRSAKeyPair();
            sessionStorage.setItem('publicKey', await exportKeyToString(rsaKeyPair.publicKey, true));
            sessionStorage.setItem('privateKey', await exportKeyToString(rsaKeyPair.privateKey, false));
            console.log("New RSA Key Pair Generated Successfully");
        }
    } catch (error) {
        console.error("Failed to initialize RSA Key Pair", error);
    }
}

async function restoreKeysFromPreviousSession() {
    try {
        const lastSessionPublicKey = localStorage.getItem('lastSessionPublicKey');
        const lastSessionPrivateKey = localStorage.getItem('lastSessionPrivateKey');

        if (lastSessionPublicKey && lastSessionPrivateKey) {
            sessionStorage.setItem('publicKey', lastSessionPublicKey);
            sessionStorage.setItem('privateKey', lastSessionPrivateKey);
            localStorage.removeItem('lastSessionPublicKey');
            localStorage.removeItem('lastSessionPrivateKey');
            return true;
        }
    } catch (error) {
        console.error('Failed to restore keys from previous session:', error);
    }
    return false;
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize username display
    const fullUsername = utils.getUrlParameter('username');
    const displayUsername = fullUsername.split('@')[0];
    const usernameElement = document.getElementById('username');
    if (usernameElement && displayUsername) {
        usernameElement.textContent = displayUsername;
    }

    // Initialize keys
    const keysRestored = await restoreKeysFromPreviousSession();
    if (!keysRestored) {
        await initializeKeys();
    }

    // Initialize session management
    initializeSessionManagement();

    // Attach form submit handlers
    document.getElementById('uploadForm')?.addEventListener('submit', handleUploadFormSubmit);
    document.getElementById('retrieveForm')?.addEventListener('submit', handleRetrieveFormSubmit);
    document.getElementById('saveform')?.addEventListener('submit', handleSaveFormSubmit);
    document.getElementById('retrieveSavedForm')?.addEventListener('submit', handleRetrieveSavedFormSubmit);
});

export {
    EnhancedEncryption,
    utils,
    CONFIG
};
