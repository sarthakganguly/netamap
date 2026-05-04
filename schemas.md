# Project Data Schemas

This document centralizes the schemas for all data extracted and stored in the NetaMap project.

---

## 1. Sansad (Existing)

Data extracted from `sansad.in`.

### Member Profile Schema
| Key | Type | Description |
| :--- | :--- | :--- |
| `mpsno` | Integer | Unique Member ID |
| `initial` | String | Title (e.g., Shri, Smt.) |
| `firstName` | String | First Name |
| `lastName` | String | Last Name |
| `fullName` | String | Full Name (Title + First + Last) |
| `gender` | String | MALE/FEMALE |
| `partyFname` | String | Political Party Full Name |
| `partySname` | String | Political Party Abbreviation |
| `constituency` | String | Constituency Name |
| `stateName` | String | State/UT Name |
| `stateCode` | String | State/UT Two-letter Code |
| `status` | String | Membership Status (e.g., Sitting) |
| `lastLoksabha` | Integer | Most recent Lok Sabha term |
| `lsExpr` | String | Lok Sabha Term Expression (e.g., "18") |
| `noOfTerms` | Integer | Total number of terms served |
| `age` | Integer | Age of the member |
| `dob` | String | Date of Birth |
| `birthPlace` | String | Place of Birth |
| `fatherName` | String | Father's Name |
| `motherName` | String | Mother's Name |
| `spouseName` | String | Spouse's Name |
| `marriageDate` | String | Date of Marriage |
| `maritalStatus` | String | Marital Status |
| `numberOfSons` | Integer | Number of Sons |
| `numberOfDaughters`| Integer | Number of Daughters |
| `qualification` | String | Highest Qualification Level |
| `education` | String | Detailed Education |
| `mainProfession` | String | Primary Profession |
| `otherProfession` | String | Secondary/Other Profession |
| `email` | String | Email addresses |
| `personalPhone` | String | Mobile/Personal phone number |
| `delhiPhone` | String | Delhi Office phone number |
| `presentAddress` | String | Delhi/Present address |
| `permanentAddress`| String | Permanent/Home address |
| `permanentLaddr` | String | Permanent address PIN/Postal code |
| `photoUrl` | String | URL to the member's photo |
| `image` | String | Base64 encoded profile image |
| `facebook` | String | Facebook URL |
| `twitter` | String | Twitter/X URL |
| `instagram` | String | Instagram URL |
| `pinterest` | String | Pinterest URL |
| `linkedIn` | String | LinkedIn URL |
| `booksPublished` | String | Books published |
| `literary` | String | Literary activities |
| `social` | String | Social and Cultural activities |
| `interest` | String | Special interests |
| `hobbies` | String | Hobbies |
| `sports` | String | Sports and Clubs |
| `countriesVisited` | String | Countries visited |
| `otherInfo` | String | Miscellaneous info |
| `freedom` | String | Freedom Fighter status |
| `icNo` | Integer | Identity Card number |
| `pan_number` | String | Permanent Account Number |
| `createdAt` | String | Record creation timestamp |
| `updatedAt` | String | Record last update timestamp |

### Party Statistics Schema
| Key | Type | Description |
| :--- | :--- | :--- |
| `partyFname` | String | Official English Name |
| `partyName` | String | Name in Regional Language |
| `partySname` | String | Abbreviation |
| `count` | Integer | Total sitting members |

### Parliamentary Terms Schema
| Key | Type | Description |
| :--- | :--- | :--- |
| `term_id` | Integer | Unique term ID |
| `title` | String | The term/phrase |
| `description` | String | Official definition |
| `letter` | String | Alphabetical category |

---

## 2. ECI Candidate Profile (New)

