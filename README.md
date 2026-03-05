# Intelligent Metro Network (Frontend)

Lightweight React + Bootstrap ticket booking UI for the assignment.

## Run Locally

```bash
npm install
npm start
```

## Submission – Optimize File Size

Do not include `node_modules` or `build` in the archive.

Use the helper script:

```bash
npm run zip:submission
# or
bash scripts/prepare_submission.sh Groupname_SubjectCode_Frontend_Code.zip
```

This zips only:
- public/
- src/
- package.json
- package-lock.json
- README.md

Excludes:
- node_modules/
- build/
- .git/ and OS cruft

Recommended report filename:
`Groupname_SubjectCode_Frontend_Report.pdf`

## Tech
- React (Create React App)
- React Router
- Bootstrap / React-Bootstrap
- bootstrap-icons
- qrcode.react
