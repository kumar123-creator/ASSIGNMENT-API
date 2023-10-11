<script>
    import { onMount } from "svelte";
    import { createAssignment, deleteAssignment, updateAssignment } from "./firebase";
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import {  collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
    import { query, where} from "firebase/firestore";
    import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
    import { onAuthStateChanged } from "firebase/auth";
    
    
    let assignments = [];
    let newAssignment = { title: "", description: "" };
    let editingId = null;
    let email = "";
    let password = "";
    let user = null;
    let registerEmail = "";
    let registerPassword = "";
    let showRegistrationPopup = false;
    let sessionTimer;

    
    
    
    const firebaseConfig = {
        apiKey: "AIzaSyB3LWRNk1j-5h_w2iDIx_JTT-g0mFAb7aA",
        authDomain: "assignment-api-fda6f.firebaseapp.com",
        projectId: "assignment-api-fda6f",
        storageBucket: "assignment-api-fda6f.appspot.com",
        messagingSenderId: "430596039192",
        appId: "1:430596039192:web:58af904901e50df226996d"
    };
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const googleAuthProvider = new GoogleAuthProvider();
    const db = getFirestore(app);
    
    onAuthStateChanged(auth, (authUser) => {
  user = authUser;
  // Update your UI based on whether the user is authenticated

  // Start the session timer if the user is authenticated
  if (user) {
    startSessionTimer();
  }
});

    async function handleLogin(event) {
      event.preventDefault();
    
      try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // User is signed in
      const user = userCredential.user;
      console.log("User signed in:", user);
      // Fetch assignments and display them (you can move this code to a separate function)
      assignments = await getAssignments();
    } catch (error) {
      console.error("Error signing in:", error.code, error.message);
    }
    
    }
    
    // Function to open the registration popup
    function openRegistrationPopup() {
      showRegistrationPopup = true;
    }
    
    // Function to close the registration popup
    function closeRegistrationPopup() {
      showRegistrationPopup = false;
    }
    
    // ...
    async function handleRegistration(event) {
  event.preventDefault();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
    // User is registered and signed in
    const user = userCredential.user;
    console.log("User registered and signed in:", user);

    // Store the registered email in a separate collection
    await storeRegisteredEmail(registerEmail);

    // Clear the registration form fields
    registerEmail = "";
    registerPassword = "";

    // Fetch assignments and display them (you can move this code to a separate function)
    assignments = await getAssignments();

    // Close the registration popup after successful registration
    closeRegistrationPopup();
  } catch (error) {
    console.error("Error registering:", error.code, error.message);
  }
}

async function storeRegisteredEmail(email) {
  // Use Firebase Firestore to store the registered email in a separate collection
  try {
    await addDoc(collection(db, "registered_emails"), { email });
  } catch (error) {
    console.error("Error storing registered email:", error);
  }
}

