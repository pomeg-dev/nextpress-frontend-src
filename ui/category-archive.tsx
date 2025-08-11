import { getTaxTerm, getTaxTerms } from "@/lib/wp/posts";
import { Feed } from "@ui/components/archive/Feed";
import Loader from "@ui/components/atoms/Loader";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function CategoryArchive({
  taxonomy,
  term
}: {
  taxonomy: string;
  term: string;
}) {
  const termObject = await getTaxTerm(taxonomy, term);
  if (!termObject || termObject.length < 1) {
    notFound();
  }

  const allowedTerms = ["business-of-luxury", "glion-spirit", "hospitality-uncovered", "leadership-insights", "living-well", "podcast"];
  const allTerms = await getTaxTerms(taxonomy);
  const filteredTerms = allTerms.filter((term: { slug: string; }) => allowedTerms.includes(term.slug));

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
    redirect_on_filter: true,
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
        terms: filteredTerms,
        type: "select"
      }
    ]
  };

  return (
    <Suspense fallback={<Loader isLoading={true} />}>
      <main data-pageurl={`${taxonomy}/${term}`} data-termid={termObject.term_id}>
        <Feed data={archiveData} />
      </main>
    </Suspense>
  );
}