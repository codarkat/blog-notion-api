import { Client } from "@notionhq/client";
import slugify from "slugify";

const TITLE_PROPERTY = "Title";
const DESCRIPTION_PROPERTY = "Description";
const KEYWORDS_PROPERTY = "Keywords";
const AUTHOR_PROPERTY = "Author";
const CATEGORY_PROPERTY = "Category";
const PUBLISHED_PROPERTY = "Published";
const LAST_UPDATED_PROPERTY = "Last updated";
const CREATED_TIME_PROPERTY = "Created time";

const Note = ({ note }) => {
  console.log(note.blocks);
  console.log(note.blocks_source);

  return <pre>{JSON.stringify(note, null, 2)}</pre>;
};

export const getServerSideProps = async ({ params: { slug } }) => {
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

  // Return page if slug match
  const page = await data.results.find((result) => {
    if (result.properties[TITLE_PROPERTY].title.length > 0) {
      const { plain_text } = result.properties[TITLE_PROPERTY].title[0];
      const resultSlug = slugify(plain_text).toLowerCase();
      return resultSlug === slug;
    }
    return false;
  });

  // Redirect 404 if slug not match
  if (page == undefined) {
    return {
      notFound: true,
    };
  }

  //Get blocks in page
  const blocks_source = await notion.blocks.children.list({
    block_id: page.id,
  });

  const blocks = blocks_source.results.reduce((results, block) => {
    switch (block.type) {
      case "code":
        getCode(block, results);
        break;
      case "image":
        getImg(block, results);
        break;
      case "paragraph":
        getText(block, results);
        break;
      case "heading_1":
        getText(block, results);
        break;
      case "heading_2":
        getText(block, results);
        break;
      case "heading_3":
        getText(block, results);
        break;
      case "bulleted_list_item":
        getText(block, results);
        break;
      case "numbered_list_item":
        getText(block, results);
        break;
    }
    return results;
  }, []);

  const thumbnail = page.cover[page.cover.type].url;
  const title = page.properties[TITLE_PROPERTY].title[0].plain_text;
  const description =
    page.properties[DESCRIPTION_PROPERTY].rich_text[0].plain_text;
  const { name, avatar_url } = page.properties[AUTHOR_PROPERTY].people[0];
  const author = {
    name: name,
    avatar_url: avatar_url,
  };
  const category = page.properties[CATEGORY_PROPERTY].select.name;
  const keywords = page.properties[KEYWORDS_PROPERTY].multi_select;
  const lastUpdated = page.properties[LAST_UPDATED_PROPERTY].last_edited_time;

  const createdTime = page.properties[CREATED_TIME_PROPERTY].created_time;

  return {
    props: {
      note: {
        title,
        description,
        keywords,
        thumbnail,
        lastUpdated,
        createdTime,
        author,
        category,
        slug,
        blocks_source,
        blocks,
      },
    },
  };
};

export default Note;

function generateTextStyleArray(style) {
  const textStyles = [];
  const allowedProperties = [
    "bold",
    "italic",
    "strikethrough",
    "underline",
    "code",
    "color",
  ];
  for (const property of allowedProperties) {
    if (style.hasOwnProperty(property) && style[property]) {
      if (property === "color") {
        textStyles.push(`text-color-${style[property]}`);
      } else {
        textStyles.push(`text-${property}`);
      }
    }
  }

  //Set text-strikethrough-underline if both of there exits
  let textStrikethroughIndex = textStyles.indexOf("text-strikethrough");
  let textUnderlineIndex = textStyles.indexOf("text-underline");

  if (textStrikethroughIndex !== -1 && textUnderlineIndex !== -1) {
    textStyles.splice(
      Math.min(textStrikethroughIndex, textUnderlineIndex),
      2,
      "text-strikethrough-underline"
    );
  }

  return textStyles;
}

function getText(block, results) {
  const type = block.type;
  if (block[type].rich_text.length) {
    results.push({
      type: type,
      content: block[type].rich_text.map((rt) => {
        return {
          plain_text: rt.plain_text,
          style: generateTextStyleArray(rt.annotations),
          href: rt.href,
        };
      }),
    });
  }
}

function getImg(block, results) {
  const type = block.type;
  results.push({
    type: type,
    url: block[type][block[type].type].url,
  });
}

function getCode(block, results) {
  const type = block.type;
  if (block[type].rich_text.length) {
    results.push({
      type: type,
      language: block[type].language,
      content: block[type].rich_text[0].plain_text,
    });
  }
}
