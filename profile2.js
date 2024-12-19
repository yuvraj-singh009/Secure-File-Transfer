import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Configuration
const SUPABASE_URL = 'https://afieewyossvtxetxytnr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWVld3lvc3N2dHhldHh5dG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjgxNTc4MCwiZXhwIjoyMDQ4MzkxNzgwfQ.agrmFADCTLm4n3w8tykxwIjz9K7MuknHk4GfOCTNWLM'; // Replace with actual service key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Utility Functions for AES Encryption/Decryption
const generateAESKey = async () => {
    return crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
};

const encryptFileWithAES = async (file, aesKey) => {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const fileData = await file.arrayBuffer();

    const encryptedData = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        aesKey,
        fileData
    );

    // Concatenate IV and encrypted data
    const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
    combinedData.set(iv, 0);
    combinedData.set(new Uint8Array(encryptedData), iv.length);

    return { encryptedBlob: new Blob([combinedData]), iv }; // Return IV for reference
};

const decryptFileWithAES = async (encryptedBlob, aesKey) => {
    const data = await encryptedBlob.arrayBuffer();
    const iv = new Uint8Array(data.slice(0, 12)); // Extract IV
    const encryptedData = data.slice(12); // Extract encrypted part

    const decryptedData = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        aesKey,
        encryptedData
    );

    return new Blob([decryptedData]);
};

// Saved Data Upload
document.getElementById("saveform").addEventListener("submit", async (e) => {
    e.preventDefault();
    const savedFileInput = document.getElementById("savedFile");
    const savedFile = savedFileInput.files[0];
    const username = document.getElementById("username").textContent.trim();

    if (!savedFile) {
        document.getElementById("status").textContent = "Please select a file.";
        return;
    }

    const Otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit numerical OTP
    const aesKey = await generateAESKey(); // Generate AES key
    const exportedKey = await crypto.subtle.exportKey("raw", aesKey); // Export key to save

    try {
        // Encrypt the file with AES key
        const { encryptedBlob } = await encryptFileWithAES(savedFile, aesKey);

        // Save AES key in a separate file (as a Blob)
        const aesKeyBlob = new Blob([exportedKey]);

        // Upload encrypted file to Supabase (Saved Data bucket)
        const savedFilePath = `${username}/${Otp}-${savedFile.name}.encrypted`;
        const aesKeyPath = `${username}/${Otp}-${savedFile.name}.key`;

        // Upload the encrypted file and the AES key
        const { data: fileData, error: fileError } = await supabase.storage
            .from("saved")
            .upload(savedFilePath, encryptedBlob, {
                cacheControl: "3600",
                upsert: false,
            });
        if (fileError) throw fileError;

        const { data: keyData, error: keyError } = await supabase.storage
            .from("saved")
            .upload(aesKeyPath, aesKeyBlob, {
                cacheControl: "3600",
                upsert: false,
            });
        if (keyError) throw keyError;

        // Display success status with OTP
        document.getElementById("status").textContent = `File uploaded successfully. Use OTP: ${Otp} to retrieve it.`;

    } catch (error) {
        document.getElementById("status").textContent = `Error uploading file: ${error.message}`;
        console.error(error);
    }
});

// Retrieve Saved Data
document.getElementById("retrieveSavedForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const retrieveSavedOtpInput = document.getElementById("retrieveSavedOtp");
    const Otp = retrieveSavedOtpInput.value;
    const username = document.getElementById("username").textContent.trim();

    if (!Otp) {
        document.getElementById("status").textContent = "Please enter an OTP.";
        return;
    }

    try {
        // List all files in the bucket
        const { data: files, error } = await supabase.storage.from("saved").list(username);

        if (error) throw error;

        // Find the file matching the OTP
        const file = files.find((f) => f.name.startsWith(`${Otp}-`) && f.name.endsWith(".encrypted"));
        const keyFile = files.find((f) => f.name.startsWith(`${Otp}-`) && f.name.endsWith(".key"));

        if (!file || !keyFile) {
            document.getElementById("status").textContent = `No file found for OTP: ${Otp}`;
            return;
        }

        // Generate a download URL for the file and key
        const filePath = `${username}/${file.name}`;
        const keyPath = `${username}/${keyFile.name}`;

        const { data: downloadData, error: downloadError } = await supabase.storage
            .from("saved")
            .createSignedUrl(filePath, 60);
        if (downloadError) throw downloadError;

        const { data: keyDownloadData, error: keyDownloadError } = await supabase.storage
            .from("saved")
            .createSignedUrl(keyPath, 60);
        if (keyDownloadError) throw keyDownloadError;

        // Fetch the encrypted file and key
        const responseFile = await fetch(downloadData.signedUrl);
        const encryptedBlob = await responseFile.blob();

        const responseKey = await fetch(keyDownloadData.signedUrl);
        const keyBlob = await responseKey.blob();
        const aesKey = await keyBlob.arrayBuffer();

        // Import AES key
        const importedKey = await crypto.subtle.importKey("raw", aesKey, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);

        try {
            // Decrypt the file with the AES key
            const decryptedBlob = await decryptFileWithAES(encryptedBlob, importedKey);

            // Create a download link for the decrypted file
            const url = URL.createObjectURL(decryptedBlob);
            document.getElementById("status").innerHTML = `
                File retrieved and decrypted successfully.
                <a href="${url}" target="_blank" download="${file.name.replace(".encrypted", "")}">Download Decrypted File</a>
            `;

            // Clean up the URL after download
            setTimeout(() => URL.revokeObjectURL(url), 60000); // Clean up after 1 minute
        } catch (decryptError) {
            document.getElementById("status").textContent = "Failed to decrypt file.";
            console.error("Decryption error:", decryptError);
        }
    } catch (error) {
        document.getElementById("status").textContent = `Error retrieving file: ${error.message}`;
        console.error(error);
    }
});
