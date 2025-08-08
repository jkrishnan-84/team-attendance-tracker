class AttendanceTracker {
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
        this.renderSummaryTable();
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

        // Modal controls
        document.getElementById('addMemberBtn').addEventListener('click', () => {
            this.showAddMemberModal();
        });

        document.getElementById('closeAddModal').addEventListener('click', () => {
            this.hideAddMemberModal();
        });

        document.getElementById('closeEditModal').addEventListener('click', () => {
            this.hideEditMemberModal();
        });

        document.getElementById('cancelAddMember').addEventListener('click', () => {
            this.hideAddMemberModal();
        });

        document.getElementById('cancelEditMember').addEventListener('click', () => {
            this.hideEditMemberModal();
        });

        // Form submissions
        document.getElementById('addMemberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMember();
        });

        document.getElementById('editMemberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateMember();
        });

        // Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.showExportMenu();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const addModal = document.getElementById('addMemberModal');
            const editModal = document.getElementById('editMemberModal');
            if (e.target === addModal) {
                this.hideAddMemberModal();
            }
            if (e.target === editModal) {
                this.hideEditMemberModal();
            }
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
            // Show success message for critical saves
            if (key === 'attendanceData') {
                this.showMessage('✅ Attendance saved successfully', 'success');
            }
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('❌ Error saving data. Please use HTTP server or check browser settings.', 'error');
            return false;
        }
    }

    addMember() {
        const name = document.getElementById('memberName').value.trim();
        const role = document.getElementById('memberRole').value.trim();

        if (!name) {
            this.showMessage('Please enter a member name.', 'error');
            return;
        }

        // Check for duplicate names
        if (this.members.some(member => member.name.toLowerCase() === name.toLowerCase())) {
            this.showMessage('A member with this name already exists.', 'error');
            return;
        }

        const newMember = {
            id: Date.now().toString(),
            name: name,
            role: role,
            dateAdded: new Date().toISOString()
        };

        this.members.push(newMember);
        this.saveData('teamMembers', this.members);
        this.renderAttendanceTable();
        this.updateStats();
        this.renderSummaryTable();
        this.hideAddMemberModal();
        this.showMessage(`${name} has been added to the team.`, 'success');
    }

    editMember(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (member) {
            document.getElementById('editMemberId').value = member.id;
            document.getElementById('editMemberName').value = member.name;
            document.getElementById('editMemberRole').value = member.role || '';
            this.showEditMemberModal();
        }
    }

    updateMember() {
        const memberId = document.getElementById('editMemberId').value;
        const name = document.getElementById('editMemberName').value.trim();
        const role = document.getElementById('editMemberRole').value.trim();

        if (!name) {
            this.showMessage('Please enter a member name.', 'error');
            return;
        }

        // Check for duplicate names (excluding current member)
        if (this.members.some(member => member.id !== memberId && member.name.toLowerCase() === name.toLowerCase())) {
            this.showMessage('A member with this name already exists.', 'error');
            return;
        }

        const memberIndex = this.members.findIndex(m => m.id === memberId);
        if (memberIndex !== -1) {
            this.members[memberIndex].name = name;
            this.members[memberIndex].role = role;
            this.saveData('teamMembers', this.members);
            this.renderAttendanceTable();
            this.renderSummaryTable();
            this.hideEditMemberModal();
            this.showMessage(`${name}'s information has been updated.`, 'success');
        }
    }

    deleteMember(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (member && confirm(`Are you sure you want to delete ${member.name}? This will also remove all their attendance records.`)) {
            this.members = this.members.filter(m => m.id !== memberId);
            
            // Remove all attendance records for this member
            Object.keys(this.attendance).forEach(date => {
                if (this.attendance[date][memberId]) {
                    delete this.attendance[date][memberId];
                }
            });

            this.saveData('teamMembers', this.members);
            this.saveData('attendanceData', this.attendance);
            this.renderAttendanceTable();
            this.updateStats();
            this.renderSummaryTable();
            this.showMessage(`${member.name} has been removed from the team.`, 'success');
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
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No team members added yet</h3>
                        <p>Click "Add Member" to start tracking attendance</p>
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
                                onchange="app.updateAttendance('${member.id}', 'status', this.value)">
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
                                        onclick="app.checkIn('${member.id}')">
                                    <i class="fas fa-sign-in-alt"></i> Quick Check In
                                </button>
                                <input type="time" class="time-input" 
                                       value="${attendance.checkInTime}"
                                       onchange="app.updateAttendance('${member.id}', 'checkInTime', this.value)"
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
                                        onclick="app.checkOut('${member.id}')">
                                    <i class="fas fa-sign-out-alt"></i> Quick Check Out
                                </button>
                                <input type="time" class="time-input" 
                                       value="${attendance.checkOutTime}"
                                       onchange="app.updateAttendance('${member.id}', 'checkOutTime', this.value)"
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
                               onchange="app.updateAttendance('${member.id}', 'notes', this.value)">
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-warning btn-small tooltip" 
                                    onclick="app.editMember('${member.id}')">
                                <i class="fas fa-edit"></i>
                                <span class="tooltiptext">Edit Member</span>
                            </button>
                            <button class="btn btn-danger btn-small tooltip" 
                                    onclick="app.deleteMember('${member.id}')">
                                <i class="fas fa-trash"></i>
                                <span class="tooltiptext">Delete Member</span>
                            </button>
                        </div>
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

    renderSummaryTable() {
        const tbody = document.getElementById('summaryTableBody');
        const currentMonth = new Date(this.currentDate).getMonth();
        const currentYear = new Date(this.currentDate).getFullYear();

        if (this.members.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <p>No data available for summary</p>
                    </td>
                </tr>
            `;
            return;
        }

        const summary = this.members.map(member => {
            let presentDays = 0;
            let totalDays = 0;

            // Count attendance for current month
            Object.keys(this.attendance).forEach(date => {
                const attendanceDate = new Date(date);
                if (attendanceDate.getMonth() === currentMonth && 
                    attendanceDate.getFullYear() === currentYear) {
                    totalDays++;
                    const status = this.attendance[date][member.id]?.status || 'present';
                    if (status === 'present' || status === 'late') {
                        presentDays++;
                    }
                }
            });

            const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '100.0';
            const absentDays = totalDays - presentDays;

            return {
                name: member.name,
                role: member.role,
                presentDays,
                absentDays,
                attendancePercentage: parseFloat(attendancePercentage)
            };
        });

        tbody.innerHTML = summary.map(item => `
            <tr>
                <td>
                    <strong>${item.name}</strong>
                    ${item.role ? `<br><small class="text-muted">${item.role}</small>` : ''}
                </td>
                <td><span class="badge badge-success">${item.presentDays}</span></td>
                <td><span class="badge badge-danger">${item.absentDays}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 600; color: ${item.attendancePercentage >= 90 ? '#28a745' : item.attendancePercentage >= 75 ? '#ffc107' : '#dc3545'}">${item.attendancePercentage}%</span>
                        <div style="flex-grow: 1; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${item.attendancePercentage}%; height: 100%; background: ${item.attendancePercentage >= 90 ? '#28a745' : item.attendancePercentage >= 75 ? '#ffc107' : '#dc3545'}; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    exportData() {
        if (this.members.length === 0) {
            this.showMessage('No data to export. Please add team members first.', 'error');
            return;
        }

        try {
            // Prepare data for export
            const exportData = [];
            
            // Get all unique dates
            const allDates = Object.keys(this.attendance).sort();
            
            // Header row
            const headers = ['Team Member', 'Role', ...allDates.map(date => `${date} Status`), 
                           ...allDates.map(date => `${date} Check-in`),
                           ...allDates.map(date => `${date} Check-out`),
                           ...allDates.map(date => `${date} Hours`),
                           'Total Present', 'Total Absent', 'Attendance %'];
            exportData.push(headers);

            // Data rows
            this.members.forEach(member => {
                const row = [member.name, member.role || ''];
                let totalPresent = 0;
                let totalDays = 0;

                // Status columns
                allDates.forEach(date => {
                    const status = this.attendance[date]?.[member.id]?.status || 'present';
                    row.push(status.charAt(0).toUpperCase() + status.slice(1));
                    
                    if (this.attendance[date]?.[member.id]) {
                        totalDays++;
                        if (status === 'present' || status === 'late') {
                            totalPresent++;
                        }
                    }
                });

                // Check-in time columns
                allDates.forEach(date => {
                    const checkInTime = this.attendance[date]?.[member.id]?.checkInTime || '';
                    row.push(checkInTime);
                });

                // Check-out time columns
                allDates.forEach(date => {
                    const checkOutTime = this.attendance[date]?.[member.id]?.checkOutTime || '';
                    row.push(checkOutTime);
                });

                // Working hours columns
                allDates.forEach(date => {
                    const checkInTime = this.attendance[date]?.[member.id]?.checkInTime || '';
                    const checkOutTime = this.attendance[date]?.[member.id]?.checkOutTime || '';
                    const workingHours = this.calculateWorkingHours(checkInTime, checkOutTime);
                    row.push(workingHours);
                });

                const attendancePercentage = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) + '%' : '100%';
                row.push(totalPresent, totalDays - totalPresent, attendancePercentage);
                exportData.push(row);
            });

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(exportData);

            // Auto-size columns
            const range = XLSX.utils.decode_range(ws['!ref']);
            const colWidths = [];
            for (let C = range.s.c; C <= range.e.c; ++C) {
                let maxWidth = 10;
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    const cell = ws[XLSX.utils.encode_cell({r: R, c: C})];
                    if (cell && cell.v) {
                        maxWidth = Math.max(maxWidth, cell.v.toString().length);
                    }
                }
                colWidths.push({wch: Math.min(maxWidth + 2, 50)});
            }
            ws['!cols'] = colWidths;

            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

            // Generate filename with current date
            const today = new Date();
            const filename = `Attendance_Report_${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.xlsx`;

            // Save the file
            XLSX.writeFile(wb, filename);

            this.showMessage('Attendance report exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Error exporting data. Please try again.', 'error');
        }
    }

    showAddMemberModal() {
        document.getElementById('addMemberModal').style.display = 'block';
        document.getElementById('memberName').focus();
        document.getElementById('addMemberForm').reset();
    }

    hideAddMemberModal() {
        document.getElementById('addMemberModal').style.display = 'none';
    }

    showEditMemberModal() {
        document.getElementById('editMemberModal').style.display = 'block';
        document.getElementById('editMemberName').focus();
    }

    hideEditMemberModal() {
        document.getElementById('editMemberModal').style.display = 'none';
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                type === 'warning' ? 'exclamation-circle' : 
                                'exclamation-triangle'}"></i>
            ${message}
        `;

        // Insert after header
        const header = document.querySelector('.header');
        header.parentNode.insertBefore(messageDiv, header.nextSibling);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Backup and restore functionality
    exportBackup() {
        const backup = {
            members: this.members,
            attendance: this.attendance,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importBackup(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                if (backup.members && backup.attendance) {
                    this.members = backup.members;
                    this.attendance = backup.attendance;
                    this.saveData('teamMembers', this.members);
                    this.saveData('attendanceData', this.attendance);
                    this.renderAttendanceTable();
                    this.updateStats();
                    this.renderSummaryTable();
                    this.showMessage('Backup restored successfully!', 'success');
                } else {
                    throw new Error('Invalid backup file format');
                }
            } catch (error) {
                this.showMessage('Error reading backup file. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    showExportMenu() {
        const menu = document.createElement('div');
        menu.className = 'export-menu';
        menu.innerHTML = `
            <div class="export-menu-content">
                <h3><i class="fas fa-download"></i> Export Options</h3>
                <div class="export-buttons">
                    <button class="btn btn-primary" onclick="app.exportTeamData(); app.closeExportMenu();">
                        <i class="fas fa-users"></i> Export Team Data (for users)
                    </button>
                    <button class="btn btn-success" onclick="app.exportData(); app.closeExportMenu();">
                        <i class="fas fa-file-excel"></i> Export Attendance Report
                    </button>
                    <button class="btn btn-warning" onclick="app.importAttendanceData(); app.closeExportMenu();">
                        <i class="fas fa-file-import"></i> Import User Attendance
                    </button>
                    <button class="btn btn-secondary" onclick="app.closeExportMenu();">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Close menu when clicking outside
        setTimeout(() => {
            menu.addEventListener('click', (e) => {
                if (e.target === menu) {
                    this.closeExportMenu();
                }
            });
        }, 100);
    }

    closeExportMenu() {
        const menu = document.querySelector('.export-menu');
        if (menu) {
            menu.remove();
        }
    }

    exportTeamData() {
        if (this.members.length === 0) {
            this.showMessage('No team members to export. Please add team members first.', 'error');
            return;
        }

        try {
            const teamData = {
                members: this.members,
                exportDate: new Date().toISOString(),
                version: '1.0',
                description: 'Team member data for user attendance tracking'
            };

            const dataStr = JSON.stringify(teamData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `team_data_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            this.showMessage('Team data exported successfully! Share this file with users.', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Error exporting team data.', 'error');
        }
    }

    importAttendanceData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (data.attendance) {
                            // Merge attendance data
                            Object.keys(data.attendance).forEach(date => {
                                if (!this.attendance[date]) {
                                    this.attendance[date] = {};
                                }
                                Object.assign(this.attendance[date], data.attendance[date]);
                            });
                            
                            this.saveData('attendanceData', this.attendance);
                            this.renderAttendanceTable();
                            this.updateStats();
                            this.renderSummaryTable();
                            
                            this.showMessage(`Attendance data imported successfully! ${Object.keys(data.attendance).length} day(s) of data merged.`, 'success');
                        } else {
                            throw new Error('Invalid attendance data format');
                        }
                    } catch (error) {
                        console.error('Import error:', error);
                        this.showMessage('Error importing attendance data. Please check the file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
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
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AttendanceTracker();
    
    // Add some sample data if no members exist (for demo purposes)
    if (app.members.length === 0) {
        const sampleMembers = [
            { id: '1', name: 'Vikas Soni', role: 'DDM DevOps Team', dateAdded: new Date().toISOString() },
         
        ];
        
        app.members = sampleMembers;
        app.saveData('teamMembers', app.members);
        app.renderAttendanceTable();
        app.updateStats();
        app.renderSummaryTable();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + M to add member
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        app.showAddMemberModal();
    }
    
    // Ctrl/Cmd + E to export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        app.exportData();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        app.hideAddMemberModal();
        app.hideEditMemberModal();
    }
});

