import React, { useState, useEffect } from 'react';
import './App.css';

interface Member {
  mpsno: number;
  initial: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  partyFname: string;
  partySname: string;
  constituency: string;
  stateName: string;
  stateCode: string;
  status: string;
  lastLoksabha: number;
  lsExpr: string;
  noOfTerms: number;
  age: number;
  dob: string;
  birthPlace: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  marriageDate: string;
  maritalStatus: string;
  numberOfSons: number;
  numberOfDaughters: number;
  qualification: string;
  education: string;
  mainProfession: string;
  otherProfession: string;
  email: string;
  personalPhone: string;
  delhiPhone: string;
  presentAddress: string;
  permanentAddress: string;
  photoUrl: string;
  image: string;
  facebook: string;
  twitter: string;
  instagram: string;
  booksPublished: string;
  literary: string;
  social: string;
  interest: string;
  hobbies: string;
  sports: string;
  countriesVisited: string;
  otherInfo: string;
  icNo: number;
  pan_number: string;
}

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detailedData, setDetailedData] = useState<Record<number, Member>>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data);
        } catch (err) {
          console.error('Search failed', err);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    if (!detailedData[id]) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/members/${id}`);
        const data = await res.json();
        setDetailedData(prev => ({ ...prev, [id]: data }));
      } catch (err) {
        console.error('Failed to fetch details', err);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const renderDetail = (label: string, value: any, isHtml = false) => {
    if (!value || value === 'null' || value === '') return null;
    return (
      <div className="detail-item">
        <span className="detail-label">{label}</span>
        {isHtml ? (
          <span className="detail-value" dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          <span className="detail-value">{value}</span>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>NetaMap</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </header>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or constituency..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <main className="member-list">
        {results.map((m) => {
          const d = detailedData[m.mpsno];
          return (
            <div key={m.mpsno} className="member-card" onClick={() => toggleExpand(m.mpsno)}>
              <div className="card-compact">
                {m.image ? (
                  <img src={`data:image/jpeg;base64,${m.image}`} alt={m.fullName} className="member-photo" />
                ) : (
                  <div className="member-photo-placeholder">NA</div>
                )}
                <div className="member-info">
                  <h3>{m.fullName}</h3>
                  <div className="member-meta">
                    <span className="badge badge-party">{m.partySname}</span>
                    <span className="badge">{m.constituency}</span>
                    <span className="badge">{m.stateName}</span>
                  </div>
                </div>
              </div>

              {expandedId === m.mpsno && d && (
                <div className="card-expanded" onClick={(e) => e.stopPropagation()}>
                  
                  <div className="grid-section">
                    <h4>Personal Profile</h4>
                    <div className="details-grid">
                      {renderDetail("Date of Birth", d.dob)}
                      {renderDetail("Place of Birth", d.birthPlace)}
                      {renderDetail("Father's Name", d.fatherName)}
                      {renderDetail("Mother's Name", d.motherName)}
                      {renderDetail("Marital Status", d.maritalStatus)}
                      {renderDetail("Spouse", d.spouseName)}
                      {renderDetail("Marriage Date", d.marriageDate)}
                      {renderDetail("Sons", d.numberOfSons)}
                      {renderDetail("Daughters", d.numberOfDaughters)}
                    </div>
                  </div>

                  <div className="grid-section">
                    <h4>Academic & Professional</h4>
                    <div className="details-grid">
                      {renderDetail("Qualification", d.qualification)}
                      {renderDetail("Education", d.education, true)}
                      {renderDetail("Profession", d.mainProfession)}
                      {renderDetail("Other Interests", d.otherProfession)}
                    </div>
                  </div>

                  <div className="grid-section">
                    <h4>Political Career</h4>
                    <div className="details-grid">
                      {renderDetail("Current Status", d.status)}
                      {renderDetail("Lok Sabha Terms", d.lsExpr)}
                      {renderDetail("Total Terms", d.noOfTerms)}
                      {renderDetail("IC Number", d.icNo)}
                      {renderDetail("State Code", d.stateCode)}
                    </div>
                  </div>

                  <div className="grid-section">
                    <h4>Contact & Reach</h4>
                    <div className="details-grid">
                      {renderDetail("Email", d.email, true)}
                      {renderDetail("Phone", d.personalPhone)}
                      {renderDetail("Delhi Phone", d.delhiPhone)}
                      {renderDetail("Permanent Address", d.permanentAddress)}
                      {renderDetail("Present Address", d.presentAddress)}
                    </div>
                  </div>

                  {(d.social || d.hobbies || d.sports || d.countriesVisited || d.booksPublished) && (
                    <div className="grid-section full-width">
                      <h4>Activities & Interests</h4>
                      <div className="details-grid">
                        {renderDetail("Social Work", d.social)}
                        {renderDetail("Hobbies", d.hobbies)}
                        {renderDetail("Sports", d.sports)}
                        {renderDetail("Countries Visited", d.countriesVisited)}
                        {renderDetail("Books Published", d.booksPublished)}
                        {renderDetail("Literary Work", d.literary)}
                        {renderDetail("Special Interests", d.interest)}
                      </div>
                    </div>
                  )}

                  {d.otherInfo && (
                    <div className="grid-section full-width">
                      <h4>Additional Information</h4>
                      <p className="info-text">{d.otherInfo}</p>
                    </div>
                  )}

                  <div className="grid-section full-width footer-details">
                    <div className="details-grid">
                      {renderDetail("PAN Number", d.pan_number || "Not Available")}
                      {renderDetail("Last Updated", d.updatedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}

export default App;
