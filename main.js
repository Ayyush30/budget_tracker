// Global State
let transactions = [];

// DOM Elements
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categoryInput = document.getElementById("category");
const typeInput = document.getElementById("type");
const editIndexInput = document.getElementById("editIndex"); // Stores the DB ID

const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const sortBySelect = document.getElementById("sortBy");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");
const table = document.getElementById("transactionTable");

// Charts
let pieChart, barChart;

// ===== Initialization =====
window.onload = function() {
    loadData();
};

// ===== Data Fetching =====
function loadData() {
    fetch("get.php")
        .then(res => res.json())
        .then(data => {
            // Ensure amounts are treated as numbers
            transactions = data.map(t => ({
                ...t,
                amount: parseFloat(t.amount)
            }));
            render();
        })
        .catch(err => console.error("Error loading data:", err));
}

// ===== Rendering =====
function render(data = transactions) {
    table.innerHTML = "";

    data.forEach((t, index) => {
        // Find the index in the original global array for the edit function
        const originalIndex = transactions.findIndex(item => item.id === t.id);
        
        table.innerHTML += `
            <tr>
                <td>${t.title}</td>
                <td>$${t.amount.toFixed(2)}</td>
                <td>${t.date}</td>
                <td>${t.category}</td>
                <td>${t.type}</td>
                <td>
                    <button onclick="edit(${originalIndex})">Edit</button>
                    <button onclick="removeTx(${t.id})">Delete</button>
                </td>
            </tr>
        `;
    });

    updateSummary();
    updateCharts();
}

// ===== Form Handling (Add & Update) =====
document.getElementById("transactionForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const tx = {
        title: titleInput.value,
        amount: parseFloat(amountInput.value),
        date: dateInput.value,
        category: categoryInput.value,
        type: typeInput.value
    };

    const id = editIndexInput.value;

    if (id === "") {
        // ADD NEW
        fetch("add.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tx)
        }).then(() => {
            this.reset();
            loadData();
        });
    } else {
        // UPDATE EXISTING
        tx.id = id;
        fetch("update.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tx)
        }).then(() => {
            editIndexInput.value = "";
            this.reset();
            loadData();
        });
    }
});

// ===== Edit & Delete =====
function edit(index) {
    const t = transactions[index];

    titleInput.value = t.title;
    amountInput.value = t.amount;
    dateInput.value = t.date;
    categoryInput.value = t.category;
    typeInput.value = t.type;

    // Store the database ID in the hidden input
    editIndexInput.value = t.id;
    
    // Scroll to form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function removeTx(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        fetch("delete.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        }).then(() => loadData());
    }
}

// ===== Summary Calculations =====
function updateSummary() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === "Income") income += t.amount;
        else expense += t.amount;
    });

    totalIncome.textContent = income.toFixed(2);
    totalExpense.textContent = expense.toFixed(2);
    balance.textContent = (income - expense).toFixed(2);
}

// ===== Filters & Sorting =====
function applyFilters() {
    let data = [...transactions];

    if (filterType.value !== "All") {
        data = data.filter(t => t.type === filterType.value);
    }

    if (filterCategory.value !== "All") {
        data = data.filter(t => t.category === filterCategory.value);
    }

    if (sortBySelect.value === "amount") {
        data.sort((a, b) => b.amount - a.amount); // Sort high to low
    } else {
        data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort newest first
    }

    render(data);
}

// ===== Visualization =====
function updateCharts() {
    let categoryTotals = {};
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === "Expense") {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            expense += t.amount;
        } else {
            income += t.amount;
        }
    });

    // Pie Chart
    if (pieChart) pieChart.destroy();
    const pieCtx = document.getElementById("pieChart").getContext("2d");
    pieChart = new Chart(pieCtx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ['#e74c3c', '#f1c40f', '#9b59b6', '#34495e', '#e67e22']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Bar Chart
    if (barChart) barChart.destroy();
    const barCtx = document.getElementById("barChart").getContext("2d");
    barChart = new Chart(barCtx, {
        type: "bar",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                label: "Total Amount",
                data: [income, expense],
                backgroundColor: ['#2ecc71', '#e74c3c']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}