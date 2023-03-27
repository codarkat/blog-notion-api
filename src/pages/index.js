import { Client } from "@notionhq/client";
import Link from "next/link";
import slugify from "slugify";

const TITLE_PROPERTY = "Title";
const DESCRIPTION_PROPERTY = "Description";
const KEYWORDS_PROPERTY = "Keywords";
const AUTHOR_PROPERTY = "Author";
const CATEGORY_PROPERTY = "Category";
const PUBLISHED_PROPERTY = "Published";
const LAST_UPDATED_PROPERTY = "Last updated";
const CREATED_TIME_PROPERTY = "Created time";

const Note = ({ notes, data }) => {
  console.log(data);
  return notes.map((note) => (
    <p key={note}>
      <Link href={`/${slugify(note).toLowerCase()}`}>
        <a>{note}</a>
      </Link>
    </p>
  ));
};

export const getStaticProps = async () => {
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  });

  const data = await notion.databases.query({
    database_id: process.env.DATABASE_NOTES_ID,
    filter: {
      property: PUBLISHED_PROPERTY,
      checkbox: {
        equals: true,
      },
    },
  });

  const notes = [];

  data.results.forEach((result) => {
    notes.push(result.properties[TITLE_PROPERTY].title[0].plain_text);
  });
  return {
    props: {
      notes,
      data,
    },
  };
};
export default Note;
