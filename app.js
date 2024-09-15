// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAQFgsxxTZP2vxyXShP_vzqokCjItbTNwk",
    authDomain: "battleofbugs-f6fdd.firebaseapp.com",
    databaseURL: "https://battleofbugs-f6fdd-default-rtdb.firebaseio.com",
    projectId: "battleofbugs-f6fdd",
    storageBucket: "battleofbugs-f6fdd.appspot.com",
    messagingSenderId: "937461994435",
    appId: "1:937461994435:web:633b7804b9fceb0243e376",
    measurementId: "G-G63JPS2K0D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

let editor; // Global variable for CodeMirror instance
let startTime; // Global variable to track start time
let timerInterval; // For the timer
let elapsedSeconds = 0; // Tracks elapsed time

// Timer logic: starts 30 seconds after the round is selected
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000); // Update every second
}

function updateTimer() {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").textContent = `Timer: ${formatTime(elapsedSeconds)}`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Login function
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Logged in:", userCredential.user);
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('round-selection-section').style.display = 'block';
        })
        .catch((error) => {
            console.error("Login error:", error.message);
            alert("Error logging in: " + error.message);  // Show error to user
        });
}

// Round selection and code editor setup
function selectRound(round) {
    document.getElementById('round-selection-section').style.display = 'none';
    document.getElementById('coding-section').style.display = 'block';
    document.getElementById('round-title').innerText = `Round ${round}`;
    
    // Save the selected round in localStorage
    localStorage.setItem('selectedRound', round);

    // Load buggy code (for demonstration, hardcoded here; ideally, load from a source)
    document.getElementById('buggy-code').innerText = `console.log('Buggy code example');\n\n// TODO: Fix this code`;

    // Initialize CodeMirror
    const codeArea = document.getElementById('codeArea');
    if (editor) {
        editor.toTextArea(); // Remove existing editor if any
    }
    editor = CodeMirror.fromTextArea(codeArea, {
        mode: "javascript",
        lineNumbers: true,
        theme: "default"  // Change to a different theme if desired
    });

    // Start the timer 30 seconds after round starts
    setTimeout(() => {
        startTimer();
    }, 30000);
}

// Submit code and save timer to Firebase
function submitCode() {
    if (!editor) {
        alert("CodeMirror editor not initialized.");
        return;
    }
    
    const code = editor.getValue(); // Get code from CodeMirror
    const round = localStorage.getItem('selectedRound');

    if (!round) {
        alert("No round selected.");
        return;
    }

    // Stop the timer
    clearInterval(timerInterval);

    // Store code and timer data in Firestore
    db.collection("submissions").add({
        code: code,
        email: auth.currentUser.email,
        round: round,
        timeSpent: elapsedSeconds,  // Store the elapsed time in Firebase
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert("Code submitted successfully!");

        // Display output
        document.querySelector('.output-container').style.display = 'flex';
        executeCode(code);
        
        // Optionally, you can redirect or reset the page here
        document.getElementById('coding-section').style.display = 'none';
        document.getElementById('round-selection-section').style.display = 'block';
    })
    .catch((error) => {
        console.error("Error submitting code: ", error);
    });
}

// Execute code logic
function executeCode(code) {
    fetch('https://example.com/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('outputFrame').srcdoc = data.outputHtml; // Set output HTML
    })
    .catch(error => {
        console.error('Error executing code:', error);
    });
}

function displayOutput(code) {
    const url = `https://repl.it/@your-username/your-repl-name?output=${encodeURIComponent(code)}`;
    document.getElementById('outputFrame').src = url;
}
// Function to load buggy code from a local .txt file
function loadBuggyCodeFromFile(fileName) {
    fetch(fileName)
        .then(response => response.text())
        .then(data => {
            document.getElementById('buggy-code').innerText = data;  // Display the content in the buggy-code div
        })
        .catch(error => {
            console.error("Error loading buggy code:", error);
            document.getElementById('buggy-code').innerText = "Error loading buggy code.";
        });
}

// Round selection and code editor setup
function selectRound(round) {
    document.getElementById('round-selection-section').style.display = 'none';
    document.getElementById('coding-section').style.display = 'block';
    document.getElementById('round-title').innerText = `Round ${round}`;
    
    // Save the selected round in localStorage
    localStorage.setItem('selectedRound', round);

    // Load the buggy code for the selected round
    if (round === 1) {
        // Load the buggy code from the Buggycode.txt file for Round 1
        loadBuggyCodeFromFile('Buggycode.txt');
    } else {
        // For other rounds, you can use different files or hardcoded buggy code
        document.getElementById('buggy-code').innerText = `console.log('This is buggy code for Round ${round}');`;
    }

    // Initialize CodeMirror
    const codeArea = document.getElementById('codeArea');
    if (editor) {
        editor.toTextArea(); // Remove existing editor if any
    }
    editor = CodeMirror.fromTextArea(codeArea, {
        mode: "javascript",
        lineNumbers: true,
        theme: "default"  // Change to a different theme if desired
    });

    // Start the timer 30 seconds after round starts
    setTimeout(() => {
        startTimer();
    }, 30000);
}
