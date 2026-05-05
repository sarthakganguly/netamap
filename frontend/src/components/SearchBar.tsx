import React from 'react';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, placeholder }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder || "Search..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
    </div>
  );
};
