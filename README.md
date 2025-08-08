# Team Attendance Tracker

A modern, Excel-like web application for tracking team member attendance with export capabilities and easy team management.

## ⚠️ IMPORTANT: If Attendance Data Is Not Saving

If you're experiencing issues with attendance not saving, this is likely due to browser security restrictions when opening HTML files directly. Here are solutions:

### Solution 1: Use Local HTTP Server (Recommended)
1. **Python Method**: Double-click `start-server.bat` or run `python server.py` in this folder
2. **Node.js Method**: Run `npx serve .` in this folder  
3. **VS Code Method**: Install "Live Server" extension, right-click `index.html` → "Open with Live Server"

### Solution 2: Use Firefox Browser
Firefox generally has better support for localStorage with local files.

### Solution 3: Check Browser Console
Press F12 → Console tab to see if there are any error messages about localStorage.

---

## 🌟 Features

### Core Functionality
- **Excel-like Interface**: Familiar spreadsheet-style layout for easy adoption
- **Real-time Tracking**: Mark attendance as Present, Absent, or Late with automatic timestamps
- **Team Management**: Add, edit, and delete team members with role assignments
- **Date Navigation**: Easily switch between dates to view/edit historical attendance
- **Notes System**: Add contextual notes for each attendance record

### Export & Reporting
- **Excel Export**: Export complete attendance data to Excel (.xlsx) format
- **Monthly Summary**: Visual dashboard showing attendance percentages and trends
- **Data Persistence**: All data stored locally in browser for offline access
- **Backup/Restore**: Export and import data backups in JSON format

### User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with intuitive controls
- **Keyboard Shortcuts**: Quick access via Ctrl+M (Add Member) and Ctrl+E (Export)
- **Auto-save**: Changes are automatically saved as you type
- **Visual Feedback**: Color-coded status indicators and progress bars

## 🚀 Getting Started

### Installation
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. No additional setup or server required!

### First Use
1. Click "Add Member" to add your first team member
2. Select today's date (or any date) using the date picker
3. Mark attendance status for each member
4. Add check-in times and notes as needed
5. Export your data anytime using the "Export Data" button

## 💻 Usage

### Adding Team Members
- Click the "Add Member" button in the header
- Enter the member's name (required) and role (optional)
- Member will be immediately available for attendance tracking

### Tracking Attendance
- Use the date picker to select the date you want to track
- For each team member, select their status:
  - **Present**: Member is at work (auto-fills current time)
  - **Late**: Member arrived late (auto-fills current time)
  - **Absent**: Member is not present (clears check-in time)
- Add optional notes for context
- All changes are saved automatically

### Managing Team Members
- **Edit**: Click the yellow edit button to modify member name/role
- **Delete**: Click the red delete button to remove a member (confirmation required)
- All attendance history is maintained when editing member details

### Exporting Data
- Click "Export Data" to download an Excel file
- File includes all dates, attendance status, times, and notes
- Includes summary statistics (total present/absent, attendance percentage)
- File is automatically named with current date

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **Storage**: Browser localStorage for data persistence
- **Export**: SheetJS library for Excel file generation
- **Icons**: Font Awesome for UI icons
- **Compatibility**: Works in all modern browsers

### Data Storage
- Team members and attendance data are stored in browser's localStorage
- Data persists between sessions and browser restarts
- No server or internet connection required for basic functionality

### File Structure
```
Attendance_1/
├── index.html          # Main application interface
├── styles.css          # Complete styling and responsive design
├── script.js           # Full application logic and functionality
└── README.md           # This documentation file
```

### Browser Requirements
- Modern browser with ES6 support
- localStorage support
- File API support (for export functionality)
- Recommended: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

## 🎨 Customization

### Styling
The application uses CSS custom properties and can be easily customized:
- Colors and themes can be modified in `styles.css`
- Responsive breakpoints are defined for mobile optimization
- Font Awesome icons can be replaced with custom icons

### Functionality
The modular JavaScript structure allows for easy feature additions:
- Export formats can be extended (CSV, PDF, etc.)
- Additional attendance statuses can be added
- Reporting features can be enhanced
- Integration with external systems is possible

## 🔧 Advanced Features

### Keyboard Shortcuts
- `Ctrl + M` (or `Cmd + M` on Mac): Add new member
- `Ctrl + E` (or `Cmd + E` on Mac): Export data
- `Escape`: Close any open modal

### Data Backup
While the application automatically saves data locally, you can:
- Export data regularly as Excel files for backup
- Use browser export/import bookmarks to transfer data
- Copy localStorage data for advanced backup scenarios

## 📱 Mobile Support

The application is fully responsive and touch-friendly:
- Optimized layouts for phones and tablets
- Touch-friendly buttons and form controls
- Swipe-friendly table navigation
- Mobile-optimized modals and forms

## 🤝 Sharing

This application can be easily shared with your team:
- **File Sharing**: Send the entire folder via email or cloud storage
- **Web Hosting**: Upload to any web server or cloud hosting service
- **Local Network**: Serve from a local web server for team access
- **USB Drive**: Carry on a portable drive for offline use

## 🆘 Troubleshooting

### Common Issues
1. **Data not saving**: Ensure localStorage is enabled in your browser
2. **Export not working**: Check if pop-ups are blocked or download location is accessible
3. **Mobile display issues**: Try refreshing the page or clearing browser cache
4. **Missing members**: Check if localStorage data was accidentally cleared

### Browser Support
If you experience issues:
- Try a different modern browser
- Ensure JavaScript is enabled
- Check console for any error messages
- Clear browser cache and reload

---

**Created for easy team attendance tracking with Excel-like functionality and modern web technologies.**