async function signInWithGoogle() {
  try {
    const userCredential = await signInWithPopup(auth, googleAuthProvider);

    // User is signed in with Google
    const user = userCredential.user;
    console.log("User signed in with Google:", user);

    // Check if the Google email matches any registered email
    const googleEmail = user.email;

    // Fetch the list of registered emails from Firebase
    const registeredEmailsSnapshot = await getDocs(collection(db, "registered_emails"));
    const registeredEmails = registeredEmailsSnapshot.docs.map((doc) => doc.data().email);

    if (registeredEmails.includes(googleEmail)) {
      // Email is registered, allow access and fetch assignments
      assignments = await getAssignments();
    } else {
      // Email is not registered, sign the user out
      await signOut(auth);
      console.log("User signed out because the Google email is not registered.");
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
  }
}

    
     async function handleLogout() {
  try {
    // Clear the session timer
    clearTimeout(sessionTimer);

    await signOut(auth);
    // After successful logout, reset user state and assignments
    user = null;
    assignments = [];
    // You can optionally redirect to the login page here
    console.log("User Logout Successfully");
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

    
    function startSessionTimer() {
  // Clear any existing timer (to handle user activity)
  clearTimeout(sessionTimer);

  // Set a new timer for 30 minutes (30 minutes * 60 seconds * 1000 milliseconds)
  sessionTimer = setTimeout(() => {
    // Automatically log the user out after the session timeout
    handleLogout();
  }, 30 * 60 * 1000); // 30 minutes in milliseconds
}
onMount(async () => {
  if (user) {
    assignments = await getAssignments();

    // Add event listeners for user activity
    window.addEventListener('mousemove', startSessionTimer);
    window.addEventListener('keydown', startSessionTimer);
  }
});

    async function addAssignment() {
      if (user) {
        const assignmentId = await createAssignment({
          ...newAssignment,
          createdBy: user.uid,
        });
        if (assignmentId) {
          newAssignment = { title: "", description: "" };
          assignments = await getAssignments();
          console.log("Assignments after adding:", assignments); // Add this log
        }
        console.log("New assignment has been added successfully");
      } else {
        console.error("User is not authenticated.");
      }
    }
    
    
    async function getAssignments() {
      const db = getFirestore();
      const assignmentsCollection = collection(db, "assignments");
    
      // Get the currently authenticated user's ID (assuming the user is logged in)
      const userId = user ? user.uid : null;
    
      // Create a Firestore query to fetch assignments of the current user
      const q = query(assignmentsCollection, where("createdBy", "==", userId));
    
      const querySnapshot = await getDocs(q);
      const assignments = [];
    
      querySnapshot.forEach((doc) => {
        const assignmentData = doc.data();
        assignments.push({
          id: doc.id,
          title: assignmentData.title,
          description: assignmentData.description,
        });
      });
    
      return assignments;
    }
    
    async function editAssignment(id) {
      editingId = id;
      const assignment = assignments.find((a) => a.id === id);
      if (assignment) {
        newAssignment = { ...assignment };
      }
      console.log("Assignment has edited successfully");
    }
    
    async function update() {
      await updateAssignment(editingId, newAssignment);
      assignments = await getAssignments();
      cancelEdit();
    }
    
    function cancelEdit() {
      editingId = null;
      newAssignment = { title: "", description: "" };
    }
    
    async function removeAssignment(id) {
      { await deleteAssignment(id);
      assignments = await getAssignments();
    }
    console.log("Assignment has deleted successfully");
    }
    
    onMount(async () => {
      if (user) {
        assignments = await getAssignments();
      }
    });
    </script>
    
    <!-- Updated Svelte Code -->
    
    <main>
    <header>
      <h1>ASSIGNMENT MANAGER</h1>
    </header>
    {#if user}
    <button class="logout-button" on:click={handleLogout}>Logout</button> <!-- Add Logout button -->
    <section class="assignment-form">
      <h2>{editingId ? 'Edit Assignment' : 'Add Assignment'}</h2>
      <form>
        <label for="title">Title</label>
        <input type="text" id="title" placeholder="Enter assignment title" bind:value={newAssignment.title} />
    
        <label for="description">Description</label>
        <input type="text" id="description" placeholder="Enter assignment description" bind:value={newAssignment.description} />
    
        {#if editingId}
          <div class="form-buttons">
            <button class="save-button" on:click={update}>Save</button>
            <button class="cancel-button" on:click={cancelEdit}>Cancel</button>
          </div>
        {:else}
          <button class="add-button" on:click={addAssignment}>Add Assignment</button>
        {/if}
      </form>
    </section>
    <ul class="assignment-list">
        {#each assignments as assignment (assignment.id)}
          <li class="assignment-card">
            <div class="assignment-details">
              <h3>{assignment.title}</h3>
              <p>{assignment.description}</p>
            </div>
            <div class="assignment-actions">
              <button class="edit-button" on:click={() => editAssignment(assignment.id)}>Edit</button>
              <button class="delete-button" on:click={() => removeAssignment(assignment.id)}>Delete</button>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
       <!-- Login Form -->
    <section class="login-form">
        <h2>Login</h2>
        <form on:submit={handleLogin}>
          <label for="email">Email</label>
          <input type="email" id="email" bind:value={email} required />
      
          <label for="password">Password</label>
          <input type="password" id="password" bind:value={password} required />
      
          <button type="submit" class="login-button">Login</button>
        </form>
      
        <!-- Add a button for Google Sign-In -->
        <button on:click={signInWithGoogle} class="google-button">
          <span class="google-icon"></span>
          Sign in with Google
        </button>
      
        <p>Don't have an account? <a on:click={openRegistrationPopup}>Register</a></p>
      </section>
      
    <!-- Registration Popup (Overlay) -->
    {#if showRegistrationPopup}
    <div class="overlay">
      <div class="registration-popup">
        <h2>Register</h2>
        <form on:submit={handleRegistration}>
          <label for="register-email">Email</label>
          <input type="email" id="register-email" bind:value={registerEmail} required />
    
          <label for="register-password">Password</label>
          <input type="password" id="register-password" bind:value={registerPassword} required />
    
          <button type="submit" class="register-button">Register</button>
        </form>
        <p class="popup-close" on:click={closeRegistrationPopup}>Close</p>
      </div>
    </div>
    {/if}
    
    
      
      {/if}
    
    
    </main>
    
    <style>
    /* Updated CSS Styles */
    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    header {
      text-align: center;
      margin-bottom: 20px;
      font-size: xx-large;
    }
    
    h1 {
      font-size: 36px;
      color: #007bff;
      font-weight: bolder;
    }
    
    .assignment-form {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    }
    
    h2 {
      font-size: 24px;
      margin-bottom: 15px;
      text-align: center;
    }
    
    form {
      display: flex;
      flex-direction: column;
    }
    
    label {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: large;
    }
    
    input[type="text"] {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    .form-buttons {
      display: flex;
      justify-content: space-between;
    }
    
    .save-button,
    .add-button {
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      cursor: pointer;
    }
    
    .cancel-button {
      background-color: darkred;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      cursor: pointer;
    }
    
    .add-button {
      font-size: 18px;
    }
    
    .add-button:hover,
    .save-button:hover{
      background-color: #0056b3;
    }
    
    .cancel-button:hover {
      background-color: darkred;
    }
    
    .assignment-list {
      list-style: none;
      padding: 0;
    }
    
    .assignment-card {
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .assignment-details {
      flex: 1;
    }
    
    h3 {
      font-size: 20px;
      color: black;
      font-weight: bolder;
    }
    
    .assignment-actions {
      display: flex;
      gap: 10px;
    }
    
    .edit-button{
        background-color: darkblue;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
    }
    .delete-button {
      background-color: #dc3545;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
    }
    
    .edit-button:hover{
      background-color: darkblue;
    }
    .delete-button:hover {
      background-color: #c82333;
    }
    
    /* CSS Styles for Login Form */
    .login-form {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      font-family: Arial, sans-serif;
    }
    
    .login-form h2 {
      font-size: 24px;
      text-align: center;
      margin-bottom: 15px;
    }
    
    .login-form form {
      display: flex;
      flex-direction: column;
    }
    
    .login-form label {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: large;
    }
    
    .login-form input[type="email"],
    .login-form input[type="password"] {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    .login-form button[type="submit"] {
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 18px;
      transition: background-color 0.2s ease-in-out;
    }
    
    .login-form button[type="submit"]:hover {
      background-color: #0056b3;
    }
    
    .logout-button {
      position: absolute;
      top: 20px; /* Adjust the top position as needed */
      right: 20px; /* Adjust the right position as needed */
      background-color: #dc3545;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 18px;
      transition: background-color 0.2s ease-in-out;
    }
    
    .logout-button:hover {
      background-color: #c82333;
    }
    
    /* Login Form and Registration Popup Styles */
    .login-form,
    .registration-popup {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      font-family: Arial, sans-serif;
    }
    
    .login-form h2,
    .registration-popup h2 {
      font-size: 24px;
      text-align: center;
      margin-bottom: 15px;
    }
    
    .login-form form,
    .registration-popup form {
      display: flex;
      flex-direction: column;
    }
    
    .login-form label,
    .registration-popup label {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: large;
    }
    
    .login-form input[type="email"],
    .login-form input[type="password"],
    .registration-popup input[type="email"],
    .registration-popup input[type="password"] {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    .login-button,
    .register-button,
    .close-button {
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 18px;
      transition: background-color 0.2s ease-in-out;
    }
    
    .login-button:hover,
    .register-button:hover,
    .close-button:hover {
      background-color: #0056b3;
    }
    
    /* Google Sign-In Button Styles */
    .google-button {
      background-color: #4285f4;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 18px;
      margin-top: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .google-icon {
      width: 24px;
      height: 24px;
      background-image: url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRev2mfZW4GQv89aKGJQp-t9ajKQvsQNIFIMQ&usqp=CAU"); /* Add your Google icon image path */
      background-size: cover;
      margin-right: 10px;
    }
    /* Registration Popup Overlay Styles */
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent background */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000; /* Ensure the overlay appears above other elements */
    }
    
    /* Registration Popup Styles */
    .registration-popup {
      width: 100%;
      max-width: 400px;
      padding: 20px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      font-family: Arial, sans-serif;
      position: relative;
    }
    
    .registration-popup h2 {
      font-size: 24px;
      text-align: center;
      margin-bottom: 15px;
    }
    
    .registration-popup form {
      display: flex;
      flex-direction: column;
    }
    
    .registration-popup label {
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 16px;
    }
    
    .registration-popup input[type="email"],
    .registration-popup input[type="password"] {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .register-button {
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 18px;
      transition: background-color 0.2s ease-in-out;
    }
    
    .register-button:hover {
      background-color: #0056b3;
    }
    
    .popup-close {
      position: absolute;
      top: 10px;
      right: 10px;
      color: red;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      transition: color 0.2s ease-in-out;
    }
    
    .popup-close:hover {
      color: darkred;
    }
    </style>