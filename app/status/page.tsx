// type PageProps = {
//   params: {
//     slug: string;
//   };
// };

export default async function Page() {
  return <div>status</div>;
}
// import { AccordionElement } from "ui/components/molecules/AccordionElement";
// import { prettyPrintJson } from "pretty-print-json";
// import { getSettings } from "lib/api";

// type PageProps = {
//   params: {
//     slug: string;
//   };
// };

// export default async function Page(props: PageProps) {
//   const settings = await getSettings();
//   return (
//     <main id="main" className="text-black">
//       <AccordionElement title={"Vercel env"} attrs={null}>
//         <div
//           dangerouslySetInnerHTML={{
//             __html: prettyPrintJson.toHtml(process.env),
//           }}
//         />
//       </AccordionElement>
//       <AccordionElement title={"Settings Array"} attrs={null}>
//         <div
//           dangerouslySetInnerHTML={{ __html: prettyPrintJson.toHtml(settings) }}
//         />
//       </AccordionElement>
//     </main>
//   );
// }
