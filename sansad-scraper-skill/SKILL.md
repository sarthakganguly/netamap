---
name: sansad-scraper-skill
description: Specialized skill for crawling and extracting structured data from the Sansad.in portal (Lok Sabha). Handles member profiles, party statistics, and parliamentary terminology using direct API interactions.
---

# Sansad Scraper Skill

This skill provides the procedural logic and schemas required to extract high-fidelity data from the Digital Sansad portal.

## Extraction Workflow

### 1. Header Requirements
All requests must include browser-mimicking headers to bypass security filters:
- `User-Agent`: Recent Chrome/Edge string.
- `Referer`: `https://sansad.in/ls/members`
- `Accept`: `application/json`

### 2. Data Endpoints
- **Party Stats**: `https://sansad.in/api_ls/member/partyWiseRepresentation?loksabha=18`
- **Member List**: `https://sansad.in/api_ls/member?loksabha=18&sitting=1`
- **Detailed Profile**: `https://sansad.in/api_ls/member/{mpsno}`
- **Parliamentary Terms**: `https://sansad.in/cms/ls-pp/api/about-parliamentary-terms?locale=en&pagination[limit]=1000`

### 3. Normalization Logic
When extracting member profiles:
1. Fetch the list to get all `mpsno`.
2. For each `mpsno`, fetch the detailed profile.
3. Map fields according to `references/schemas.md`.
4. Add a null/empty `pan_number` field for future enrichment.

## Reference Material
- See [schemas.md](references/schemas.md) for field definitions and types.
