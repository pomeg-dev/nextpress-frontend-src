// type PageProps = {
//   params: {
//     slug: string;
//   };
// };

// export default async function Page(props: PageProps) {
//   return <div>status</div>;
// }
import { prettyPrintJson } from "pretty-print-json";
import { getSettings } from "@/lib/api";

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function Page(props: PageProps) {
  const settings = await getSettings();
  return (
    <main id="main" className="text-black">
      <div
        dangerouslySetInnerHTML={{
          __html: prettyPrintJson.toHtml(process.env),
        }}
      />
      <div
        dangerouslySetInnerHTML={{ __html: prettyPrintJson.toHtml(settings) }}
      />
    </main>
  );
}
