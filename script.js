let students = JSON.parse(localStorage.getItem('students')) || {};
let currentSubject = 'Math';
let today = new Date().toISOString().slice(0,10); // YYYY-MM-DD

// Ensure subject exists
if (!students[currentSubject]) students[currentSubject] = [];

// Display students
function displayStudents() {
    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    students[currentSubject].forEach((student, index) => {
        let month = new Date().getMonth();
        let year = new Date().getFullYear();

        // Filter attendance for this month
        let monthlyRecords = student.attendance.filter(d => {
            let date = new Date(d.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });

        let totalDays = monthlyRecords.length;
        let presentDays = monthlyRecords.filter(d => d.status === 'Present').length;

        let percentage = totalDays
            ? ((presentDays / totalDays) * 100).toFixed(2)
            : 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td><button class="present-btn" onclick="markAttendance(${index}, 'Present')">Present</button></td>
            <td><button class="absent-btn" onclick="markAttendance(${index}, 'Absent')">Absent</button></td>
            <td>${percentage}%</td>
            <td><button onclick="deleteStudent(${index})">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    updateChart();
}

// Add student
function addStudent() {
    const name = document.getElementById('studentName').value.trim();
    if (!name) return alert("Enter student name!");

    students[currentSubject].push({
        name,
        attendance: []
    });

    document.getElementById('studentName').value = "";
    saveStudents();
    displayStudents();
}

// ✅ FIXED: Mark attendance (NO DUPLICATES)
function markAttendance(index, status) {
    let student = students[currentSubject][index];

    // Check if already marked today
    let existing = student.attendance.find(a => a.date === today);

    if (existing) {
        existing.status = status; // Update
    } else {
        student.attendance.push({ date: today, status }); // Add new
    }

    saveStudents();
    displayStudents();
}

// Delete student
function deleteStudent(index) {
    students[currentSubject].splice(index, 1);
    saveStudents();
    displayStudents();
}

// Save to localStorage
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Change subject
function changeSubject() {
    currentSubject = document.getElementById('subjectSelect').value;

    if (!students[currentSubject]) {
        students[currentSubject] = [];
    }

    saveStudents();
    displayStudents();
}

// Export CSV
function exportCSV() {
    let csv = 'Name,Date,Status\n';

    students[currentSubject].forEach(s => {
        s.attendance.forEach(a => {
            csv += `${s.name},${a.date},${a.status}\n`;
        });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSubject}_attendance.csv`;
    a.click();
}

// Chart
function updateChart() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');

    const names = students[currentSubject].map(s => s.name);

    const percentages = students[currentSubject].map(s => {
        let month = new Date().getMonth();
        let year = new Date().getFullYear();

        let records = s.attendance.filter(d => {
            let date = new Date(d.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });

        let total = records.length;
        let present = records.filter(d => d.status === 'Present').length;

        return total
            ? ((present / total) * 100).toFixed(2)
            : 0;
    });

    if (window.attChart) window.attChart.destroy();

    window.attChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: names,
            datasets: [{
                label: '% Attendance This Month',
                data: percentages,
                backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Initialize
displayStudents();
