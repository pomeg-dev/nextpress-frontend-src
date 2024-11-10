// "use client";

// import { useEffect, useLayoutEffect, useRef, useState } from "react";
// import { usePathname, useSearchParams } from "next/navigation";
// import { animate, inView, scroll } from "framer-motion";
// import ReactDOM from "react-dom";
// import CloseButton from "ui-old/components/atoms/CloseButton";

// // modalObject is for modals that have been added via gutenberg with claass ".modal-object" it relies on a group within a group
// export default function ModalObject({ settings }: { settings: any }) {
//   const pathname = usePathname();
//   //useEffect for opening modal (setting scale to 1), it opens if if an anchor tag is clicked and there is a modal with the same id
//   useEffect(() => {
//     // click lsitnere for all anchor tags
//     document.querySelectorAll("a").forEach((a) => {
//       //if the anchor tag has a anchor tag
//       if (a.href.includes("#")) {
//         //get the id of the modal
//         const id = a.href.split("#")[1];
//         //if the modal exists
//         if (
//           document.getElementById(id) &&
//           document.getElementById(id)?.classList.contains("modal-object")
//         ) {
//           //add click listener to the anchor tag
//           a.addEventListener("click", (e) => {
//             //open the modal
//             const modalElement = document.getElementById(id);
//             console.log(modalElement);
//             if (modalElement) {
//               e.preventDefault();
//               modalElement.classList.add("open");
//             }
//           });
//         }
//       }
//     });

//     //inject React <CloseButton /> into all modals
//     document.querySelectorAll(".modal-object").forEach((modal) => {
//       // modal content is the second level .core-group
//       const modalContent = modal.querySelector(".core-group");
//       if (!modalContent) return;
//       const closeButton = document.createElement("div");
//       closeButton.classList.add("close-button-container");
//       closeButton.onclick = () => modal.classList.remove("open");
//       modalContent.appendChild(closeButton);
//       ReactDOM.render(<CloseButton setOpen={false} />, closeButton);
//     });

//     //click listener for all close buttons
//     document.querySelectorAll(".modal-object").forEach((modal) => {
//       //add click listener to the close button
//       modal.addEventListener("click", (e) => {
//         e.preventDefault();

//         //if the target or immediate parent is the modal-object, close it
//         if (e.target === modal || e.target === modal.children[0]) {
//           //close the modal
//           console.log("close");
//           modal.classList.remove("open");
//         }
//       });
//     });
//   }, [pathname]);

//   return <></>;
// }
