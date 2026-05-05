const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  async searchMembers(query: string) {
    const res = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  async getMemberDetails(id: number) {
    const res = await fetch(`${BASE_URL}/api/members/${id}`);
    if (!res.ok) throw new Error('Failed to fetch member details');
    return res.json();
  },

  async getECICandidates() {
    const res = await fetch(`${BASE_URL}/api/eci/candidates`);
    if (!res.ok) throw new Error('Failed to fetch ECI candidates');
    return res.json();
  },

  async getECICandidateDetails(id: number) {
    const res = await fetch(`${BASE_URL}/api/eci/candidates/${id}`);
    if (!res.ok) throw new Error('Failed to fetch ECI candidate details');
    return res.json();
  }
};
