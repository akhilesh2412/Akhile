import { db, collection, getDocs } from "./firebase.js";

async function updateTicketList() {
  const list = document.getElementById("ticketList");
  list.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "tickets"));
  querySnapshot.forEach((doc, index) => {
    const ticket = doc.data();

    // ✅ Only show if status is 'accepted'
    if (ticket.status !== "approved") return;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>Team ${ticket.teamName}</strong><br>
      Players: ${ticket.players.join(", ")}<br>
      Leader: <span style="color:#0fd">${ticket.leader}</span><br>
      Mobile: ${"Private Information"}<br>
      Email: ${ticket.email}<br>
    `;
    list.appendChild(li);
  });
}

updateTicketList();
