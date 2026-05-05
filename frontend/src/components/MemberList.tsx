import React from 'react';
import { Member } from '../types/member';
import { MemberCard } from './MemberCard';

interface MemberListProps {
  members: Member[];
  detailedData: Record<number, Member>;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
}

export const MemberList: React.FC<MemberListProps> = ({ 
  members, 
  detailedData, 
  expandedId, 
  onToggleExpand 
}) => {
  return (
    <main className="member-list">
      {members.map((m) => (
        <MemberCard
          key={m.mpsno}
          member={m}
          expandedMember={detailedData[m.mpsno]}
          isExpanded={expandedId === m.mpsno}
          onToggle={onToggleExpand}
        />
      ))}
    </main>
  );
};
