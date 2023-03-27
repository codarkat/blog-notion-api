## NOTION API + NEXTJS

Documentation: https://developers.notion.com/reference/intro

1. Notion DB Properties

![Notion DB Properties](/public/images/notion-db-properties.png)

2. Copy file .env.example to .env and update

```bash
NOTION_SECRET=
DATABASE_NOTES_ID=
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Libraries

```bash
npm i @notionhq/client
npm i slugify
```
