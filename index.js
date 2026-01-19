// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2511-FTB-CT-WEB-PT-vanessa"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getEvents() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function addParty(party) {
  try {
    await fetch(API + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(party),
    });
    await getEvents();
  } catch (e) {
    console.error(e);
  }
}

async function removeParty(id) {
  try {
    await fetch(API + "/events/" + id, {
      method: "DELETE",
    });
    selectedParty = undefined;
    await getEvents();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Creating the form to input new parties */
function createForm() {
  const $form = document.createElement("form");

  $form.innerHTML = `
    <label for="pName">Name</label>
    <input type="text" name="pName" required /><br>
    <label for="pDescription">Description</label>
    <input type="text" name="pDescription" required /><br>
    <label for="pDate">Date</label>
    <input type="date" name="pDate" required /><br>
    <label for="pLocation">Location</label>
    <input type="text" name="pLocation" required /><br>
    <button type="submit" class="addParty">Add Party</button>
  `;

  // const $button = $form.querySelector("button");

  $form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData($form);
    const date = new Date(data.get("pDate")).toISOString();
    await addParty({
      name: data.get("pName"),
      description: data.get("pDescription"),
      date,
      location: data.get("pLocation"),
    });
    $form.reset();
  });

  return $form;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button class="deleteParty">Delete Party</button>
  `;

  $party.querySelector("GuestList").replaceWith(GuestList());
  const $deleteButton = $party.querySelector(".deleteParty");

  $deleteButton.addEventListener("click", () => removeParty(selectedParty.id));

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id,
    ),
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");

  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
      <form>
      </form>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("form").replaceWith(createForm());
}

async function init() {
  await getEvents();
  await getRsvps();
  await getGuests();
  render();
}

init();