Schema for parsing the candidate profile HTML page from `affidavit.eci.gov.in`.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ECIDomScrapeProfile",
  "description": "Schema for parsing the candidate profile HTML page from the ECI portal.",
  "type": "object",
  "properties": {
    "election_details": {
      "type": "object",
      "properties": {
        "state": { "type": "string" },
        "assembly_constituency": { "type": "string" },
        "party_name_en": { "type": "string" },
        "party_name_local": { "type": "string" }
      }
    },
    "nomination_metadata": {
      "type": "object",
      "properties": {
        "application_uploaded_date": { "type": "string" },
        "current_status": { "type": "string", "enum": ["Accepted", "Rejected", "Withdrawn", "Pending"] }
      }
    },
    "candidate_personal_details": {
      "type": "object",
      "properties": {
        "name_en": { "type": "string" },
        "name_local": { "type": "string" },
        "relative_name_en": { "type": "string", "description": "Father's or Husband's name" },
        "relative_name_local": { "type": "string" },
        "gender": { "type": "string" },
        "age": { "type": "integer" },
        "address": { "type": "string" },
        "profile_image_url": { "type": "string", "format": "uri" }
      }
    },
    "affidavit_metadata": {
      "type": "object",
      "properties": {
        "uploaded_on": { "type": "string" },
        "download_count": { "type": "integer" },
        "encrypted_pdf_url_payload": { "type": "string", "description": "Base64 encoded payload for the PDF download request" }
      }
    }
  },
  "required": [
    "election_details",
    "nomination_metadata",
    "candidate_personal_details"
  ]
}
```

---

## 3. Electoral Affidavit (New)

Schema for parsing Indian Election Commission Form 26 Affidavits (scanned PDFs).

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ElectoralAffidavitForm26",
  "description": "Schema for parsing Indian Election Commission Form 26 Affidavits",
  "type": "object",
  "properties": {
    "document_metadata": {
      "type": "object",
      "properties": {
        "form_type": { "type": "string", "default": "Form 26" },
        "date_of_filing": { "type": "string", "format": "date" },
        "notary_details": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "registration_number": { "type": "string" },
            "valid_upto": { "type": "string", "format": "date" }
          }
        }
      }
    },
    "election_details": {
      "type": "object",
      "properties": {
        "house_name": { "type": "string" },
        "constituency_number": { "type": "integer" },
        "constituency_name": { "type": "string" },
        "party_affiliation": { "type": "string" }
      }
    },
    "candidate_details": {
      "type": "object",
      "properties": {
        "full_name": { "type": "string" },
        "relative_type": { "type": "string", "enum": ["son", "daughter", "wife"] },
        "relative_name": { "type": "string" },
        "age": { "type": "integer" },
        "address": {
          "type": "object",
          "properties": {
            "village_po": { "type": "string" },
            "police_station": { "type": "string" },
            "district": { "type": "string" },
            "state": { "type": "string" },
            "pincode": { "type": "string" }
          }
        },
        "contact_info": {
          "type": "object",
          "properties": {
            "mobile": { "type": "string" },
            "email": { "type": "string", "format": "email" },
            "social_media": { "type": "array", "items": { "type": "string" } }
          }
        },
        "electoral_roll_info": {
          "type": "object",
          "properties": {
            "state": { "type": "string" },
            "serial_number": { "type": "integer" },
            "part_number": { "type": "integer" }
          }
        },
        "tax_details": {
          "type": "object",
          "properties": {
            "pan_number": { "type": "string" },
            "last_return_filed_year": { "type": "string" },
            "total_income_shown": { "type": "string" }
          }
        }
      }
    },
    "legal_records": {
      "type": "object",
      "properties": {
        "pending_criminal_cases": {
          "type": "boolean"
        },
        "convictions": {
          "type": "boolean"
        }
      }
    },
    "financial_declarations": {
      "type": "object",
      "properties": {
        "assets": {
          "type": "object",
          "properties": {
            "movable": {
              "type": "object",
              "properties": {
                "cash_in_hand": { "type": "number" },
                "bank_deposits": { "type": "number" },
                "gross_total_value": { "type": "number" }
              }
            },
            "immovable": {
              "type": "object",
              "properties": {
                "total_value": { "type": "number" }
              }
            }
          }
        },
        "liabilities": {
          "type": "object",
          "properties": {
            "bank_dues": { "type": "number" },
            "government_dues": { "type": "number" },
            "disputed_liabilities": { "type": "number" }
          }
        }
      }
    },
    "education": {
      "type": "object",
      "properties": {
        "highest_qualification": { "type": "string" },
        "year_completed": { "type": "integer" },
        "institution": { "type": "string" },
        "board_university": { "type": "string" }
      }
    }
  },
  "required": ["candidate_details", "election_details", "financial_declarations"]
}
```
