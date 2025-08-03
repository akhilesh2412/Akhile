import { auth, db, collection, getDocs, updateDoc, doc, signOut } from "./firebase.js";

// Show sections
window.showSection = async function (section) {
  const container = document.getElementById("adminContent");
  container.innerHTML = "<p>Loading...</p>";

  // Load tickets data
  const snapshot = await getDocs(collection(db, "tickets"));

  if (section !== "upi") {
    if (snapshot.empty) {
      container.innerHTML = "<p>No tickets found.</p>";
      return;
    }
  }

  let approvedTickets = [];
  let totalTeams = snapshot.size;
  let totalPayments = 0;

  snapshot.forEach((docSnap) => {
    const ticket = docSnap.data();
    if (ticket.utr) totalPayments++;
  });

  container.innerHTML = "";

  // ✅ Summary on 'teams' page
  if (section === "teams") {
    container.innerHTML += `
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; background: #1e1e1e; color: white; padding: 20px; border-radius: 10px;">
          <h3>Total Registered Teams</h3>
          <p style="font-size: 24px;">${totalTeams}</p>
        </div>
        <div style="flex: 1; background: #1e1e1e; color: white; padding: 20px; border-radius: 10px;">
          <h3>Total Payments Received</h3>
          <p style="font-size: 24px;">${totalPayments}</p>
        </div>
      </div>
    `;
  }

  // UPI Management Section
  if (section === "upi") {
    container.innerHTML = `
      <div class="ticket-card">
        <h2>Manage UPI Address</h2>
        <p>Current UPI: <strong id="currentUpi">Loading...</strong></p>
        <form onsubmit="updateUpi(event)">
          <input type="text" id="newUpi" placeholder="Enter new UPI address" required>
          <button type="submit">Update UPI</button>
        </form>
      </div>
    `;

    // Load current UPI
    try {
      const upiDoc = await getDoc(doc(db, "settings", "upi"));
      if (upiDoc.exists()) {
        document.getElementById("currentUpi").textContent = upiDoc.data().address;
        document.getElementById("newUpi").value = upiDoc.data().address;
      } else {
        document.getElementById("currentUpi").textContent = "Not set";
      }
    } catch (error) {
      console.error("Error loading UPI:", error);
      document.getElementById("currentUpi").textContent = "Error loading";
    }
    return;
  }

  // Teams and Payments sections
  snapshot.forEach((documentSnapshot) => {
    const ticket = documentSnapshot.data();
    const id = documentSnapshot.id;

    if (section === "teams") {
      const card = document.createElement("div");
      card.className = "ticket-card";

      const statusColor =
        ticket.status === "approved" ? "lightgreen" :
        ticket.status === "rejected" ? "tomato" : "orange";

      if (ticket.status === "approved") {
        approvedTickets.push({
          team: ticket.teamName || `Team ${ticket.leader}`,
          players: ticket.players.join(", "),
          leader: ticket.leader,
          email: ticket.email,
          mobile: ticket.mobile,
          utr: ticket.utr,
        });
      }

      card.innerHTML = `
        <strong>Team ${ticket.teamName || ""}</strong><br>
        Players: ${ticket.players.join(", ")}<br>
        Leader: ${ticket.leader}<br>
        Mobile: ${ticket.mobile}<br>
        Email: ${ticket.email}<br>
        UTR: ${ticket.utr || "Not submitted"}<br>
        Status: <strong style="color:${statusColor}">${ticket.status || 'pending'}</strong><br>
        <div id="btns-${id}">
          ${ticket.utr && ticket.status === "pending" ? `
            <button onclick="updateStatus('${id}', 'approved')">✅ Approve</button>
            <button onclick="updateStatus('${id}', 'rejected')">❌ Reject</button>
          ` : ""}
        </div>
        <hr>
      `;

      container.appendChild(card);
    }
    else if (section === "payments" && ticket.utr) {
      const card = document.createElement("div");
      card.className = "ticket-card";

      card.innerHTML = `
        <strong>Payment Received</strong><br>
        Team: ${ticket.teamName || ""}<br>
        Leader: ${ticket.leader}<br>
        Mobile: ${ticket.mobile}<br>
        Email: ${ticket.email}<br>
        UTR: <strong>${ticket.utr}</strong><br>
        Status: <strong>${ticket.status || "pending"}</strong>
        <hr>
      `;

      container.appendChild(card);
    }
  });

  // PDF button
  if (section === "teams" && approvedTickets.length > 0) {
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "📥 Download Approved Tickets as PDF";
    downloadBtn.className = "download-btn";
    downloadBtn.onclick = () => downloadPDF(approvedTickets);
    container.appendChild(downloadBtn);
  }
};

// Auto-load "teams" section
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  showSection("teams");
});

// Approve/Reject
window.updateStatus = async (id, status) => {
  await updateDoc(doc(db, "tickets", id), { status });
  showSection("teams");
};

// Update UPI address - REPLACE THIS FUNCTION
window.updateUpi = async (e) => {
  e.preventDefault();
  const newUpi = document.getElementById("newUpi").value.trim();
  
  if (!newUpi) {
    alert("Please enter a valid UPI address");
    return;
  }

  try {
    const upiRef = doc(db, "settings", "upi");
    
    // First try to update, if that fails, create the document
    try {
      await updateDoc(upiRef, { address: newUpi });
    } catch (updateError) {
      if (updateError.code === 'not-found') {
        // Document doesn't exist, create it
        await setDoc(upiRef, { address: newUpi });
      } else {
        throw updateError; // Re-throw other errors
      }
    }
    
    document.getElementById("currentUpi").textContent = newUpi;
    alert("UPI address updated successfully!");
  } catch (error) {
    console.error("Error updating UPI:", error);
    alert(`Failed to update UPI address: ${error.message}`);
  }
};

// Logout
window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

// PDF Download
window.downloadPDF = (tickets) => {
  const doc = new window.jspdf.jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Approved Teams", 105, 15, null, null, "center");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let y = 25;
  tickets.forEach((t, i) => {
    doc.text(`Team: ${t.team}`, 10, y);
    doc.text(`Leader: ${t.leader}`, 10, y + 6);
    doc.text(`Players: ${t.players}`, 10, y + 12);
    doc.text(`Mobile: ${t.mobile}`, 10, y + 18);
    doc.text(`Email: ${t.email}`, 10, y + 24);
    doc.text(`UTR: ${t.utr}`, 10, y + 30);
    y += 40;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("Approved_Tickets.pdf");
};