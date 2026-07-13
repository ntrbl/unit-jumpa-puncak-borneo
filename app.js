// Replace with your actual Firebase Configuration keys
const firebaseConfig = {
    apiKey: "AIzaSyAJCRLWg59sea7xhjv_AXSHhybNuk94mV4",
    authDomain: "penjara-puncak-borneo.firebaseapp.com",
    projectId: "penjara-puncak-borneo",
    storageBucket: "penjara-puncak-borneo.firebasestorage.app",
    messagingSenderId: "543495193906",
    appId: "1:543495193906:web:e24452f6c7e04b059f032b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global variable to temporarily hold verified data before final submission
let verifiedData = null;

// Handle Form "Semak" Click
document.getElementById('visitorForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const kpField = document.getElementById('kpPelawat');
    const telField = document.getElementById('telPelawat');
    const errorBox = document.getElementById('visitorError');
    const errorMessage = document.getElementById('errorMessage');

    // Reset error visuals
    kpField.classList.remove('input-error');
    telField.classList.remove('input-error');
    errorBox.classList.add('hidden');

    const namaPelawat = document.getElementById('namaPelawat').value.trim();
    const kpPelawat = kpField.value.trim();
    const telPelawat = telField.value.trim();
    const hubungan = document.getElementById('hubungan').value;
    const namaBanduan = document.getElementById('namaBanduan').value.trim();
    const noDaftarBanduan = document.getElementById('noDaftarBanduan').value.trim() || "Tiada";

    // 1. Validation: Phone Number must contain ONLY digits
    const phonePattern = /^[0-9]+$/;
    if (!phonePattern.test(telPelawat)) {
        errorMessage.textContent = "Format ralat: No. Telefon Bimbit hanya boleh mengandungi nombor sahaja.";
        errorBox.classList.remove('hidden');
        telField.classList.add('input-error');
        telField.focus();
        return;
    }

    // Phone Number length check
    if (telPelawat.length < 9 || telPelawat.length > 15) {
        errorMessage.textContent = "Format ralat: Sila masukkan No. Telefon Bimbit yang sah (9 hingga 15 nombor).";
        errorBox.classList.remove('hidden');
        telField.classList.add('input-error');
        telField.focus();
        return;
    }

    // 2. Validation: IC / Passport must be alphanumeric (no spaces or special symbols)
    const icPassportPattern = /^[a-zA-Z0-9]+$/;
    if (!icPassportPattern.test(kpPelawat)) {
        errorMessage.textContent = "Format ralat: No. Kad Pengenalan atau Pasport hanya boleh mengandungi huruf dan nombor tanpa simbol atau ruang.";
        errorBox.classList.remove('hidden');
        kpField.classList.add('input-error');
        kpField.focus();
        return;
    }

    // IC/Passport length check (should be at least 6 characters)
    if (kpPelawat.length < 6 || kpPelawat.length > 20) {
        errorMessage.textContent = "Format ralat: No. Kad Pengenalan atau Pasport tidak sah (6 hingga 20 aksara).";
        errorBox.classList.remove('hidden');
        kpField.classList.add('input-error');
        kpField.focus();
        return;
    }

    // Save verified inputs in temporary variable
    verifiedData = {
        namaPelawat,
        kpPelawat,
        telPelawat,
        hubungan,
        namaBanduan,
        noDaftarBanduan
    };

    // Populate Review Screen Spans
    document.getElementById('revNamaPelawat').textContent = namaPelawat;
    document.getElementById('revKpPelawat').textContent = kpPelawat;
    document.getElementById('revTelPelawat').textContent = telPelawat;
    document.getElementById('revHubungan').textContent = hubungan;
    document.getElementById('revNamaBanduan').textContent = namaBanduan;
    document.getElementById('revNoDaftar').textContent = noDaftarBanduan;

    // Transition view: Hide input form, show review screen
    document.getElementById('visitorForm').classList.add('hidden');
    document.getElementById('reviewContainer').classList.remove('hidden');
});

// Handle "Kembali Edit" Button Click
document.getElementById('backEditBtn').addEventListener('click', () => {
    // Transition view back: Hide review screen, show input form
    document.getElementById('reviewContainer').classList.add('hidden');
    document.getElementById('visitorForm').classList.remove('hidden');
});

// Handle Final "Hantar" Button Click
document.getElementById('finalSubmitBtn').addEventListener('click', async () => {
    if (!verifiedData) return;

    // Disable button to prevent double-clicks
    document.getElementById('finalSubmitBtn').disabled = true;
    document.getElementById('finalSubmitBtn').textContent = "Menghantar...";

    // AUTOMATIC DATE & TIME GENERATION
    const sekarang = new Date();
    const tarikh = sekarang.toLocaleDateString('ms-MY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const masa = sekarang.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    try {
        // Save permanently to Firebase
        await db.collection("pendaftaran").add({
            namaPelawat: verifiedData.namaPelawat,
            kpPelawat: verifiedData.kpPelawat,
            telPelawat: verifiedData.telPelawat,
            hubungan: verifiedData.hubungan,
            namaBanduan: verifiedData.namaBanduan,
            noDaftarBanduan: verifiedData.noDaftarBanduan,
            tarikh,      
            masa,        
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Show final success notification card
        document.getElementById('reviewContainer').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
    } catch (error) {
        console.error("Error saving data: ", error);
        alert("Ralat semasa menghantar pendaftaran. Sila cuba lagi.");
        document.getElementById('finalSubmitBtn').disabled = false;
        document.getElementById('finalSubmitBtn').textContent = "Hantar";
    }
});
