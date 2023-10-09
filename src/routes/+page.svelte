<script>
	import { onMount } from "svelte";
	import { createAssignment, getAssignments, deleteAssignment, updateAssignment } from "./firebase";
  
	let assignments = [];
	let newAssignment = { title: "", description: "" };
	let editingId = null;
  
	async function addAssignment() {
	  const assignmentId = await createAssignment(newAssignment);
	  if (assignmentId) {
		newAssignment = { title: "", description: "" };
		assignments = await getAssignments();
	  }
	  console.log("New assignment has added successfully");
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
	  assignments = await getAssignments();
	});
  </script>
  
<!-- Updated Svelte Code -->

<main>
	<header>
	  <h1>ASSIGNMENT MANAGER</h1>
	</header>
  
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
  </style>
  