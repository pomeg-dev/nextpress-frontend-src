// import { getPlaiceholder } from "plaiceholder";

// export async function getBlurBase64(src: string) {
//   const { base64 } = src ? await getImage(src) : { base64: false };
//   return base64;
// }

// const getImage = async (src: string) => {
//   const buffer = await fetch(src).then(async (res) =>
//     Buffer.from(await res.arrayBuffer())
//   );

//   const {
//     metadata: { height, width },
//     ...plaiceholder
//   } = await getPlaiceholder(buffer, { size: 10 });

//   return {
//     ...plaiceholder,
//     img: { src, height, width },
//   };
// };
export async function getBlurBase64(src: string) {
  return null;
}
