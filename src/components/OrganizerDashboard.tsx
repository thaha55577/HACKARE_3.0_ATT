import React, { useState, useEffect, useRef } from 'react';
import { Users, Download, LogOut, UserCheck, Hash, AlertCircle, ScanLine, Clock } from 'lucide-react';
import { User as UserType, AttendanceRecord, Session } from '../types';
import AttendanceTable from './AttendanceTable';
import QRScanner from './QRScanner';
import { db } from '../firebase';
import { ref, onValue, set, Unsubscribe } from 'firebase/database';

// Resolve base URL safely (cast import.meta to any to avoid TS errors in environments missing vite types)
const BASE_URL = ((import.meta as any).env && (import.meta as any).env.BASE_URL) || '/';

// ... (keep the parseCSV function as it is)
const parseCSV = (csvText: string): Omit<AttendanceRecord, 'session1' | 'session2' | 'session3' | 'lastUpdated' | 'userId'>[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const regNoIndex = headers.indexOf('regno');
  const nameIndex = headers.indexOf('name');
  const emailIndex = headers.indexOf('email');
  const teamIndex = headers.indexOf('team');
  if (regNoIndex === -1) {
    console.error("CSV Parse Error: 'RegNo' header not found.");
    return [];
  }
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return {
      regNo: values[regNoIndex] || '',
      name: values[nameIndex] || '',
      email: values[emailIndex] || '',
      team: values[teamIndex] || '',
    };
  }).filter(p => p.regNo);
};


interface OrganizerDashboardProps {
  user: UserType;
  onLogout: () => void;
}

