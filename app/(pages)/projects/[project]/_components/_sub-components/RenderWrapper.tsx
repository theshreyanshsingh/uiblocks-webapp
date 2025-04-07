// 'use client';

// import React, { useState, useRef, useEffect } from 'react';

// interface BlueBoxWrapperProps {
//   children: React.ReactNode;
// }

// export const BlueBoxWrapper: React.FC<BlueBoxWrapperProps> = ({ children }) => {
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [box, setBox] = useState<{ startX: number; startY: number; width: number; height: number } | null>(null);
//   const [drawnBox, setDrawnBox] = useState<{ id: number; x: number; y: number; width: number; height: number } | null>(
//     null,
//   );
//   const [inputValue, setInputValue] = useState('');
//   const [showInput, setShowInput] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const iframeRef = useRef<HTMLIFrameElement>(null); // Ref for the iframe

//   const handleMouseDown = (e: React.MouseEvent) => {
//     // Don't start if on input/button or inside the iframe (handled separately)
//     if (
//       e.target instanceof HTMLInputElement ||
//       e.target instanceof HTMLButtonElement ||
//       (iframeRef.current && iframeRef.current.contains(e.target as Node))
//     ) {
//       return;
//     }

//     setDrawnBox(null);
//     setShowInput(false);

//     const containerRect = containerRef.current!.getBoundingClientRect();
//     const startX = e.clientX - containerRect.left;
//     const startY = e.clientY - containerRect.top;

//     setIsDrawing(true);
//     setBox({ startX, startY, width: 0, height: 0 });
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!isDrawing) return;

//     const containerRect = containerRef.current!.getBoundingClientRect();
//     const currentX = e.clientX - containerRect.left;
//     const currentY = e.clientY - containerRect.top;

//     setBox((prevBox) => ({
//       ...prevBox!,
//       width: currentX - prevBox!.startX,
//       height: currentY - prevBox!.startY,
//     }));
//   };

//   const handleMouseUp = () => {
//     if (isDrawing && box && (Math.abs(box.width) > 5 || Math.abs(box.height) > 5)) {
//       const newBox = {
//         id: Date.now(),
//         x: box.width > 0 ? box.startX : box.startX + box.width,
//         y: box.height > 0 ? box.startY : box.startY + box.height,
//         width: Math.abs(box.width),
//         height: Math.abs(box.height),
//       };
//       setDrawnBox(newBox);
//       setShowInput(true);
//       setInputValue('');
//     }
//     setIsDrawing(false);
//     setBox(null);
//   };

//   const handleInputChange = (value: string) => {
//     setInputValue(value);
//   };

//   const handleCancel = () => {
//     setDrawnBox(null);
//     setShowInput(false);
//     setInputValue('');
//   };

//   // --- iframe event handlers ---
//   const handleIframeMouseDown = (e: MouseEvent) => {
//     if (!iframeRef.current) return;
//     // Clear any drawn box when starting a new one, even in the iframe
//     setDrawnBox(null);
//     setShowInput(false);

//     const iframeRect = iframeRef.current.getBoundingClientRect();
//     const startX = e.clientX - iframeRect.left;
//     const startY = e.clientY - iframeRect.top;

//     setIsDrawing(true);
//     setBox({ startX, startY, width: 0, height: 0 });
//   };

//   const handleIframeMouseMove = (e: MouseEvent) => {
//     if (!isDrawing || !iframeRef.current) return;
//     const iframeRect = iframeRef.current.getBoundingClientRect();
//     const currentX = e.clientX - iframeRect.left;
//     const currentY = e.clientY - iframeRect.top;

//     setBox((prevBox) => ({
//       ...prevBox!,
//       width: currentX - prevBox!.startX,
//       height: currentY - prevBox!.startY,
//     }));
//   };

//   useEffect(() => {
//     const iframe = iframeRef.current;
//     if (iframe) {
//       // Use 'load' event to ensure iframe content is ready
//       const attachListeners = () => {
//         if (!iframe.contentWindow) return;
//         iframe.contentWindow.addEventListener('mousedown', handleIframeMouseDown);
//         iframe.contentWindow.addEventListener('mousemove', handleIframeMouseMove);
//         iframe.contentWindow.addEventListener('mouseup', handleMouseUp); // Use the same mouseup as parent
//       };
//       //safari compitable.
//       if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
//         attachListeners();
//       } else {
//         iframe.onload = attachListeners;
//       }

//       return () => {
//         if (!iframe.contentWindow) return;

//         iframe.contentWindow.removeEventListener('mousedown', handleIframeMouseDown);
//         iframe.contentWindow.removeEventListener('mousemove', handleIframeMouseMove);
//         iframe.contentWindow.removeEventListener('mouseup', handleMouseUp);
//       };
//     }
//   }, [iframeRef, isDrawing]); // Re-run effect if iframeRef changes

//   return (
//     <div className="w-full h-full relative">
//       <div
//         ref={containerRef}
//         className="w-full h-full relative overflow-hidden cursor-crosshair"
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//       >
//         {/* Wrapped children (including the iframe) */}
//         {React.Children.map(children, (child) => {
//           if (React.isValidElement(child) && child.type === 'iframe') {
//             // Clone the iframe and add the ref
//             return React.cloneElement(child, { ref: iframeRef });
//           }
//           return child;
//         })}

//         {/* Currently drawing box */}
//         {isDrawing && box && (
//           <div
//             className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 pointer-events-none"
//             style={{
//               left: `${box.width > 0 ? box.startX : box.startX + box.width}px`,
//               top: `${box.height > 0 ? box.startY : box.startY + box.height}px`,
//               width: `${Math.abs(box.width)}px`,
//               height: `${Math.abs(box.height)}px`,
//             }}
//           />
//         )}

//         {/* Drawn box */}
//         {drawnBox && (
//           <div>
//             <div
//               className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30"
//               style={{
//                 left: `${drawnBox.x}px`,
//                 top: `${drawnBox.y}px`,
//                 width: `${drawnBox.width}px`,
//                 height: `${drawnBox.height}px`,
//               }}
//             />

//             {/* Input field below the box */}
//             {showInput && (
//               <div
//                 className="absolute flex items-center bg-white border border-gray-300 rounded shadow-sm"
//                 style={{
//                   left: `${drawnBox.x}px`,
//                   top: `${drawnBox.y + drawnBox.height + 4}px`,
//                   width: `${Math.max(drawnBox.width, 200)}px`,
//                 }}
//               >
//                 <input
//                   type="text"
//                   value={inputValue}
//                   onChange={(e) => handleInputChange(e.target.value)}
//                   className="flex-grow px-2 py-1 outline-none"
//                   placeholder="Enter description..."
//                   autoFocus
//                 />
//                 <button onClick={handleCancel} className="px-2 py-1 text-red-500 hover:text-red-700">
//                   Cancel
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
