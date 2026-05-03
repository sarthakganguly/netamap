# Sansad Data Schemas

This reference defines the structured key-value pairs for data extracted from sansad.in.

## 1. Member Profile Schema (Exhaustive)
Union of fields from Member List API and Detailed Profile API.

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
| `dob` | String | Date of Birth (DD/MM/YYYY or DD-MMM-YYYY) |
| `birthPlace` | String | Place of Birth |
| `fatherName` | String | Father's Name |
| `motherName` | String | Mother's Name |
| `spouseName` | String | Spouse's Name |
| `marriageDate` | String | Date of Marriage |
| `maritalStatus` | String | Marital Status |
| `numberOfSons` | Integer | Number of Sons |
| `numberOfDaughters`| Integer | Number of Daughters |
| `qualification` | String | Highest Qualification Level |
| `education` | String | Detailed Education (Institutions/Degrees) |
| `mainProfession` | String | Primary Profession |
| `otherProfession` | String | Secondary/Other Profession |
| `email` | String/List | Email addresses (may contain HTML or list) |
| `personalPhone` | String | Mobile/Personal phone number |
| `delhiPhone` | String | Delhi Office phone number |
| `presentAddress` | String | Delhi/Present address |
| `permanentAddress`| String | Permanent/Home address |
| `permanentLaddr` | String | Permanent address PIN/Postal code |
| `photoUrl` | String | URL to the member's photo |
| `image` | String | **[Custom Field]** Base64 encoded profile image |
| `facebook` | String | Facebook profile URL |
| `twitter` | String | Twitter/X profile URL |
| `instagram` | String | Instagram profile URL |
| `pinterest` | String | Pinterest profile URL |
| `linkedIn` | String | LinkedIn profile URL |
| `booksPublished` | String | List of books published |
| `literary` | String | Literary activities |
| `social` | String | Social and Cultural activities |
| `interest` | String | Special interests |
| `hobbies` | String | Hobbies |
| `sports` | String | Sports and Clubs |
| `countriesVisited` | String | Countries visited |
| `otherInfo` | String | Miscellaneous/Additional information |
| `freedom` | String | Freedom Fighter status (Y/N) |
| `icNo` | Integer | Identity Card/Internal reference number |
| `pan_number` | String | **[Custom Field]** Permanent Account Number |
| `createdAt` | String | Record creation timestamp |
| `updatedAt` | String | Record last update timestamp |

## 2. Party Statistics Schema
Aggregate representation in the 18th Lok Sabha.

| Key | Type | Description |
| :--- | :--- | :--- |
| `partyFname` | String | Official English Name |
| `partyName` | String | Name in Regional Language |
| `partySname` | String | Abbreviation |
| `count` | Integer | Total sitting members |

## 3. Parliamentary Terms Schema
Glossary of legislative terminology.

| Key | Type | Description |
| :--- | :--- | :--- |
| `term_id` | Integer | Unique term ID |
| `title` | String | The term/phrase |
| `description` | String | Official definition |
| `letter` | String | Alphabetical category |
