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
	}
  
	async function editAssignment(id) {
	  editingId = id;
	  const assignment = assignments.find((a) => a.id === id);
	  if (assignment) {
		newAssignment = { ...assignment };
	  }
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
	  await deleteAssignment(id);
	  assignments = await getAssignments();
	}
  
	onMount(async () => {
	  assignments = await getAssignments();
	});
  </script>
  
  <main>
	<h1>Assignments</h1>
  
	<form>
	  <input type="text" placeholder="Title" bind:value={newAssignment.title} />
	  <input type="text" placeholder="Description" bind:value={newAssignment.description} />
<!-- Corrected code -->
{#if editingId}
  <button type="button" on:click={update}>Update</button>
  <button type="button" on:click={cancelEdit}>Cancel</button>
{:else}
  <button type="button" on:click={addAssignment}>Add Assignment</button>
{/if}

	</form>
  
	<ul>
	  {#each assignments as assignment (assignment.id)}
		<li>
		  <strong>{assignment.title}</strong>
		  <p>{assignment.description}</p>
		  <button on:click={() => editAssignment(assignment.id)}>Edit</button>
		  <button on:click={() => removeAssignment(assignment.id)}>Delete</button>
		</li>
	  {/each}
	</ul>
  </main>
  


<style>
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  input[type="text"] {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  li strong {
    font-size: 18px;
  }

  li p {
    font-size: 14px;
  }

  li button {
    background-color: #dc3545;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
  }

  li button:hover {
    background-color: #c82333;
  }
</style>