const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ user, onLogout }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [sessions] = useState<Session[]>([]);
  const [manualRegNo, setManualRegNo] = useState('');
  const [selectedSession, setSelectedSession] = useState(1);
  const [manualEntryMessage, setManualEntryMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [exportSession, setExportSession] = useState(1);
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'table'>('scan');
  
  // Refs to control the scanner component
  const scannerStartRef = useRef<() => void>(() => {});
  const scannerStopRef = useRef<() => void>(() => {});

  useEffect(() => {
    // ... (keep the useEffect for firebase data loading as it is)
    const attendanceRef = ref(db, 'attendance');
    const unsubscribe: Unsubscribe = onValue(attendanceRef, (snapshot) => {
      const dbData = snapshot.val();
      if (dbData) {
        setAttendanceRecords(Object.values(dbData) as AttendanceRecord[]);
      } else {
        loadFromCSVAndSeedDatabase();
      }
    });
    const loadFromCSVAndSeedDatabase = async () => {
      try {
	const response = await fetch(`${BASE_URL}Participants.csv`);
        if (!response.ok) return;
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        if (parsedData.length > 0) {
          const participants = parsedData.map(p => ({
            ...p, userId: p.regNo,
            session1: false, session2: false, session3: false,
            lastUpdated: new Date().toISOString()
          }));
          await set(attendanceRef, participants);
        }
      } catch (error) {
        console.error('Error loading from CSV:', error);
      }
    };
    return () => unsubscribe();
  }, []);

  const handleScan = (scannedText: string) => {
    if (isProcessingScan) return;
    setIsProcessingScan(true);

    const participant = attendanceRecords.find(p => p.regNo === scannedText.trim());
    if (!participant) {
      setScanResult({ type: 'error', text: `Participant with ID "${scannedText}" not found.` });
    } else {
      const sessionKey = `review${selectedSession}` as keyof AttendanceRecord;
      if (participant[sessionKey] === true) {
        setScanResult({ type: 'warning', text: `${participant.name} is already marked as PRESENT.` });
      } else {
        // This is a successful scan
        scannerStopRef.current(); // Stop the scanner
        handleAttendanceUpdate(participant.userId, selectedSession, true);
        setScanResult({ type: 'success', text: `Success! ${participant.name} marked PRESENT.` });
      }
    }
    
    // Timer to clear message and restart scanner
    setTimeout(() => {
      setScanResult(null);
      setIsProcessingScan(false);
      // Restart scanner only if the tab is still active and there was a success/warning
      if (activeTab === 'scan' && (!participant || participant[`review${selectedSession}` as keyof AttendanceRecord] !== true)) {
          scannerStartRef.current();
      }
    }, 4000);
  };

  // ... (keep handleAttendanceUpdate, handleManualEntry, exportToCSV functions as they are)
  const handleAttendanceUpdate = async (userId: string, session: number, present: boolean) => {
    try {
      let recordIndex = -1;
      const recordToUpdate = attendanceRecords.find((record, index) => {
        if (record.userId === userId) {
          recordIndex = index;
          return true;
        }
        return false;
      });
      if (recordIndex !== -1 && recordToUpdate) {
        const updatedRecord = { ...recordToUpdate };
        switch (session) {
          case 1:
            updatedRecord.session1 = present;
            updatedRecord.session1_markedBy = present ? user.email : undefined;
            break;
          case 2:
            updatedRecord.session2 = present;
            updatedRecord.session2_markedBy = present ? user.email : undefined;
            break;
          case 3:
            updatedRecord.session3 = present;
            updatedRecord.session3_markedBy = present ? user.email : undefined;
            break;
        }
        updatedRecord.lastUpdated = new Date().toISOString();
        const recordRef = ref(db, `attendance/${recordIndex}`);
        await set(recordRef, updatedRecord);
      }
    } catch (error) {
      console.error('Error updating attendance record:', error);
    }
  };
  
  const handleManualEntry = () => {
    setManualEntryMessage(null);
    if (!manualRegNo.trim()) {
      setManualEntryMessage({ type: 'error', text: 'Registration No. cannot be empty.' });
      return;
    }
    const participant = attendanceRecords.find(record => record.regNo.toLowerCase() === manualRegNo.trim().toLowerCase());
    if (participant) {
      const sessionKey = `review${selectedSession}` as keyof AttendanceRecord;
      if (participant[sessionKey] === true) {
        setManualEntryMessage({ type: 'error', text: `${participant.name} is already marked as PRESENT.` });
        return;
      }
      handleAttendanceUpdate(participant.userId, selectedSession, true);
      setManualEntryMessage({ type: 'success', text: `Success! ${participant.name} marked PRESENT.` });
      setManualRegNo('');
    } else {
      setManualEntryMessage({ type: 'error', text: `Participant with ID "${manualRegNo}" not found.` });
    }
  };

  const exportToCSV = () => {
    const sessionStatusKey = `session${exportSession}` as keyof AttendanceRecord;
    const markedByKey = `session${exportSession}_markedBy` as keyof AttendanceRecord;
		// Export all members (present and absent) for the selected session
		const headers = ['Registration_No', 'Name', 'Email', 'Team', `session${exportSession}_Status`, 'Marked_By', 'Last_Updated'];
		const sessionRows = attendanceRecords.map(record => {
			const status = record[sessionStatusKey] === true ? 'Present' : 'Absent';
			return [
				record.regNo,
				`"${record.name}"`,
				record.email,
				`"${record.team}"`,
				status,
				(record[markedByKey] as string | undefined) || 'N/A',
				new Date(record.lastUpdated).toLocaleString()
			].join(',');
		});
		if (sessionRows.length === 0) {
			alert('No participant records available to export.');
			return;
		}
		const csvContent = [headers.join(','), ...sessionRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hack-heist-review${exportSession}-attendance-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click();
    window.URL.revokeObjectURL(url); document.body.removeChild(a);
  };

	const exportAllSessionsToCSV = () => {
		// Export every participant with status for all three sessions
		if (attendanceRecords.length === 0) {
			alert('No participant records available to export.');
			return;
		}
		const headers = ['Registration_No', 'Name', 'Email', 'Team', 'session1_Status', 'session1_MarkedBy', 'session2_Status', 'session2_MarkedBy', 'session3_Status', 'session3_MarkedBy', 'Last_Updated'];
		const rows = attendanceRecords.map(record => {
			const s1 = record.session1 ? 'Present' : 'Absent';
			const s2 = record.session2 ? 'Present' : 'Absent';
			const s3 = record.session3 ? 'Present' : 'Absent';
			return [
				record.regNo,
				`"${record.name}"`,
				record.email,
				`"${record.team}"`,
				s1,
				(record.session1_markedBy as string | undefined) || 'N/A',
				s2,
				(record.session2_markedBy as string | undefined) || 'N/A',
				s3,
				(record.session3_markedBy as string | undefined) || 'N/A',
				new Date(record.lastUpdated).toLocaleString()
			].join(',');
		});

		const csvContent = [headers.join(','), ...rows].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `hack-heist-all-sessions-attendance-${new Date().toISOString().split('T')[0]}.csv`;
		document.body.appendChild(a); a.click();
		window.URL.revokeObjectURL(url); document.body.removeChild(a);
	};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gfg-gradient-start to-gfg-gradient-end font-body">
      {/* ... (keep the entire JSX return statement as it is, from the header down to the closing div) */}
      <div className="bg-gfg-card-bg border-b border-gfg-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
					<div className="flex items-center space-x-3">
							{/* small logo beside title */}
							<img src={`${BASE_URL}ACM_LOGO.png`} alt="HACKARE logo" className="w-10 h-10 rounded-full object-cover" />
							<div>
								<h1 className="text-xl font-bold text-gfg-text-light font-heading tracking-wider">HACKARE 3.0</h1>
								{/* subtitle removed/merged into title as requested */}
							</div>
						</div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <div className="text-gfg-text-dark">Logged in as</div>
                <div className="text-gfg-text-light">{user.name || user.email.split('@')[0]}</div>
              </div>
              <button onClick={onLogout} className="flex items-center space-x-2 text-gfg-text-dark hover:text-gfg-gold transition-colors uppercase font-body">
                <LogOut className="w-4 h-4" /> <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6 p-4 bg-gfg-card-bg rounded-lg border border-gfg-border flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center text-lg font-semibold text-gfg-text-light font-heading">
                <Clock className="w-5 h-5 mr-3 text-gfg-gold" />
                <span className="tracking-wider">Select Session:</span>
            </div>
            <select
                id="session" value={selectedSession}
                onChange={(e) => setSelectedSession(Number(e.target.value))}
                className="w-full sm:w-auto px-4 py-2 bg-gfg-dark-bg border border-gfg-border rounded-lg text-gfg-text-light focus:border-gfg-gold focus:ring-1 focus:ring-gfg-gold outline-none"
            >
                <option value={1}>Session 1</option>
                <option value={2}>Session 2</option>
                <option value={3}>Session 3</option>
            </select>
        </div>
        <div className="border-b border-gfg-border mb-6">
          <nav className="-mb-px flex space-x-6 font-heading" aria-label="Tabs">
            <button onClick={() => setActiveTab('scan')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider ${activeTab === 'scan' ? 'border-gfg-gold text-gfg-gold' : 'border-transparent text-gfg-text-dark hover:text-gfg-text-light'}`}>
              Identity Scan
            </button>
            <button onClick={() => setActiveTab('manual')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider ${activeTab === 'manual' ? 'border-gfg-gold text-gfg-gold' : 'border-transparent text-gfg-text-dark hover:text-gfg-text-light'}`}>
              Manual Entry
            </button>
            <button onClick={() => setActiveTab('table')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider ${activeTab === 'table' ? 'border-gfg-gold text-gfg-gold' : 'border-transparent text-gfg-text-dark hover:text-gfg-text-light'}`}>
              Attendance Table
            </button>
          </nav>
        </div>
        {activeTab === 'scan' && (
          <div className="-mt-6">
            <QRScanner 
              key={selectedSession} 
              onScan={handleScan} 
              scanResult={scanResult}
              startScanner={() => scannerStartRef.current()}
              stopScanner={() => scannerStopRef.current()}
            />
          </div>
        )}
        
        {activeTab === 'manual' && (
          <div>
            <div className="max-w-md bg-gfg-card-bg rounded-lg border border-gfg-border p-6 h-fit">
              <h3 className="text-gfg-text-light font-bold text-lg mb-4 flex items-center font-heading uppercase tracking-wider"><Hash className="w-5 h-5 mr-2 text-gfg-gold" />Manual Attendance</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="regNo" className="block text-sm font-body font-medium text-gfg-text-dark mb-2">Registration No.</label>
                  <input type="text" id="regNo" value={manualRegNo} onChange={(e) => setManualRegNo(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()} className="w-full px-3 py-2 bg-gfg-dark-bg border border-gfg-border rounded-lg text-gfg-text-light" placeholder="Enter Registration No."/>
                </div>
                <button onClick={handleManualEntry} className="w-full bg-gfg-dark-bg border hover:bg-gfg-dark-hover text-gfg-text-dark py-3 px-4 rounded-lg font-bold font-heading flex items-center justify-center uppercase tracking-wider">
                  <UserCheck className="w-5 h-5 mr-2" /> Mark Present
                </button>
                {manualEntryMessage && <div className={`flex items-start space-x-2 p-3 rounded-lg border ${manualEntryMessage.type === 'success' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-gfg-gold bg-gfg-gold/10 border-gfg-gold/20'}`}><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span className="text-sm font-body">{manualEntryMessage.text}</span></div>}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'table' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gfg-text-light font-heading tracking-wider">Attendance Records</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
							<select value={exportSession} onChange={(e) => setExportSession(Number(e.target.value))} className="px-3 py-2 bg-gfg-card-bg border border-gfg-border rounded-lg text-gfg-text-white focus:border-gfg-gold focus:ring-1 focus:ring-gfg-gold outline-none font-body">
					<option value={1}>Export session 1</option><option value={2}>Export session 2</option><option value={3}>Export session 3</option>
				</select>
				<div className="flex gap-2 w-full sm:w-auto">
					<button onClick={exportToCSV} className="flex-1 flex items-center justify-center space-x-2 bg-gfg-light-bg border hover:bg-gfg-gold-hover text-gfg-white-bg px-4 py-2 rounded-lg transition-colors uppercase font-heading"><Download className="w-4 h-4" /><span>Export</span></button>
					<button onClick={exportAllSessionsToCSV} className="flex-1 flex items-center justify-center space-x-2 bg-gfg-card-bg border hover:bg-gfg-border text-gfg-text-dark px-4 py-2 rounded-lg transition-colors uppercase font-heading">
						<Download className="w-4 h-4" />
						<span>Export All Sessions</span>
					</button>
				</div>
              </div>
            </div>
            {attendanceRecords.length === 0 ? <div className="text-center py-10 bg-gfg-card-bg rounded-lg"><p className="text-gfg-text-dark font-body">Loading attendance data...</p></div> : <AttendanceTable records={attendanceRecords} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;