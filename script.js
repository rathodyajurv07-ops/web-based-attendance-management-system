// Initialize students data
let students = JSON.parse(localStorage.getItem('students')) || {};
let currentSubject = 'Math';

// Ensure subject exists
if(!students[currentSubject]) students[currentSubject] = [];

// Display students
function displayStudents() {
    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";
    students[currentSubject].forEach((student, index) => {
        let total = student.attendance.length;
        let present = student.attendance.filter(d => d).length;
        let percentage = total ? Math.round((present / total) * 100) : 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>
                <input type="checkbox" ${student.attendance[student.attendance.length-1] ? 'checked' : ''} onchange="toggleAttendance(${index})">
            </td>
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
    if(name === "") return alert("Enter student name!");
    students[currentSubject].push({name, attendance: [false]});
    document.getElementById('studentName').value = "";
    saveStudents();
    displayStudents();
}

// Toggle attendance
function toggleAttendance(index) {
    let arr = students[currentSubject][index].attendance;
    arr[arr.length-1] = !arr[arr.length-1];
    saveStudents();
    displayStudents();
}

// Delete student
function deleteStudent(index) {
    students[currentSubject].splice(index,1);
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
    if(!students[currentSubject]) students[currentSubject] = [];
    saveStudents();
    displayStudents();
}

// Search student
function searchStudent() {
    const filter = document.getElementById('searchName').value.toLowerCase();
    const tbody = document.querySelector("#studentTable tbody");
    tbody.querySelectorAll('tr').forEach(tr => {
        const name = tr.cells[0].textContent.toLowerCase();
        tr.style.display = name.includes(filter) ? '' : 'none';
    });
}

// Export CSV
function exportCSV() {
    let csv = 'Name,Attendance\n';
    students[currentSubject].forEach(s => {
        let presentDays = s.attendance.filter(d => d).length;
        csv += `${s.name},${presentDays}/${s.attendance.length}\n`;
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSubject}_attendance.csv`;
    a.click();
}

// Update chart
function updateChart() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    const names = students[currentSubject].map(s => s.name);
    const percentages = students[currentSubject].map(s => {
        let total = s.attendance.length;
        let present = s.attendance.filter(d => d).length;
        return total ? Math.round((present / total) * 100) : 0;
    });

    if(window.attChart) window.attChart.destroy();
    window.attChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: names,
            datasets: [{
                label: '% Attendance',
                data: percentages,
                backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

// Initialize
displayStudents();
