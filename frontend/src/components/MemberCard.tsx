import React from 'react';
import { Member } from '../types/member';
import { MemberDetails } from './MemberDetails';

interface MemberCardProps {
  member: Member;
  expandedMember?: Member;
  isExpanded: boolean;
  onToggle: (id: number) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, expandedMember, isExpanded, onToggle }) => {
  return (
    <div className="member-card" onClick={() => onToggle(member.mpsno)}>
      <div className="card-compact">
        {member.image ? (
          <img src={`data:image/jpeg;base64,${member.image}`} alt={member.fullName} className="member-photo" />
        ) : (
          <div className="member-photo-placeholder">NA</div>
        )}
        <div className="member-info">
          <h3>{member.fullName}</h3>
          <div className="member-meta">
            <span className="badge badge-party">{member.partySname}</span>
            <span className="badge">{member.constituency}</span>
            <span className="badge">{member.stateName}</span>
          </div>
        </div>
      </div>

      {isExpanded && expandedMember && (
        <MemberDetails member={expandedMember} />
      )}
    </div>
  );
};
