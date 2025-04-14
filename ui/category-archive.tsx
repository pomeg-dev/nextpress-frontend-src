import { getTaxTerm } from "@/lib/wp/posts";
import { Feed } from "@ui/components/archive/Feed";

export default async function CategoryArchive({
  taxonomy,
  term
}: {
  taxonomy: string;
  term: string;
}) {
  const termObject = await getTaxTerm(taxonomy, term);
  const archiveData = {
    post_type: 'post',
    number_of_posts: '12',
    show_search: false,
    search_field_label: '',
    search_field_placeholder: '',
    load_more: 'pagination',
    load_more_text: 'Load More',
    show_post_count: false,
    show_reset: false,
    update_url: false,
    heading: `<h1><span className="text-heading-xl">${termObject.name}</span></h1>`,
    description: termObject.description,
    tax_query: [
      { taxonomy: taxonomy, term: term }
    ],
    taxonomy_filters: [
      {
        label: "",
        placeholder: "All",
        taxonomy: taxonomy, 
        terms: [
          { term_id: termObject.term_id, slug: term, name: termObject.name }
        ],
        type: "button"
      }
    ]
  };

  return (
    <main data-pageurl={`${taxonomy}/${term}`} data-termid={termObject.term_id}>
      <Feed data={archiveData} />
    </main>
  );
}