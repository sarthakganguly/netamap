import React from 'react';
import type { Member } from '../types/member';

interface MemberDetailsProps {
  member: Member;
}

export const MemberDetails: React.FC<MemberDetailsProps> = ({ member: d }) => {
  const renderDetail = (label: string, value: any, isHtml = false) => {
    if (!value || value === 'null' || value === '') return null;
    return (
      <div className="detail-item">
        <span className="detail-label">{label}</span>
        {isHtml ? (
          <span className="detail-value" dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          <span className="detail-value">{String(value)}</span>
        )}
      </div>
    );
  };

  return (
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
  );
};
