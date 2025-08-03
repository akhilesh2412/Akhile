document.addEventListener('DOMContentLoaded', loadTickets);

function loadTickets() {
  fetch('/api/tickets')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('ticketList');
      list.innerHTML = '';
      data.forEach(ticket => {
        list.innerHTML += `
          <div class="ticket">
            <p><strong>Players:</strong> ${ticket.players.join(', ')}</p>
            <p class="leader">Leader: ${ticket.leader}</p>
          </div>
        `;
      });
    });
}

function showTicketForm() {
  document.getElementById('ticketForm').style.display = 'block';
}

function simulatePayment() {
  const players = [
    document.getElementById('p1').value,
    document.getElementById('p2').value,
    document.getElementById('p3').value,
    document.getElementById('p4').value
  ];

  if (players.some(p => !p)) {
    alert('Please fill all 4 players.');
    return;
  }

  const leader = players[Math.floor(Math.random() * players.length)];

  if (confirm(`Proceed to pay ₹99?\nLeader will be: ${leader}`)) {
    fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players, leader })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Payment successful!');
        document.getElementById('ticketForm').style.display = 'none';
        loadTickets();
      }
    });
  }
}
