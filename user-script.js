class UserAttendanceTracker {
    constructor() {
        // Check localStorage availability
        this.storageAvailable = this.checkStorageAvailability();
        if (!this.storageAvailable) {
            this.showStorageWarning();
        }
        
        this.members = this.loadData('teamMembers') || [];
        this.attendance = this.loadData('attendanceData') || {};
        this.currentDate = new Date().toISOString().split('T')[0];
        
        this.init();
    }

    checkStorageAvailability() {
        try {
            const test = 'localStorage-test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    showStorageWarning() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            border-bottom: 2px solid #f5c6cb;
        `;
        warning.innerHTML = `
            <strong>⚠️ Storage Not Available</strong><br>
            Attendance data cannot be saved. Please open this file via HTTP server or use Firefox browser.
            <a href="#" onclick="this.parentElement.style.display='none'" style="float:right;color:#721c24;">×</a>
        `;
        document.body.prepend(warning);
    }

    init() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.renderAttendanceTable();
        this.updateStats();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        // Date controls
        document.getElementById('currentDate').addEventListener('change', (e) => {
            this.currentDate = e.target.value;
            this.renderAttendanceTable();
            this.updateStats();
        });

        document.getElementById('todayBtn').addEventListener('click', () => {
            this.setCurrentDate();
            this.renderAttendanceTable();
            this.updateStats();
        });

        // Import functionality
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importTeamData(file);
            }
        });

        // Sync functionality
        document.getElementById('syncBtn').addEventListener('click', () => {
            this.exportAttendanceData();
        });
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('currentDate').value = today;
        this.currentDate = today;
    }

    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    saveData(key, data) {
        if (!this.storageAvailable) {
            this.showMessage('Cannot save data: Browser storage is not available. Please use HTTP server.', 'error');
            return false;
        }
        
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('❌ Error saving data. Please use HTTP server or check browser settings.', 'error');
            return false;
        }
    }

    updateAttendance(memberId, field, value) {
        if (!this.attendance[this.currentDate]) {
            this.attendance[this.currentDate] = {};
        }

        if (!this.attendance[this.currentDate][memberId]) {
            this.attendance[this.currentDate][memberId] = {
                status: 'present',
                checkInTime: '',
                checkOutTime: '',
                notes: ''
            };
        }

        this.attendance[this.currentDate][memberId][field] = value;

        // Auto-set check-in time when status changes to present or late (only if manual time not set)
        if (field === 'status' && (value === 'present' || value === 'late')) {
            if (!this.attendance[this.currentDate][memberId].checkInTime) {
                const now = new Date();
                this.attendance[this.currentDate][memberId].checkInTime = 
                    now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0');
            }
        }

        // Clear check-in time when status is absent
        if (field === 'status' && value === 'absent') {
            this.attendance[this.currentDate][memberId].checkInTime = '';
            this.attendance[this.currentDate][memberId].checkOutTime = '';
        }

        // When manually setting check-in time, auto-set status to present if currently absent
        if (field === 'checkInTime' && value && this.attendance[this.currentDate][memberId].status === 'absent') {
            this.attendance[this.currentDate][memberId].status = 'present';
        }

        // When manually setting check-out time, ensure check-in exists
        if (field === 'checkOutTime' && value && !this.attendance[this.currentDate][memberId].checkInTime) {
            // Auto-set check-in to 1 hour before check-out if not specified
            const [outHour, outMinute] = value.split(':').map(Number);
            let inHour = outHour - 1;
            if (inHour < 0) inHour = 0;
            this.attendance[this.currentDate][memberId].checkInTime = 
                inHour.toString().padStart(2, '0') + ':' + outMinute.toString().padStart(2, '0');
        }

        this.saveData('attendanceData', this.attendance);
        this.updateStats();
        
        // Re-render the table when status or time fields change to update display
        if (field === 'status' || field === 'checkInTime' || field === 'checkOutTime') {
            this.renderAttendanceTable();
        }

        // Show save confirmation (only for notes to avoid too many messages)
        if (field === 'notes') {
            this.showMessage('Attendance updated successfully', 'success');
        }
    }

    checkIn(memberId) {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');

        if (!this.attendance[this.currentDate]) {
            this.attendance[this.currentDate] = {};
        }

        if (!this.attendance[this.currentDate][memberId]) {
            this.attendance[this.currentDate][memberId] = {
                status: 'present',
                checkInTime: '',
                checkOutTime: '',
                notes: ''
            };
        }

        this.attendance[this.currentDate][memberId].checkInTime = currentTime;
        this.attendance[this.currentDate][memberId].status = 'present';

        this.saveData('attendanceData', this.attendance);
        this.renderAttendanceTable();
        this.updateStats();
        
        const member = this.members.find(m => m.id === memberId);
        this.showMessage(`${member.name} checked in at ${currentTime}`, 'success');
    }

    checkOut(memberId) {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');

        if (!this.attendance[this.currentDate]) {
            this.attendance[this.currentDate] = {};
        }

        if (!this.attendance[this.currentDate][memberId]) {
            this.attendance[this.currentDate][memberId] = {
                status: 'present',
                checkInTime: '',
                checkOutTime: '',
                notes: ''
            };
        }

        this.attendance[this.currentDate][memberId].checkOutTime = currentTime;

        this.saveData('attendanceData', this.attendance);
        this.renderAttendanceTable();
        
        const member = this.members.find(m => m.id === memberId);
        this.showMessage(`${member.name} checked out at ${currentTime}`, 'success');
    }

    calculateWorkingHours(checkInTime, checkOutTime) {
        if (!checkInTime || !checkOutTime) return '';

        const [inHour, inMinute] = checkInTime.split(':').map(Number);
        const [outHour, outMinute] = checkOutTime.split(':').map(Number);

        const checkInMinutes = inHour * 60 + inMinute;
        const checkOutMinutes = outHour * 60 + outMinute;

        let diffMinutes = checkOutMinutes - checkInMinutes;
        if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle next day checkout

        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        return `${hours}h ${minutes}m`;
    }

    renderAttendanceTable() {
        const tbody = document.getElementById('attendanceTableBody');
        
        if (this.members.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No team data loaded</h3>
                        <p>Please import team data from your administrator</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.members.map(member => {
            const attendance = this.attendance[this.currentDate]?.[member.id] || {
                status: 'present',
                checkInTime: '',
                checkOutTime: '',
                notes: ''
            };

            const workingHours = this.calculateWorkingHours(attendance.checkInTime, attendance.checkOutTime);
            const hasCheckedIn = attendance.checkInTime !== '';
            const hasCheckedOut = attendance.checkOutTime !== '';

            return `
                <tr>
                    <td>
                        <strong>${member.name}</strong>
                        ${member.role ? `<br><small class="text-muted">${member.role}</small>` : ''}
                    </td>
                    <td>
                        <select class="status-select ${attendance.status}" 
                                onchange="userApp.updateAttendance('${member.id}', 'status', this.value)">
                            <option value="present" ${attendance.status === 'present' ? 'selected' : ''}>Present</option>
                            <option value="absent" ${attendance.status === 'absent' ? 'selected' : ''}>Absent</option>
                            <option value="late" ${attendance.status === 'late' ? 'selected' : ''}>Late</option>
                        </select>
                    </td>
                    <td>
                        <div class="time-buttons">
                            ${attendance.status !== 'absent' ? `
                                <button class="checkin-btn" 
                                        ${hasCheckedIn ? 'disabled' : ''}
                                        onclick="userApp.checkIn('${member.id}')">
                                    <i class="fas fa-sign-in-alt"></i> Quick Check In
                                </button>
                                <input type="time" class="time-input" 
                                       value="${attendance.checkInTime}"
                                       onchange="userApp.updateAttendance('${member.id}', 'checkInTime', this.value)"
                                       ${attendance.status === 'absent' ? 'disabled' : ''}>
                                ${hasCheckedIn ? `<div class="time-display checked-in">In: ${attendance.checkInTime}</div>` : ''}
                            ` : '<span class="text-muted">Not applicable</span>'}
                        </div>
                    </td>
                    <td>
                        <div class="time-buttons">
                            ${attendance.status !== 'absent' ? `
                                <button class="checkout-btn" 
                                        ${hasCheckedOut ? 'disabled' : ''}
                                        onclick="userApp.checkOut('${member.id}')">
                                    <i class="fas fa-sign-out-alt"></i> Quick Check Out
                                </button>
                                <input type="time" class="time-input" 
                                       value="${attendance.checkOutTime}"
                                       onchange="userApp.updateAttendance('${member.id}', 'checkOutTime', this.value)"
                                       ${attendance.status === 'absent' ? 'disabled' : ''}>
                                ${hasCheckedOut ? `
                                    <div class="time-display checked-out">Out: ${attendance.checkOutTime}</div>
                                    <div class="working-hours">Total: ${workingHours}</div>
                                ` : ''}
                            ` : '<span class="text-muted">-</span>'}
                        </div>
                    </td>
                    <td>
                        <input type="text" class="notes-input" 
                               placeholder="Add notes..."
                               value="${attendance.notes}"
                               onchange="userApp.updateAttendance('${member.id}', 'notes', this.value)">
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateStats() {
        const totalMembers = this.members.length;
        let presentToday = 0;
        let absentToday = 0;

        if (this.attendance[this.currentDate]) {
            this.members.forEach(member => {
                const status = this.attendance[this.currentDate][member.id]?.status || 'present';
                if (status === 'present' || status === 'late') {
                    presentToday++;
                } else {
                    absentToday++;
                }
            });
        } else {
            presentToday = totalMembers; // Default to all present if no data for the day
        }

        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('presentToday').textContent = presentToday;
        document.getElementById('absentToday').textContent = absentToday;
    }

    importTeamData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.members && Array.isArray(data.members)) {
                    this.members = data.members;
                    this.saveData('teamMembers', this.members);
                    this.renderAttendanceTable();
                    this.updateStats();
                    this.showMessage(`Successfully imported ${this.members.length} team members!`, 'success');
                    
                    // Update import status
                    document.getElementById('importStatus').innerHTML = `
                        <div class="import-success">
                            <i class="fas fa-check-circle"></i>
                            Team data imported successfully (${this.members.length} members)
                        </div>
                    `;
                } else {
                    throw new Error('Invalid team data format');
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showMessage('Error importing team data. Please check the file format.', 'error');
                
                document.getElementById('importStatus').innerHTML = `
                    <div class="import-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        Import failed: Invalid file format
                    </div>
                `;
            }
        };
        reader.readAsText(file);
    }

    exportAttendanceData() {
        if (Object.keys(this.attendance).length === 0) {
            this.showMessage('No attendance data to export.', 'error');
            return;
        }

        try {
            const exportData = {
                attendance: this.attendance,
                exportDate: new Date().toISOString(),
                totalRecords: Object.keys(this.attendance).length
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `attendance_data_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            this.showMessage('Attendance data exported for admin review!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Error exporting attendance data.', 'error');
        }
    }

    toggleExceptionMode() {
        if (!this.isExceptionMode) {
            const confirmation = confirm(
                "EXCEPTION MODE WARNING\n\n" +
                "You are about to enable manual date changes for backdated attendance entries.\n\n" +
                "This will:\n" +
                "• Allow you to change the date manually\n" +
                "• Record this as an exception in the system\n" +
                "• Mark all entries made in this session as exceptions\n\n" +
                "Use only when correcting missed attendance entries.\n\n" +
                "Do you want to continue?"
            );
            
            if (confirmation) {
                this.enableExceptionMode();
            }
        } else {
            this.exitExceptionMode();
        }
    }

    enableExceptionMode() {
        this.isExceptionMode = true;
        const dateInput = document.getElementById('currentDate');
        const exceptionBtn = document.getElementById('exceptionBtn');
        const exceptionStatus = document.getElementById('exceptionStatus');
        
        dateInput.removeAttribute('readonly');
        dateInput.classList.add('exception-mode');
        exceptionBtn.classList.add('exception-active');
        exceptionBtn.innerHTML = '<i class="fas fa-times-circle"></i> Exit Exception';
        exceptionStatus.classList.remove('hidden');
        
        this.showMessage('Exception mode enabled. You can now manually change the date. All entries will be marked as exceptions.', 'warning');
    }

    exitExceptionMode() {
        this.isExceptionMode = false;
        const dateInput = document.getElementById('currentDate');
        const exceptionBtn = document.getElementById('exceptionBtn');
        const exceptionStatus = document.getElementById('exceptionStatus');
        
        dateInput.setAttribute('readonly', true);
        dateInput.classList.remove('exception-mode');
        exceptionBtn.classList.remove('exception-active');
        exceptionBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Exception Mode';
        exceptionStatus.classList.add('hidden');
        
        // Reset to today's date
        this.setCurrentDate();
        this.renderAttendanceTable();
        this.updateStats();
        
        this.showMessage('Exception mode disabled. Date locked to today.', 'success');
    }

    recordException(action, memberId, details = '') {
        const member = this.members.find(m => m.id === memberId);
        const exception = {
            id: Date.now().toString(),
            date: this.currentDate,
            memberName: member ? member.name : 'Unknown',
            memberId: memberId,
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            actualDate: new Date().toISOString().split('T')[0]
        };
        
        this.exceptions.push(exception);
        this.saveData('attendanceExceptions', this.exceptions);
    }

    isExceptionDate() {
        const today = new Date().toISOString().split('T')[0];
        return this.currentDate !== today;
    }

    showWelcomeMessage() {
        if (this.members.length === 0) {
            this.showMessage('Welcome! Please import team data from your administrator to get started.', 'info');
        }
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        
        let iconClass = 'check-circle';
        if (type === 'error') iconClass = 'exclamation-triangle';
        if (type === 'info') iconClass = 'info-circle';
        if (type === 'warning') iconClass = 'exclamation-circle';

        messageDiv.innerHTML = `
            <i class="fas fa-${iconClass}"></i>
            ${message}
        `;

        // Insert after header
        const header = document.querySelector('.header');
        header.parentNode.insertBefore(messageDiv, header.nextSibling);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 4000);
    }
}

// Initialize the user application
let userApp;
document.addEventListener('DOMContentLoaded', () => {
    userApp = new UserAttendanceTracker();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + I to import
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        document.getElementById('importFile').click();
    }
    
    // Ctrl/Cmd + S to sync/export
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        userApp.exportAttendanceData();
    }
});
