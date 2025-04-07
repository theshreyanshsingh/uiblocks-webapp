// 'use client';

// import { useSandpack, useSandpackClient } from '@codesandbox/sandpack-react';
// import React, { useEffect, useRef } from 'react';
// // import { BlueBoxWrapper } from './RenderWrapper';

// const EditableCanvas = () => {
//   const { sandpack } = useSandpack();
//   // const { iframe } = useSandpackClient();
//   // const styleRef = useRef(null);

//   // const sender = () => {
//   //   console.log('sent');
//   //   Object.values(sandpack.clients).forEach((client) => {
//   //     client.iframe.contentWindow.postMessage('Hello world', '*');
//   //   });
//   };

//   const handleSelection = (selectedElements: HTMLElement[]) => {
//     console.log('Selected Elements:', selectedElements);

//     // Example of adding a class to selected elements
//     selectedElements.forEach((el) => {
//       el.classList.add('bg-red-200'); // Add a class for visual indication
//     });

//     //remove the select elements
//     //.classList.remove('your-selected-class')
//   };

//   return (
//     <div className="rounded-md h-full w-full">
//       {/* <div onClick={sender}>do it</div> */}
//       <BlueBoxWrapper>
//         <></>
//         {/* <></>
//       <iframe
//         ref={iframe}
//         className="w-full h-full border-none"
//         title="Sandpack Preview"
//         sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals allow-popups allow-presentation"
//       /> */}
//       </BlueBoxWrapper>
//     </div>
//   );
// };

// export default EditableCanvas;
