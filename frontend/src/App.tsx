import React, { useState, useEffect } from 'react';
import './App.css';
import { Member } from './types/member';
import { api } from './services/api';
import { useDebounce } from './hooks/useDebounce';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { MemberList } from './components/MemberList';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detailedData, setDetailedData] = useState<Record<number, Member>>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length > 1) {
        try {
          const data = await api.searchMembers(debouncedQuery);
          setResults(data);
        } catch (err) {
          console.error('Search failed', err);
        }
      } else {
        setResults([]);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    if (!detailedData[id]) {
      try {
        const data = await api.getMemberDetails(id);
        setDetailedData(prev => ({ ...prev, [id]: data }));
      } catch (err) {
        console.error('Failed to fetch details', err);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <SearchBar 
        query={query} 
        setQuery={setQuery} 
        placeholder="Search by name or constituency..." 
      />

      <MemberList 
        members={results} 
        detailedData={detailedData} 
        expandedId={expandedId} 
        onToggleExpand={toggleExpand} 
      />
    </div>
  );
}

export default App;
